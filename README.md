# PDF Diff

A private and secure PDF comparison tool that runs entirely in your browser.

![PDF Diff Screenshot](https://github.com/user-attachments/assets/25448695-50dc-4b62-b6e0-3cb0d506774a)

## Features

- **🔒 100% Private & Secure** - Your PDFs never leave your device. All processing happens locally in your browser.
- **📄 Side-by-Side Comparison** - View changes highlighted in both documents side by side.
- **➕ Additions View** - See only what was added in the modified document.
- **➖ Removals View** - See only what was removed from the original document.
- **📊 Unified View** - See all changes in a single, inline view.
- **📈 Statistics** - Get a quick overview of additions, removals, and unchanged content.
- **📱 Responsive Design** - Works on desktop and mobile devices.
- **🌙 Dark/Light Mode** - Automatically adapts to your system preferences.

## Why Choose PDF Diff?

- **No Server Uploads** - Your documents are never sent to any server. Zero data transmission means zero risk.
- **Browser-Based Processing** - All PDF parsing and comparison happens entirely within your browser using JavaScript.
- **Works Offline** - Once loaded, the app works completely offline. No internet connection required.
- **Open Source** - Our code is open source. Inspect it yourself to verify our privacy claims.

## Getting Started

### Using the App

1. Visit [https://jamesmontemagno.github.io/pdf-diff/](https://jamesmontemagno.github.io/pdf-diff/)
2. Drop or select your original PDF
3. Drop or select your modified PDF
4. View the comparison results

### Development

```bash
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

## Tech Stack

- [React](https://react.dev/) - UI Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Vite](https://vite.dev/) - Build Tool
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF Parsing
- [diff](https://github.com/kpdecker/jsdiff) - Text Comparison

## License

MIT License - See [LICENSE](LICENSE) for details.
