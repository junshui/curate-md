# CurateMD - Document Curation Tool

A client-side web application for curating documents by providing a split-view interface with a source document viewer and an interactive Markdown editor.

---

## Features

- **Dual Upload Support**: Upload Markdown files alongside optional PDF/DOCX source documents
- **Flexible Three-Panel Interface**: Resizable panes with **toggleable visibility** for optimal workflow:
  - **📄 Source Panel**: Original document viewer (PDF/DOCX)
  - **✏️ Editor Panel**: Markdown editing panel
  - **👁️ Preview Panel**: Live markdown preview
  - **Panel Controls**: Toggle any panel on/off via toolbar buttons for performance and focus (source panel only available when source document is loaded)
- **Document Rendering**: 
  - PDF files rendered using PDF.js with **continuous scroll view** (all pages displayed vertically as images for performance)
  - DOCX files converted to clean HTML using Mammoth.js
- **High-Performance Markdown Editor**: 
  - Full-featured editor with syntax highlighting using `@uiw/react-md-editor`
  - Custom toolbar (bold, italic, strikethrough, lists, tables, etc.) and keyboard shortcuts
  - **Performance optimized**: Debounced preview updates and conditional rendering for fast typing
- **Export Functionality**: Download curated content as Markdown files at any time
- **File Upload Staging**: Drag-and-drop or browse for files, with clear rejection and error messages for unsupported or extra files
- **Client-Side Only**: No server required - runs entirely in the browser for privacy

---

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Split.js** for resizable panes
- **PDF.js** for PDF rendering (local worker required)
- **Mammoth.js** for DOCX conversion
- **@uiw/react-md-editor** for markdown editing
- **CSS Modules** for styling

---

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
3. **Copy PDF.js worker (required for PDF viewing):**
   ```bash
   cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/pdf.worker.min.js
   ```
   > If you skip this step, PDF viewing will not work. Make sure the worker file is present in `public/`.
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

---

## Usage

### File Upload & Curation Workflow

1. **Staging Phase**: 
   - Drag and drop or browse for files
   - Upload a Markdown file (required) - either upload an existing file or start with a blank document
   - Optionally upload a source document (PDF or DOCX) for reference
   - Only one source document and one Markdown file can be staged at a time; extra files are rejected and listed with reasons
   - Click "Load Documents" to proceed

2. **Active Curation Phase**:
   - Work in a **flexible panel layout** (all panels scroll independently):
     - **📄 Source Panel**: View the original document (PDF/DOCX) with continuous scroll (only visible when source document is loaded)
     - **✏️ Editor Panel**: Edit markdown content with a rich, high-performance editor
     - **👁️ Preview Panel**: See a live preview of your markdown as you edit
   - **Panel Management**:
     - **Toggle Controls**: Use toolbar buttons to show/hide any panel (📄 Source, ✏️ Editor, 👁️ Preview)
     - **Performance Boost**: Hide preview panel for faster editing response during intensive writing
     - **Focus Mode**: Show only the editor panel to eliminate distractions
     - **Source Panel Auto-Hide**: Source panel is automatically hidden when no source document is loaded
     - **Flexible Layouts**: Single panel (100%), dual panels (50%/50%), or triple panels (33%/34%/33%)
   - Use the toolbar for formatting options (bold, italic, headings, lists, links, tables, etc.)
   - Export your curated content using the "Export .md" button at any time

### Supported File Types

- **Source Documents**: PDF (.pdf), Word Documents (.docx) - **Optional**
- **Markdown Files**: Markdown (.md) - **Required**
- **File Size Limits**: 50MB for source documents, 10MB for markdown files

### File Rejection & Error Handling

- A Markdown file is required to proceed. Source documents are optional but only one of each type can be staged at a time. Extra files are rejected and listed with reasons.
- Unsupported file types or files exceeding size limits are rejected with clear error messages.
- Rejected files are shown in a list and can be cleared.
- Loading and error states are clearly indicated during document processing and rendering.

### Markdown Editor Features

- **High-Performance Editor** powered by `@uiw/react-md-editor` with optimizations:
  - Custom toolbar: Bold, italic, strikethrough, horizontal rule, blockquote
  - Unordered/ordered/checked lists, links, images, tables
  - **Performance optimized**: Debounced preview updates (300ms) for smooth typing
  - **React memoization**: Prevents unnecessary re-renders and processing
- Clean, focused editing experience with full height and responsive layout
- **Panel Control Benefits**:
  - Hide preview panel for maximum editing performance during intensive writing
  - Focus mode: Show only editor panel to eliminate distractions
  - Flexible workflow: Toggle between editing and preview as needed
- Keyboard shortcuts:
  - **Ctrl/Cmd + B**: Bold
  - **Ctrl/Cmd + I**: Italic
  - **Ctrl/Cmd + K**: Insert link
  - **F11**: Toggle fullscreen
  - **Ctrl/Cmd + Alt + P**: Toggle preview (with scroll position sync)

---

## File Structure

- Project Root
  - `README.md`              # Project documentation
  - `package.json`           # NPM package manifest
  - `package-lock.json`      # NPM lockfile
  - `tsconfig.json`          # TypeScript configuration
  - `vite.config.ts`         # Vite build configuration
  - `.gitignore`             # Git ignore rules
  - `index.html`             # Main HTML entry point
  - `tsconfig.tsbuildinfo`   # TypeScript build info (generated)
  - `src/`                   # Application source code (see below)
  - `public/`                # Static assets
    - `pdf.worker.min.js`    # PDF.js worker for PDF rendering
    - `vite.svg`             # Vite logo (default)
  - `scripts/`               # Project scripts
    - `setup.js`             # Setup script

- `src/`
  - `components/`           # React components and styles
    - `App.module.css`
    - `FileUploadStagingArea.module.css`
    - `FileUploadStagingArea.tsx`
    - `FileViewer.module.css`
    - `FileViewer.tsx`
    - `MainView.module.css`
    - `MainView.tsx`
    - `MarkdownEditor.module.css`
    - `MarkdownEditor.tsx`
    - `MarkdownPreview.module.css`
    - `MarkdownPreview.tsx`
  - `types/`                # TypeScript type definitions
    - `index.ts`
  - `utils/`                # Utility functions
    - `errorHandling.ts`
    - `fileValidation.ts`
  - `App.tsx`               # Main app component
  - `main.tsx`              # App entry point
  - `index.css`             # Global styles
  - `vite-env.d.ts`         # Vite/TypeScript environment types

---

## Browser Compatibility

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

MIT License - see LICENSE file for details.

---

## Privacy

This application processes all files entirely in your browser. No data is sent to any server, ensuring complete privacy of your documents.