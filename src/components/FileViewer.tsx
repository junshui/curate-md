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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [containerReady, setContainerReady] = useState(false) // Track container availability
  const [pdfCanvases, setPdfCanvases] = useState<HTMLCanvasElement[]>([]) // Store rendered PDF pages

  // Initial validation useEffect - no container dependency
  useEffect(() => {
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

    // Reset states for new content
    setError(null)
    setLoading(true)
  }, [content, type, errorMessage])

  // Rendering useEffect - triggered when container becomes available
  useEffect(() => {
    const renderContent = async () => {
      // Only run if we have content, no errors, and container is available
      if (!content || errorMessage || !containerReady || !containerRef.current) {
        return
      }

      // Validate container has proper dimensions
      if (containerRef.current.offsetWidth === 0 || containerRef.current.offsetHeight === 0) {
        setError('Container not properly sized for rendering')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
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
  }, [content, type, errorMessage, containerReady]) // Depend on container being ready

  // Effect to handle canvas attachment when state changes
  useEffect(() => {
    // This will trigger re-render when pdfCanvases changes
  }, [pdfCanvases])

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
      
      setPdfDocument(pdf)
      setTotalPages(pdf.numPages)
      setCurrentPage(1)
      
      await renderAllPDFPages(pdf)
    } catch (err) {
      throw new Error(`PDF parsing failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const renderSingleTestPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    if (!containerRef.current) {
      throw new Error('Container not available')
    }
    
    try {
      const page = await pdf.getPage(pageNum)
      
      // Calculate scale based on container width
      const containerWidth = containerRef.current.offsetWidth - 32 // Account for padding
      const baseViewport = page.getViewport({ scale: 1 })
      const scale = containerWidth > 0 ? Math.min(1.5, containerWidth / baseViewport.width) : 1.2
      const viewport = page.getViewport({ scale })
      
      // Create canvas in memory (not attached to DOM yet)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      if (!context) {
        throw new Error('Failed to get canvas context')
      }

      canvas.height = viewport.height
      canvas.width = viewport.width
      canvas.style.maxWidth = '100%'
      canvas.style.height = 'auto'
      canvas.style.display = 'block'
      canvas.style.margin = '0 auto'
      canvas.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
      canvas.style.borderRadius = '4px'
      
      // Render to canvas in memory
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      
      // Update React state to trigger re-render with the canvas
      setPdfCanvases([canvas])
      
    } catch (err) {
      throw err
    }
  }

  const renderAllPDFPages = async (pdf: pdfjsLib.PDFDocumentProxy) => {
    if (!containerRef.current) {
      return
    }

    // Calculate optimal scale based on container width
    const containerWidth = containerRef.current.offsetWidth - 32 // Account for padding
    let scale = 1.2
    
    // Get first page to calculate scale
    try {
      const firstPage = await pdf.getPage(1)
      const baseViewport = firstPage.getViewport({ scale: 1 })
      scale = Math.min(1.5, containerWidth / baseViewport.width)
    } catch (err) {
      // Use default scale if calculation fails
    }

    const canvases: HTMLCanvasElement[] = []
    
    // Render each page to canvas in memory
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale })
        
        // Create canvas for the page
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d', { 
          alpha: false, // Slight performance improvement
          willReadFrequently: false 
        })
        
        if (!context) {
          continue
        }

        // Set canvas dimensions
        canvas.height = viewport.height
        canvas.width = viewport.width
        canvas.style.maxWidth = '100%'
        canvas.style.height = 'auto'
        canvas.style.display = 'block'
        canvas.style.margin = '0 auto 1rem auto'
        canvas.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
        canvas.style.borderRadius = '4px'
        
        // Add page number as data attribute
        canvas.setAttribute('data-page', pageNum.toString())
        
        // Render the page
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise
        
        canvases.push(canvas)
        
        // Small delay to prevent blocking the UI
        if (pageNum % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        
      } catch (err) {
        // Continue with other pages even if one fails
      }
    }
    
    // Update React state with all rendered canvases
    setPdfCanvases(canvases)
  }

  const renderPDFPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number) => {
    // This function is kept for backward compatibility but not used in continuous view
    if (!containerRef.current) return

    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.2 })
    
    // Clear previous content
    containerRef.current.innerHTML = ''
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Failed to get 2D context')
    }

    canvas.height = viewport.height
    canvas.width = viewport.width
    canvas.style.maxWidth = '100%'
    canvas.style.height = 'auto'
    
    containerRef.current.appendChild(canvas)
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise
  }

  const renderDOCX = async () => {
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer: content })
      
      if (!containerRef.current) return
      
      containerRef.current.innerHTML = `
        <div class="${styles.docxContent}">
          ${result.value}
        </div>
      `
      
      if (result.messages.length > 0) {
        console.warn('Mammoth conversion warnings:', result.messages)
      }
    } catch (err) {
      throw new Error(`DOCX parsing failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Page navigation functions removed since we now use continuous view
  // const handlePrevPage = async () => { ... }
  // const handleNextPage = async () => { ... }

  // Container ref callback to trigger rendering when available
  const containerRefCallback = (element: HTMLDivElement | null) => {
    containerRef.current = element
    setContainerReady(!!element) // Trigger the rendering useEffect
  }

  // Canvas ref callback to attach canvas elements to DOM
  const canvasRefCallback = (element: HTMLDivElement | null) => {
    if (element && pdfCanvases.length > 0) {
      // Clear any existing content first
      element.innerHTML = ''
      // Append all canvas elements
      pdfCanvases.forEach(canvas => {
        element.appendChild(canvas)
      })
    }
  }

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
        <div ref={containerRefCallback} className={styles.documentContainer}>
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
          {!loading && !error && pdfCanvases.length === 0 && (
            <div style={{color: '#6c757d', padding: '2rem', textAlign: 'center'}}>
              <p>No content to display</p>
            </div>
          )}
          {!loading && !error && pdfCanvases.length > 0 && (
            <div ref={canvasRefCallback} className={styles.pdfContent}>
              {/* Canvas elements will be attached via ref callback */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileViewer