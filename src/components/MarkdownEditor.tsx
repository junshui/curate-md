import { useEffect, useRef } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { 
  bold, 
  italic, 
  strikethrough, 
  hr, 
  quote, 
  unorderedListCommand, 
  orderedListCommand, 
  checkedListCommand, 
  link, 
  image, 
  table 
} from '@uiw/react-md-editor/commands'
import styles from './MarkdownEditor.module.css'

interface MarkdownEditorProps {
  value: string
  onChange: (newText: string) => void
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Custom toolbar commands - keep only formatting buttons
  const customCommands = [
    bold,
    italic,
    strikethrough,
    hr,
    quote,
    unorderedListCommand,
    orderedListCommand,
    checkedListCommand,
    link,
    image,
    table
  ]

  useEffect(() => {
    // Ensure the editor container has proper scroll behavior
    if (containerRef.current) {
      const editorWrapper = containerRef.current.querySelector('.w-md-editor')
      if (editorWrapper) {
        (editorWrapper as HTMLElement).style.height = '100%'
      }
    }
  }, [])

  const handleChange = (val: string | undefined) => {
    onChange(val || '')
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Markdown Editor</h3>
      </div>
      
      <div className={styles.editorContainer}>
        <MDEditor
          value={value}
          onChange={handleChange}
          preview="edit"
          hideToolbar={false}
          visibleDragbar={false}
          commands={customCommands}
          extraCommands={[]}
          textareaProps={{
            placeholder: 'Start writing your curated content here...',
            style: {
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            }
          }}
          data-color-mode="light"
        />
      </div>
    </div>
  )
}

export default MarkdownEditor