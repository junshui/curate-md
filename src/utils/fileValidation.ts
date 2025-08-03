import { FileType } from '../types'
import { validateFileSize, getFileErrorMessage } from './errorHandling'

export const getFileType = (file: File): FileType | null => {
  const extension = file.name.toLowerCase().split('.').pop()
  
  switch (extension) {
    case 'pdf':
      return 'pdf'
    case 'docx':
      return 'docx'
    default:
      return null
  }
}

export const isValidSourceFile = (file: File): boolean => {
  return getFileType(file) !== null
}

export const isMarkdownFile = (file: File): boolean => {
  const extension = file.name.toLowerCase().split('.').pop()
  return extension === 'md'
}

export const validateFiles = (files: FileList | File[]) => {
  const fileArray = Array.from(files)
  
  const sourceFiles: File[] = []
  const markdownFiles: File[] = []
  const rejectedFiles: { name: string; reason: string }[] = []

  fileArray.forEach(file => {
    // Check file size first (50MB limit for source files, 10MB for markdown)
    const sizeLimit = isValidSourceFile(file) ? 50 : 10
    const sizeError = validateFileSize(file, sizeLimit)
    
    if (sizeError) {
      rejectedFiles.push({
        name: file.name,
        reason: sizeError
      })
      return
    }

    if (isValidSourceFile(file)) {
      sourceFiles.push(file)
    } else if (isMarkdownFile(file)) {
      markdownFiles.push(file)
    } else {
      rejectedFiles.push({
        name: file.name,
        reason: 'Unsupported file type. Only PDF, DOCX, and MD files are allowed.'
      })
    }
  })

  return {
    sourceFiles,
    markdownFiles,
    rejectedFiles
  }
}