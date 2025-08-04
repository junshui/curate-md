import { useEffect, useRef, useState, useMemo } from 'react'
import Split from 'split.js'
import { FileType } from '../types'
import FileViewer from './FileViewer'
import MarkdownEditor from './MarkdownEditor'
import MarkdownPreview from './MarkdownPreview'
import styles from './MainView.module.css'

interface PanelVisibility {
  source: boolean
  editor: boolean
  preview: boolean
}

interface MainViewProps {
  sourceContent: ArrayBuffer | null
  sourceType: FileType | undefined
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
  const [panelVisibility, setPanelVisibility] = useState<PanelVisibility>({
    source: sourceContent !== null,
    editor: true,
    preview: true
  })

  // Calculate visible panels and their configuration
  const visiblePanels = useMemo(() => {
    const panels = []
    if (panelVisibility.source) panels.push('source')
    if (panelVisibility.editor) panels.push('editor')
    if (panelVisibility.preview) panels.push('preview')
    return panels
  }, [panelVisibility])

  const getSplitConfiguration = useMemo(() => {
    const panelCount = visiblePanels.length
    if (panelCount === 1) return { sizes: [100], minSize: [300] }
    if (panelCount === 2) return { sizes: [50, 50], minSize: [250, 250] }
    return { sizes: [33, 34, 33], minSize: [250, 300, 250] }
  }, [visiblePanels])

  // Toggle panel visibility with validation (at least one panel must be visible)
  const togglePanel = (panel: keyof PanelVisibility) => {
    // Don't allow toggling source panel if there's no source content
    if (panel === 'source' && !sourceContent) {
      return
    }
    
    const newVisibility = { ...panelVisibility, [panel]: !panelVisibility[panel] }
    const visibleCount = Object.values(newVisibility).filter(Boolean).length
    
    // Ensure at least one panel remains visible
    if (visibleCount > 0) {
      setPanelVisibility(newVisibility)
    }
  }

  // Update Split.js when panel visibility changes
  useEffect(() => {
    // Cleanup existing split instance
    if (splitInstanceRef.current) {
      splitInstanceRef.current.destroy()
      splitInstanceRef.current = null
    }

    // Create new split instance with visible panels
    if (splitContainerRef.current && visiblePanels.length > 1) {
      const visibleElements: HTMLElement[] = []
      
      if (panelVisibility.source) {
        const sourcePane = splitContainerRef.current.querySelector('.source-pane') as HTMLElement
        if (sourcePane) visibleElements.push(sourcePane)
      }
      if (panelVisibility.editor) {
        const editorPane = splitContainerRef.current.querySelector('.editor-pane') as HTMLElement
        if (editorPane) visibleElements.push(editorPane)
      }
      if (panelVisibility.preview) {
        const previewPane = splitContainerRef.current.querySelector('.preview-pane') as HTMLElement
        if (previewPane) visibleElements.push(previewPane)
      }

      if (visibleElements.length > 1) {
        const config = getSplitConfiguration
        splitInstanceRef.current = Split(visibleElements, {
          sizes: config.sizes,
          minSize: config.minSize,
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
  }, [panelVisibility, getSplitConfiguration, visiblePanels.length])

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
        <div className={styles.toolbarCenter}>
          <div className={styles.panelToggles}>
            <button 
              className={`${styles.toggleButton} ${panelVisibility.source ? styles.active : styles.inactive}`}
              onClick={() => togglePanel('source')}
              title={sourceContent ? "Toggle source document panel" : "No source document loaded"}
              disabled={(visiblePanels.length === 1 && panelVisibility.source) || !sourceContent}
            >
              📄 Source
            </button>
            <button 
              className={`${styles.toggleButton} ${panelVisibility.editor ? styles.active : styles.inactive}`}
              onClick={() => togglePanel('editor')}
              title="Toggle markdown editor panel"
              disabled={visiblePanels.length === 1 && panelVisibility.editor}
            >
              ✏️ Editor
            </button>
            <button 
              className={`${styles.toggleButton} ${panelVisibility.preview ? styles.active : styles.inactive}`}
              onClick={() => togglePanel('preview')}
              title="Toggle preview panel"
              disabled={visiblePanels.length === 1 && panelVisibility.preview}
            >
              👁️ Preview
            </button>
          </div>
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
        className={`${styles.splitContainer} ${styles[`panels-${visiblePanels.length}`]}`}
      >
        {panelVisibility.source && sourceContent && sourceType && (
          <div className="source-pane">
            <FileViewer
              content={sourceContent}
              type={sourceType}
              errorMessage={errorMessage}
            />
          </div>
        )}
        
        {panelVisibility.editor && (
          <div className="editor-pane">
            <MarkdownEditor
              value={currentMarkdown || initialMarkdown}
              onChange={onMarkdownChange}
            />
          </div>
        )}
        
        {panelVisibility.preview && (
          <div className="preview-pane">
            <MarkdownPreview
              value={currentMarkdown || initialMarkdown}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MainView