export type AppPhase = 'staging' | 'loading' | 'active'

export type FileType = 'pdf' | 'docx'

export interface ProcessedData {
  sourceContent: ArrayBuffer | null
  markdownText: string
}

export interface RejectedFile {
  name: string
  reason: string
}