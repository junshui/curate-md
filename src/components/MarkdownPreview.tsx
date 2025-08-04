import { memo, useMemo, useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import styles from './MarkdownPreview.module.css'

interface MarkdownPreviewProps {
  value: string
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = memo(({ value }) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  // Debounce the value updates to reduce processing frequency
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [value])

  // Memoize the processed markdown to avoid re-processing identical content
  const processedMarkdown = useMemo(() => {
    return (
      <MDEditor.Markdown
        source={debouncedValue || ''}
        style={{ 
          backgroundColor: '#fff',
          padding: '1rem',
          height: '100%',
          overflow: 'auto'
        }}
        rehypePlugins={[rehypeSanitize]}
        data-color-mode="light"
      />
    )
  }, [debouncedValue])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Preview</h3>
      </div>
      
      <div className={styles.previewContainer}>
        {processedMarkdown}
      </div>
    </div>
  )
})

export default MarkdownPreview