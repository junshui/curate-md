export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateFileSize = (file: File, maxSizeMB: number = 50): string | null => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  if (file.size > maxSizeBytes) {
    return `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${maxSizeMB}MB`
  }
  
  return null
}

export const getFileErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unknown error occurred'
}

export const isFileCorrupted = (error: unknown): boolean => {
  const errorMessage = getFileErrorMessage(error).toLowerCase()
  
  return errorMessage.includes('corrupted') ||
         errorMessage.includes('invalid') ||
         errorMessage.includes('malformed') ||
         errorMessage.includes('unexpected end')
}