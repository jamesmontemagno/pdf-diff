import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import open from 'open';
import { input, confirm, select } from '@inquirer/prompts';

import { extractTextFromPDFFile, parsePageSpec, type PDFDocument } from './pdfUtils.js';
import { computeTextDiff, computeStats, combineStats, hasChanges, type PageDiff, type DiffStats } from './diffUtils.js';
import { 
  generateHtmlReport, 
  generateTextOutput, 
  generateJsonOutput, 
  generateJunitOutput,
  type ReportData 
} from './reportGenerator.js';

const VERSION = '1.0.0';

interface CliOptions {
  report: 'html' | 'pdf' | 'both';
  out: string;
  open: boolean;
  format: 'text' | 'json' | 'junit';
  failOnDiff: boolean;
  pages?: string;
  threshold?: number;
  interactive: boolean;
}

async function interactiveMode(): Promise<{ originalPath: string; modifiedPath: string; options: Partial<CliOptions> }> {
  console.log(chalk.cyan.bold('\n📄 PDF Diff - Interactive Mode\n'));

  const originalPath = await input({
    message: 'Path to the original PDF file:',
    validate: (value: string) => {
      if (!value.trim()) return 'Please enter a file path';
      if (!fs.existsSync(value)) return 'File not found';
      if (!value.toLowerCase().endsWith('.pdf')) return 'File must be a PDF';
      return true;
    },
  });

  const modifiedPath = await input({
    message: 'Path to the modified PDF file:',
    validate: (value: string) => {
      if (!value.trim()) return 'Please enter a file path';
      if (!fs.existsSync(value)) return 'File not found';
      if (!value.toLowerCase().endsWith('.pdf')) return 'File must be a PDF';
      return true;
    },
  });

  const report = await select({
    message: 'Report format:',
    choices: [
      { name: 'Both HTML and PDF', value: 'both' },
      { name: 'HTML only', value: 'html' },
      { name: 'PDF only', value: 'pdf' },
    ],
    default: 'both',
  }) as 'html' | 'pdf' | 'both';

  const out = await input({
    message: 'Output directory:',
    default: './pdf-diff-report',
  });

  const openReport = await confirm({
    message: 'Open report in browser when complete?',
    default: true,
  });

  return {
    originalPath,
    modifiedPath,
    options: {
      report,
      out,
      open: openReport,
    },
  };
}

async function generatePdfReport(htmlPath: string, pdfPath: string): Promise<void> {
  const spinner = ora('Generating PDF report...').start();
  
  try {
    const { chromium } = await import('playwright');
    
    // Try to launch browser, install if necessary
    let browser;
    try {
      browser = await chromium.launch();
    } catch {
      spinner.text = 'Installing browser for PDF generation...';
      // Browser not installed, try to install it
      const { execSync } = await import('child_process');
      try {
        execSync('npx playwright install chromium', { stdio: 'pipe' });
        browser = await chromium.launch();
      } catch {
        spinner.fail('Could not install browser for PDF generation');
        console.log(chalk.yellow('  Tip: Run "npx playwright install chromium" manually'));
        return;
      }
    }
    
    const page = await browser.newPage();
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    await page.setContent(htmlContent, { waitUntil: 'networkidle' });
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      printBackground: true,
    });
    
    await browser.close();
    spinner.succeed(`PDF report saved to ${chalk.cyan(pdfPath)}`);
  } catch (error) {
    spinner.fail('Failed to generate PDF report');
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red(`  Error: ${message}`));
  }
}

