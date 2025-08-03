import { useState, useRef, DragEvent } from 'react'
import { RejectedFile } from '../types'
import { validateFiles } from '../utils/fileValidation'
import styles from './FileUploadStagingArea.module.css'

interface FileUploadStagingAreaProps {
  onLoadDocuments: (sourceFile: File, markdownFile: File | null) => void
}

const FileUploadStagingArea: React.FC<FileUploadStagingAreaProps> = ({ onLoadDocuments }) => {
  const [stagedSourceFile, setStagedSourceFile] = useState<File | null>(null)
  const [stagedMarkdownFile, setStagedMarkdownFile] = useState<File | null>(null)
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  
  const sourceInputRef = useRef<HTMLInputElement>(null)
  const markdownInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | File[]) => {
    const validation = validateFiles(files)
    
    // Handle source files
    if (validation.sourceFiles.length > 0) {
      setStagedSourceFile(validation.sourceFiles[0])
      
      // If multiple source files, reject the extras
      if (validation.sourceFiles.length > 1) {
        const extraSources = validation.sourceFiles.slice(1).map(file => ({
          name: file.name,
          reason: 'Only one source document allowed. Using the first one.'
        }))
        setRejectedFiles(prev => [...prev, ...extraSources])
      }
    }

    // Handle markdown files
    if (validation.markdownFiles.length > 0) {
      setStagedMarkdownFile(validation.markdownFiles[0])
      
      // If multiple markdown files, reject the extras
      if (validation.markdownFiles.length > 1) {
        const extraMarkdown = validation.markdownFiles.slice(1).map(file => ({
          name: file.name,
          reason: 'Only one markdown file allowed. Using the first one.'
        }))
        setRejectedFiles(prev => [...prev, ...extraMarkdown])
      }
    }

    // Add rejected files
    setRejectedFiles(prev => [...prev, ...validation.rejectedFiles])
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Only set dragging to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleSourceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleMarkdownFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleLoadClick = () => {
    if (stagedSourceFile) {
      onLoadDocuments(stagedSourceFile, stagedMarkdownFile)
    }
  }

  const handleStartBlank = () => {
    if (stagedSourceFile) {
      setStagedMarkdownFile(null)
    }
  }

  const clearRejectedFiles = () => {
    setRejectedFiles([])
  }

  const isLoadReady = stagedSourceFile !== null

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className={styles.uploadSlots}>
          <div className={styles.slot}>
            <div className={styles.slotHeader}>
              <h3>Source Document</h3>
              <span className={styles.fileTypes}>PDF or DOCX</span>
            </div>
            
            {stagedSourceFile ? (
              <div className={styles.stagedFile}>
                <div className={styles.fileIcon}>📄</div>
                <div className={styles.fileName}>{stagedSourceFile.name}</div>
                <div className={styles.fileSize}>
                  {(stagedSourceFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <button 
                  className={styles.removeButton}
                  onClick={() => setStagedSourceFile(null)}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className={styles.emptySlot}>
                <div className={styles.uploadIcon}>⬆️</div>
                <p>Drop your PDF or DOCX file here</p>
                <button 
                  className={styles.browseButton}
                  onClick={() => sourceInputRef.current?.click()}
                >
                  Browse Files
                </button>
                <input
                  ref={sourceInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleSourceFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          <div className={styles.slot}>
            <div className={styles.slotHeader}>
              <h3>Markdown File</h3>
              <span className={styles.fileTypes}>MD (optional)</span>
            </div>
            
            {stagedMarkdownFile ? (
              <div className={styles.stagedFile}>
                <div className={styles.fileIcon}>📝</div>
                <div className={styles.fileName}>{stagedMarkdownFile.name}</div>
                <div className={styles.fileSize}>
                  {(stagedMarkdownFile.size / 1024).toFixed(2)} KB
                </div>
                <button 
                  className={styles.removeButton}
                  onClick={() => setStagedMarkdownFile(null)}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className={styles.emptySlot}>
                <div className={styles.uploadIcon}>📝</div>
                <p>Drop your markdown file here</p>
                <button 
                  className={styles.browseButton}
                  onClick={() => markdownInputRef.current?.click()}
                >
                  Browse Files
                </button>
                {stagedSourceFile && (
                  <button 
                    className={styles.blankButton}
                    onClick={handleStartBlank}
                  >
                    Start with blank document
                  </button>
                )}
                <input
                  ref={markdownInputRef}
                  type="file"
                  accept=".md"
                  onChange={handleMarkdownFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        {rejectedFiles.length > 0 && (
          <div className={styles.rejectedFiles}>
            <div className={styles.rejectedHeader}>
              <h4>Rejected Files</h4>
              <button 
                className={styles.clearButton}
                onClick={clearRejectedFiles}
              >
                Clear
              </button>
            </div>
            {rejectedFiles.map((file, index) => (
              <div key={index} className={styles.rejectedFile}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.reason}>{file.reason}</span>
              </div>
            ))}
          </div>
        )}

        <button 
          className={`${styles.loadButton} ${isLoadReady ? styles.enabled : styles.disabled}`}
          onClick={handleLoadClick}
          disabled={!isLoadReady}
        >
          Load Documents
        </button>
      </div>
    </div>
  )
}

export default FileUploadStagingArea