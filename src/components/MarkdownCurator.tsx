import { useEffect, useRef } from 'react'
import EasyMDE from 'easymde'
import 'easymde/dist/easymde.min.css'
import styles from './MarkdownCurator.module.css'

interface MarkdownCuratorProps {
  initialText: string
  onChange: (newText: string) => void
}

const MarkdownCurator: React.FC<MarkdownCuratorProps> = ({ initialText, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<EasyMDE | null>(null)

  useEffect(() => {
    if (textareaRef.current && !editorRef.current) {
      editorRef.current = new EasyMDE({
        element: textareaRef.current,
        initialValue: initialText,
        spellChecker: false,
        autosave: {
          enabled: false
        },
        status: ['lines', 'words', 'cursor'],
        toolbar: [
          'bold',
          'italic',
          'heading',
          '|',
          'quote',
          'unordered-list',
          'ordered-list',
          '|',
          'link',
          'image',
          'table',
          '|',
          'code',
          'horizontal-rule',
          '|',
          'preview',
          'fullscreen',
          '|',
          'guide'
        ],
        placeholder: 'Start writing your curated content here...',
        hideIcons: ['side-by-side'],
        showIcons: ['code', 'table'],
        maxHeight: '100%', // Ensure editor doesn't exceed container height
        minHeight: '200px', // Minimum height for usability
        renderingConfig: {
          singleLineBreaks: false,
          codeSyntaxHighlighting: true
        }
      })

      // Set up change handler
      editorRef.current.codemirror.on('change', () => {
        if (editorRef.current) {
          const value = editorRef.current.value()
          onChange(value)
        }
      })
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.cleanup()
        editorRef.current = null
      }
    }
  }, [])

  // Update editor content when initialText changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.value() !== initialText) {
      editorRef.current.value(initialText)
    }
  }, [initialText])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Markdown Editor</h3>
      </div>
      
      <div className={styles.editorContainer}>
        <textarea 
          ref={textareaRef}
          className={styles.textarea}
        />
      </div>
    </div>
  )
}

export default MarkdownCurator