import { useEffect, useRef, useCallback } from 'react'
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
  const currentProportionRef = useRef<number>(0)
  const isTogglingModeRef = useRef<boolean>(false)
  const previewButtonRef = useRef<Element | null>(null)
  const previewElementRef = useRef<HTMLElement | null>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)

  const calculateProportionalPosition = useCallback((scrollTop: number, scrollHeight: number, clientHeight: number): number => {
    const maxScroll = Math.max(1, scrollHeight - clientHeight)
    return scrollTop / maxScroll
  }, [])

  const applyProportionalPosition = useCallback((proportion: number, scrollHeight: number, clientHeight: number): number => {
    const maxScroll = Math.max(0, scrollHeight - clientHeight)
    return proportion * maxScroll
  }, [])

  const handlePreviewScroll = useCallback(() => {
    if (isTogglingModeRef.current || !previewElementRef.current) return
    
    const previewElement = previewElementRef.current
    currentProportionRef.current = calculateProportionalPosition(
      previewElement.scrollTop,
      previewElement.scrollHeight,
      previewElement.clientHeight
    )
  }, [calculateProportionalPosition])

  const setupPreviewScrollTracking = useCallback((previewElement: HTMLElement) => {
    if (previewElementRef.current === previewElement) return
    
    // Clean up previous listener
    if (previewElementRef.current) {
      previewElementRef.current.removeEventListener('scroll', handlePreviewScroll)
    }
    
    // Set up new listener
    previewElementRef.current = previewElement
    previewElement.addEventListener('scroll', handlePreviewScroll, { passive: true })
  }, [handlePreviewScroll])

  const setupMutationObserver = useCallback(() => {
    if (mutationObserverRef.current) return

    mutationObserverRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            const previewElement = element.querySelector('.editor-preview') || 
                                 (element.classList.contains('editor-preview') ? element : null)
            
            if (previewElement) {
              setupPreviewScrollTracking(previewElement as HTMLElement)
            }
          }
        })
      })
    })

    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }, [setupPreviewScrollTracking])

  const handlePreviewToggle = useCallback(() => {
    if (isTogglingModeRef.current || !editorRef.current) return
    isTogglingModeRef.current = true

    const editor = editorRef.current
    const cm = editor.codemirror

    // Don't save positions here - trust the scroll handlers to have already saved them
    // The scroll handlers continuously update currentProportionRef.current

    setTimeout(() => {
      if (editor.isPreviewActive()) {
        // Now in preview mode - apply saved proportion
        const previewElement = document.querySelector('.editor-preview') as HTMLElement
        if (previewElement) {
          setupPreviewScrollTracking(previewElement)
          
          const newPreviewScroll = applyProportionalPosition(
            currentProportionRef.current,
            previewElement.scrollHeight,
            previewElement.clientHeight
          )
          
          previewElement.scrollTop = newPreviewScroll
        }
      } else {
        // Now in edit mode - apply saved proportion
        const scrollInfo = cm.getScrollInfo()
        const newEditScroll = applyProportionalPosition(
          currentProportionRef.current,
          scrollInfo.height,
          scrollInfo.clientHeight
        )
        
        cm.scrollTo(null, newEditScroll)
      }
      
      isTogglingModeRef.current = false
    }, 100)
  }, [setupPreviewScrollTracking, applyProportionalPosition])

  useEffect(() => {
    if (textareaRef.current && !editorRef.current) {
      editorRef.current = new EasyMDE({
        element: textareaRef.current,
        initialValue: initialText,
        spellChecker: false,
        autosave: {
          enabled: false,
          uniqueId: 'curatemd-editor'
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

      // Track scroll position for synchronization
      editorRef.current.codemirror.on('scroll', () => {
        if (editorRef.current && !isTogglingModeRef.current && !editorRef.current.isPreviewActive()) {
          const scrollInfo = editorRef.current.codemirror.getScrollInfo()
          currentProportionRef.current = calculateProportionalPosition(
            scrollInfo.top,
            scrollInfo.height,
            scrollInfo.clientHeight
          )
        }
      })

      // Hook into preview button click to handle scroll synchronization
      setTimeout(() => {
        const previewButton = document.querySelector('.editor-toolbar .fa-eye')
        if (previewButton) {
          previewButtonRef.current = previewButton
          previewButton.addEventListener('click', handlePreviewToggle)
        }
      }, 100)

      // Set up MutationObserver for preview element detection
      setupMutationObserver()
    }

    return () => {
      if (previewButtonRef.current) {
        previewButtonRef.current.removeEventListener('click', handlePreviewToggle)
        previewButtonRef.current = null
      }
      if (previewElementRef.current) {
        previewElementRef.current.removeEventListener('scroll', handlePreviewScroll)
        previewElementRef.current = null
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect()
        mutationObserverRef.current = null
      }
      if (editorRef.current) {
        editorRef.current.cleanup()
        editorRef.current = null
      }
    }
  }, [handlePreviewToggle, setupMutationObserver, calculateProportionalPosition, handlePreviewScroll])

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