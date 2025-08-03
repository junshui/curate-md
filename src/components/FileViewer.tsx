import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import { FileType } from '../types'
import styles from './FileViewer.module.css'

// Set up PDF.js worker - using local copy for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface FileViewerProps {
  content: ArrayBuffer
  type: FileType
  errorMessage: string | null
}

const FileViewer: React.FC<FileViewerProps> = ({ content, type, errorMessage }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [renderedContent, setRenderedContent] = useState<string>('') // For DOCX HTML content
  const [pdfCanvasUrls, setPdfCanvasUrls] = useState<string[]>([]) // Store PDF page data URLs

  // Main rendering effect
  useEffect(() => {
    const renderContent = async () => {
      if (errorMessage) {
        setError(errorMessage)
        setLoading(false)
        return
      }

      if (!content) {
        setError('No content provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setRenderedContent('')
        setPdfCanvasUrls([])
        
        if (type === 'pdf') {
          await renderPDF()
        } else if (type === 'docx') {
          await renderDOCX()
        }
      } catch (err) {
        setError(`Failed to render ${type.toUpperCase()}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    renderContent()
  }, [content, type, errorMessage])

  const renderPDF = async () => {
    try {
      // Validate ArrayBuffer before processing
      if (!content || content.byteLength === 0) {
        throw new Error('PDF content is empty or invalid')
      }

      // Create a copy of the ArrayBuffer to avoid detachment issues
      const contentCopy = content.slice(0)
      
      // Create Uint8Array which is more reliable for PDF.js
      const uint8Array = new Uint8Array(contentCopy)
      
      const pdf = await pdfjsLib.getDocument({ 
        data: uint8Array,
        useSystemFonts: true
      }).promise
      
      setTotalPages(pdf.numPages)
      
      await renderAllPDFPages(pdf)
    } catch (err) {
      throw new Error(`PDF parsing failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }


  const renderAllPDFPages = async (pdf: pdfjsLib.PDFDocumentProxy) => {
    // Calculate optimal scale
    let scale = 1.2
    
    // Get first page to calculate scale
    try {
      const firstPage = await pdf.getPage(1)
      const baseViewport = firstPage.getViewport({ scale: 1 })
      const containerWidth = 600 // Default container width
      scale = Math.min(1.5, containerWidth / baseViewport.width)
    } catch (err) {
      // Use default scale if calculation fails
    }

    const canvasUrls: string[] = []
    
    // Render each page to canvas and convert to data URL
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale })
        
        // Create canvas for the page
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d', { 
          alpha: false,
          willReadFrequently: false 
        })
        
        if (!context) {
          continue
        }

        // Set canvas dimensions
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        // Render the page
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise
        
        // Convert to data URL and store
        const dataUrl = canvas.toDataURL('image/png')
        canvasUrls.push(dataUrl)
        
        // Small delay to prevent blocking the UI
        if (pageNum % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        
      } catch (err) {
        // Continue with other pages even if one fails
        console.warn(`Failed to render PDF page ${pageNum}:`, err)
      }
    }
    
    // Update React state with all rendered page URLs
    setPdfCanvasUrls(canvasUrls)
  }


  const renderDOCX = async () => {
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer: content })
      
      // Store the rendered HTML content in React state
      setRenderedContent(result.value)
      
      if (result.messages.length > 0) {
        console.warn('Mammoth conversion warnings:', result.messages)
      }
    } catch (err) {
      throw new Error(`DOCX parsing failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Cleanup URLs when component unmounts or content changes
  useEffect(() => {
    return () => {
      // Clean up any object URLs if we were using them
      pdfCanvasUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [pdfCanvasUrls])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Source Document ({type.toUpperCase()})</h3>
        {type === 'pdf' && totalPages > 0 && (
          <div className={styles.pdfInfo}>
            <span className={styles.pageInfo}>
              {totalPages} page{totalPages !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <div ref={containerRef} className={styles.documentContainer}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading {type.toUpperCase()}...</p>
            </div>
          )}
          {error && (
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Failed to load document</h3>
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && type === 'docx' && renderedContent && (
            <div 
              className={styles.docxContent}
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          )}
          {!loading && !error && type === 'pdf' && pdfCanvasUrls.length > 0 && (
            <div className={styles.pdfContent}>
              {pdfCanvasUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`PDF page ${index + 1}`}
                  className={styles.pdfPage}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto 1rem auto',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px'
                  }}
                />
              ))}
            </div>
          )}
          {!loading && !error && !renderedContent && pdfCanvasUrls.length === 0 && (
            <div style={{color: '#6c757d', padding: '2rem', textAlign: 'center'}}>
              <p>No content to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileViewer