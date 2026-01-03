# PDF Diff

> 🔒 Compare PDF documents privately and securely in your browser. No uploads, no servers, 100% client-side processing.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://www.pdf-diff.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/jamesmontemagno/pdf-diff)](https://github.com/jamesmontemagno/pdf-diff/stargazers)

![PDF Diff Screenshot](https://github.com/user-attachments/assets/25448695-50dc-4b62-b6e0-3cb0d506774a)

**[Try it now at www.pdf-diff.com →](https://www.pdf-diff.com)**

## ✨ Features

### 🔐 Privacy-First Design
- **100% Private & Secure** - Your PDFs never leave your device
- **No Server Uploads** - Zero data transmission, zero risk
- **Works Offline** - Once loaded, no internet connection required
- **Open Source** - Inspect the code yourself to verify our privacy claims

### 📊 Powerful Comparison Views
- **Side-by-Side View** - Compare documents with synchronized scrolling
- **Unified View** - See all changes inline with color coding
- **Additions Only** - View only what was added
- **Removals Only** - View only what was removed
- **Changes Only** - See additions and removals side-by-side per page

### 🎯 Advanced Features
- **CLI Support** - Use via `npx pdf-diff` for command-line comparisons
- **Multi-Page Support** - Compare entire documents page by page
- **Show All Pages** - View all changes across all pages at once
- **Export to PDF** - Save comparison results as a formatted PDF report
- **Page Navigation** - Quick navigation between pages
- **Statistics Dashboard** - Get instant insights on changes
- **Dark/Light/System Theme** - Choose your preferred appearance
- **Visual HTML/PDF Reports** - Generate shareable diff reports

### 📱 User Experience
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Drag & Drop** - Easy file upload with drag and drop support
- **Real-time Processing** - Instant comparison results
- **Clean Interface** - Intuitive and clutter-free design

## 🚀 Getting Started

### Quick Start with CLI (npx)

Compare PDFs directly from your terminal with zero installation:

```bash
# Basic comparison
npx pdf-diff original.pdf modified.pdf

# Generate only HTML report
npx pdf-diff original.pdf modified.pdf --report html

# CI-friendly: exit with code 1 if differences found
npx pdf-diff original.pdf modified.pdf --fail-on-diff

# Output as JSON for programmatic use
npx pdf-diff original.pdf modified.pdf --format json

# Interactive mode
npx pdf-diff --interactive
```

#### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-r, --report <type>` | Report type: `html`, `pdf`, or `both` | `both` |
| `-o, --out <dir>` | Output directory for reports | `./pdf-diff-report` |
| `--open` / `--no-open` | Open HTML report in browser after completion | `--open` |
| `-f, --format <type>` | Output format: `text`, `json`, or `junit` | `text` |
| `--fail-on-diff` | Exit with code 1 if differences are found | - |
| `-p, --pages <spec>` | Pages to compare (e.g., `1-3,5,7`) | All pages |
| `-t, --threshold <float>` | Change percentage threshold for failure | - |
| `-i, --interactive` | Interactive mode with guided prompts | - |

### Using the Web App

1. Visit **[www.pdf-diff.com](https://www.pdf-diff.com)**
2. Upload or drag your **original PDF**
3. Upload or drag your **modified PDF**
4. View comparison results instantly
5. Switch between view modes as needed
6. Export results to PDF if desired

### Development

```bash
# Clone the repository
git clone https://github.com/jamesmontemagno/pdf-diff.git
cd pdf-diff

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🛠️ Tech Stack

- **[React 19](https://react.dev/)** - Modern UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite](https://vite.dev/)** - Lightning-fast build tool
- **[PDF.js](https://mozilla.github.io/pdf.js/)** - Mozilla's PDF rendering engine
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation for exports
- **[diff](https://github.com/kpdecker/jsdiff)** - Text comparison algorithm

## 🎨 Color Coding

- 🟢 **Green** - Additions (new content)
- 🔴 **Red** - Deletions (removed content)  
- ⚪ **White/Gray** - Unchanged content

## 🔒 Privacy & Security

PDF Diff is built with privacy as the top priority:

1. **No Server Communication** - Files are processed entirely in your browser
2. **No Data Storage** - Nothing is saved or cached
3. **No Tracking** - No analytics or user tracking (except standard web analytics)
4. **No Third-Party APIs** - All processing happens locally
5. **Open Source** - Full transparency, audit the code yourself

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**James Montemagno**
- Website: [montemagno.com](https://montemagno.com)
- GitHub: [@jamesmontemagno](https://github.com/jamesmontemagno)
- Twitter: [@JamesMontemagno](https://twitter.com/JamesMontemagno)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**[Start comparing PDFs now →](https://www.pdf-diff.com)**
