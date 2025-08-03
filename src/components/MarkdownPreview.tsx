import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import styles from './MarkdownPreview.module.css'

interface MarkdownPreviewProps {
  value: string
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ value }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Preview</h3>
      </div>
      
      <div className={styles.previewContainer}>
        <MDEditor.Markdown
          source={value || ''}
          style={{ 
            whiteSpace: 'pre-wrap',
            backgroundColor: '#fff',
            padding: '1rem',
            height: '100%',
            overflow: 'auto'
          }}
          rehypePlugins={[rehypeSanitize]}
          data-color-mode="light"
        />
      </div>
    </div>
  )
}

export default MarkdownPreview