async function comparePdfs(
  originalPath: string, 
  modifiedPath: string, 
  options: CliOptions
): Promise<boolean> {
  const spinner = ora('Loading PDF files...').start();
  
  let originalDoc: PDFDocument;
  let modifiedDoc: PDFDocument;
  
  try {
    [originalDoc, modifiedDoc] = await Promise.all([
      extractTextFromPDFFile(originalPath),
      extractTextFromPDFFile(modifiedPath),
    ]);
    spinner.succeed('PDF files loaded successfully');
  } catch (error) {
    spinner.fail('Failed to load PDF files');
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red(`  Error: ${message}`));
    process.exit(1);
  }

  // Determine which pages to compare
  const maxPages = Math.max(originalDoc.totalPages, modifiedDoc.totalPages);
  let pagesToCompare: number[];
  
  if (options.pages) {
    pagesToCompare = parsePageSpec(options.pages, maxPages);
    if (pagesToCompare.length === 0) {
      console.error(chalk.red('Error: No valid pages specified'));
      process.exit(1);
    }
  } else {
    pagesToCompare = Array.from({ length: maxPages }, (_, i) => i + 1);
  }

  // Compute diffs
  const diffSpinner = ora('Computing differences...').start();
  const pageDiffs: PageDiff[] = [];
  const allStats: DiffStats[] = [];

  for (const pageNum of pagesToCompare) {
    const originalText = originalDoc.pages[pageNum - 1]?.text || '';
    const modifiedText = modifiedDoc.pages[pageNum - 1]?.text || '';
    const parts = computeTextDiff(originalText, modifiedText);
    const pageStats = computeStats(parts);
    allStats.push(pageStats);
    
    pageDiffs.push({
      pageNumber: pageNum,
      parts,
      hasChanges: hasChanges(parts),
    });
  }

  const overallStats = combineStats(allStats);
  const hasDifferences = pageDiffs.some(p => p.hasChanges);
  
  // Apply threshold if specified
  const exceedsThreshold = options.threshold !== undefined 
    ? overallStats.changePercentage > options.threshold 
    : hasDifferences;
  
  diffSpinner.succeed('Differences computed');

  // Prepare report data
  const reportData: ReportData = {
    originalDoc,
    modifiedDoc,
    pageDiffs,
    overallStats,
    generatedAt: new Date().toLocaleString(),
  };

  // Output based on format
  if (options.format === 'json') {
    console.log(generateJsonOutput(reportData));
  } else if (options.format === 'junit') {
    console.log(generateJunitOutput(reportData));
  } else {
    // Text format - print summary
    console.log('');
    console.log(generateTextOutput(reportData));
  }

  // Generate reports
  const outDir = path.resolve(options.out);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const htmlPath = path.join(outDir, 'report.html');
  const pdfPath = path.join(outDir, 'report.pdf');

  if (options.report === 'html' || options.report === 'both') {
    const htmlSpinner = ora('Generating HTML report...').start();
    const htmlContent = generateHtmlReport(reportData);
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    htmlSpinner.succeed(`HTML report saved to ${chalk.cyan(htmlPath)}`);
  }

  if (options.report === 'pdf' || options.report === 'both') {
    // Ensure HTML exists for PDF generation
    if (options.report === 'pdf') {
      const htmlContent = generateHtmlReport(reportData);
      fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    }
    await generatePdfReport(htmlPath, pdfPath);
    
    // Remove temporary HTML if only PDF was requested
    if (options.report === 'pdf' && fs.existsSync(htmlPath)) {
      fs.unlinkSync(htmlPath);
    }
  }

  // Open report in browser
  if (options.open && fs.existsSync(htmlPath)) {
    console.log(chalk.cyan('\nOpening report in browser...'));
    await open(htmlPath);
  }

  // Print final summary
  console.log('');
  if (hasDifferences) {
    const changedCount = pageDiffs.filter(p => p.hasChanges).length;
    console.log(chalk.yellow(`⚠️  ${changedCount} of ${pageDiffs.length} pages have differences`));
    console.log(chalk.yellow(`   ${overallStats.changePercentage.toFixed(1)}% of content changed`));
  } else {
    console.log(chalk.green('✓ PDFs are identical'));
  }
  console.log('');

  return exceedsThreshold;
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('pdf-diff')
    .description('Compare PDF documents and generate visual diff reports')
    .version(VERSION)
    .argument('[original]', 'Path to the original PDF file')
    .argument('[modified]', 'Path to the modified PDF file')
    .option('-r, --report <type>', 'Report type: html, pdf, or both', 'both')
    .option('-o, --out <dir>', 'Output directory for reports', './pdf-diff-report')
    .option('--open', 'Open HTML report in browser after completion', true)
    .option('--no-open', 'Do not open report in browser')
    .option('-f, --format <type>', 'Output format: text, json, or junit', 'text')
    .option('--fail-on-diff', 'Exit with code 1 if differences are found')
    .option('-p, --pages <spec>', 'Pages to compare (e.g., "1-3,5,7")')
    .option('-t, --threshold <float>', 'Change percentage threshold for failure', parseFloat)
    .option('-i, --interactive', 'Interactive mode with guided prompts')
    .addHelpText('after', `
Examples:
  $ npx pdf-diff original.pdf modified.pdf
  $ npx pdf-diff original.pdf modified.pdf --report html --out ./my-report
  $ npx pdf-diff original.pdf modified.pdf --format json
  $ npx pdf-diff original.pdf modified.pdf --pages "1-5,10"
  $ npx pdf-diff original.pdf modified.pdf --fail-on-diff
  $ npx pdf-diff --interactive

For more information, visit: https://www.pdf-diff.com
`);

  program.parse();

  const args = program.args;
  const opts = program.opts();

  let originalPath: string;
  let modifiedPath: string;
  let options: CliOptions;

  // Interactive mode
  if (opts.interactive || args.length === 0) {
    if (args.length === 0 && !opts.interactive) {
      console.log(chalk.cyan('\nNo files specified. Starting interactive mode...\n'));
    }
    
    const result = await interactiveMode();
    originalPath = result.originalPath;
    modifiedPath = result.modifiedPath;
    options = {
      report: result.options.report || 'both',
      out: result.options.out || './pdf-diff-report',
      open: result.options.open ?? true,
      format: opts.format || 'text',
      failOnDiff: opts.failOnDiff || false,
      pages: opts.pages,
      threshold: opts.threshold,
      interactive: true,
    };
  } else {
    // Non-interactive mode
    if (args.length < 2) {
      console.error(chalk.red('Error: Please provide paths to both PDF files'));
      console.log(chalk.gray('Usage: pdf-diff <original.pdf> <modified.pdf> [options]'));
      console.log(chalk.gray('       pdf-diff --interactive'));
      process.exit(1);
    }

    originalPath = args[0];
    modifiedPath = args[1];

    // Validate files exist
    if (!fs.existsSync(originalPath)) {
      console.error(chalk.red(`Error: Original file not found: ${originalPath}`));
      process.exit(1);
    }
    if (!fs.existsSync(modifiedPath)) {
      console.error(chalk.red(`Error: Modified file not found: ${modifiedPath}`));
      process.exit(1);
    }

    options = {
      report: opts.report as 'html' | 'pdf' | 'both',
      out: opts.out,
      open: opts.open,
      format: opts.format as 'text' | 'json' | 'junit',
      failOnDiff: opts.failOnDiff || false,
      pages: opts.pages,
      threshold: opts.threshold,
      interactive: false,
    };
  }

  // Run comparison
  const hasDifferences = await comparePdfs(originalPath, modifiedPath, options);

  // Exit with appropriate code
  if (options.failOnDiff && hasDifferences) {
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error.message);
  process.exit(1);
});
