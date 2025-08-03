import { useEffect, useRef } from 'react'
import Split from 'split.js'
import { FileType } from '../types'
import FileViewer from './FileViewer'
import MarkdownEditor from './MarkdownEditor'
import MarkdownPreview from './MarkdownPreview'
import styles from './MainView.module.css'

interface MainViewProps {
  sourceContent: ArrayBuffer
  sourceType: FileType
  initialMarkdown: string
  onMarkdownChange: (newText: string) => void
  isLoading: boolean
  errorMessage: string | null
  currentMarkdown?: string
}

const MainView: React.FC<MainViewProps> = ({
  sourceContent,
  sourceType,
  initialMarkdown,
  onMarkdownChange,
  isLoading,
  errorMessage,
  currentMarkdown
}) => {
  const splitContainerRef = useRef<HTMLDivElement>(null)
  const splitInstanceRef = useRef<Split.Instance | null>(null)

  useEffect(() => {
    if (splitContainerRef.current && !splitInstanceRef.current) {
      const leftPane = splitContainerRef.current.querySelector('.left-pane') as HTMLElement
      const middlePane = splitContainerRef.current.querySelector('.middle-pane') as HTMLElement
      const rightPane = splitContainerRef.current.querySelector('.right-pane') as HTMLElement
      
      if (leftPane && middlePane && rightPane) {
        splitInstanceRef.current = Split([leftPane, middlePane, rightPane], {
          sizes: [33, 34, 33],
          minSize: [250, 300, 250],
          gutterSize: 8,
          cursor: 'col-resize',
          direction: 'horizontal'
        })
      }
    }

    return () => {
      if (splitInstanceRef.current) {
        splitInstanceRef.current.destroy()
        splitInstanceRef.current = null
      }
    }
  }, [])

  const handleExportMarkdown = () => {
    // Get the current markdown content from the editor
    const markdownContent = currentMarkdown || initialMarkdown || ''
    
    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    
    // Generate a meaningful filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    a.download = `curated-document-${timestamp}.md`
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.title}>Document Curation</h2>
        </div>
        <div className={styles.toolbarRight}>
          <button 
            className={styles.exportButton}
            onClick={handleExportMarkdown}
            title="Export markdown file"
          >
            📁 Export .md
          </button>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Processing document...</p>
        </div>
      )}

      <div 
        ref={splitContainerRef}
        className={styles.splitContainer}
      >
        <div className="left-pane">
          <FileViewer
            content={sourceContent}
            type={sourceType}
            errorMessage={errorMessage}
          />
        </div>
        
        <div className="middle-pane">
          <MarkdownEditor
            value={currentMarkdown || initialMarkdown}
            onChange={onMarkdownChange}
          />
        </div>
        
        <div className="right-pane">
          <MarkdownPreview
            value={currentMarkdown || initialMarkdown}
          />
        </div>
      </div>
    </div>
  )
}

export default MainView