import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist-cli');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build the CLI
await esbuild.build({
  entryPoints: [path.join(__dirname, '..', 'src', 'cli', 'index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: path.join(distDir, 'cli.mjs'),
  external: [
    // Keep node built-ins external
    'node:*',
    // Keep these npm packages external - they have native/complex deps
    'playwright',
    'pdfjs-dist',
    // Keep all CLI deps external since they're in package.json
    'commander',
    'chalk',
    'ora',
    'open',
    '@inquirer/prompts',
    'inquirer',
    'diff',
  ],
  banner: {
    js: '#!/usr/bin/env node\n',
  },
  sourcemap: false,
  minify: false,
});

console.log('CLI built successfully to dist-cli/cli.mjs');
