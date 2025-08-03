# CurateMD - Document Curation Tool

A client-side web application for curating documents by providing a split-view interface with a source document viewer and an interactive Markdown editor.

## Features

- **Dual Upload Support**: Upload PDF/DOCX source documents alongside optional Markdown files
- **Split-View Interface**: Resizable panes with document viewer on the left and Markdown editor on the right
- **Document Rendering**: 
  - PDF files rendered using PDF.js with **continuous scroll view** (all pages displayed vertically)
  - DOCX files converted to clean HTML using Mammoth.js
- **Rich Markdown Editor**: Full-featured editor with syntax highlighting using EasyMDE
- **Export Functionality**: Download curated content as Markdown files
- **Client-Side Only**: No server required - runs entirely in the browser for privacy

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Split.js** for resizable panes
- **PDF.js** for PDF rendering
- **Mammoth.js** for DOCX conversion
- **EasyMDE** for markdown editing
- **CSS Modules** for styling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy PDF.js worker (if not already present):
   ```bash
   cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/pdf.worker.min.js
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### File Upload Workflow

1. **Staging Phase**: 
   - Drag and drop or browse for files
   - Upload a source document (PDF or DOCX)
   - Optionally upload an existing Markdown file, or start with a blank document
   - Click "Load Documents" to proceed

2. **Active Curation Phase**:
   - View the source document in the left pane with **continuous scrolling** through all pages
   - Edit markdown content in the right pane with **independent scrolling** (no page interference)
   - **Side-by-side content comparison** - scroll markdown while keeping PDF content visible
   - **Bidirectional scroll sync** - switch between edit and preview modes while maintaining your exact position
   - Use the toolbar for formatting options (bold, italic, headings, lists, links, etc.)
   - Export your curated content using the "Export .md" button

### Supported File Types

- **Source Documents**: PDF (.pdf), Word Documents (.docx)
- **Markdown Files**: Markdown (.md)
- **File Size Limits**: 50MB for source documents, 10MB for markdown files

### Keyboard Shortcuts

The markdown editor supports standard shortcuts:
- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + K**: Insert link
- **F11**: Toggle fullscreen
- **Ctrl/Cmd + Alt + P**: Toggle preview (with scroll position sync)

## File Structure

```
src/
├── components/          # React components
│   ├── App.module.css
│   ├── FileUploadStagingArea.tsx
│   ├── FileViewer.tsx
│   ├── MainView.tsx
│   └── MarkdownCurator.tsx
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── fileValidation.ts
│   └── errorHandling.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Browser Compatibility

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Privacy

This application processes all files entirely in your browser. No data is sent to any server, ensuring complete privacy of your documents.