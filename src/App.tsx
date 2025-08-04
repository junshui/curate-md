import { useState } from 'react'
import { AppPhase, ProcessedData, FileType } from './types'
import { getFileType } from './utils/fileValidation'
import FileUploadStagingArea from './components/FileUploadStagingArea'
import MainView from './components/MainView'
import styles from './components/App.module.css'

function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('staging')
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [, setMarkdownFile] = useState<File | null>(null)
  const [processedData, setProcessedData] = useState<ProcessedData>({
    sourceContent: null,
    markdownText: ''
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentMarkdown, setCurrentMarkdown] = useState<string>('')

  const handleLoadDocuments = async (markdown: File, source: File | null) => {
    setAppPhase('loading')
    setSourceFile(source)
    setMarkdownFile(markdown)
    setErrorMessage(null)

    try {
      // Read markdown file (now required)
      const markdownText = await markdown.text()
      
      // Read source file if provided (now optional)
      let sourceBuffer: ArrayBuffer | null = null
      if (source) {
        const originalBuffer = await source.arrayBuffer()
        sourceBuffer = originalBuffer.slice(0) // Create a copy
      }

      setProcessedData({
        sourceContent: sourceBuffer,
        markdownText
      })
      setCurrentMarkdown(markdownText)

      setAppPhase('active')
    } catch (error) {
      setErrorMessage(`Failed to process files: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setAppPhase('staging')
    }
  }

  const handleMarkdownChange = (newText: string) => {
    setCurrentMarkdown(newText)
  }

  const getSourceType = (): FileType | undefined => {
    if (!sourceFile) return undefined
    return getFileType(sourceFile) || undefined
  }

  return (
    <div className={styles.app}>
      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}

      {appPhase === 'staging' && (
        <div className={styles.stagingArea}>
          <h1>CurateMD</h1>
          <p>Document Curation Tool</p>
          <FileUploadStagingArea onLoadDocuments={handleLoadDocuments} />
        </div>
      )}
      
      {appPhase === 'loading' && (
        <div className={styles.loadingArea}>
          <div className={styles.loadingSpinner}></div>
          <h2>Loading documents...</h2>
          <p>Processing {sourceFile?.name || 'markdown file'}...</p>
        </div>
      )}
      
      {appPhase === 'active' && (
        <MainView
          sourceContent={processedData.sourceContent}
          sourceType={getSourceType()}
          initialMarkdown={processedData.markdownText}
          onMarkdownChange={handleMarkdownChange}
          isLoading={false}
          errorMessage={null}
          currentMarkdown={currentMarkdown}
        />
      )}
    </div>
  )
}

export default App