export type ToolbarStatus = 'waiting' | 'success' | 'failure'

export interface ToolbarMessage {
  status?: ToolbarStatus
}

export interface SavePageData {
  savePage?: SavePageResult
}

export interface SavePageResult {
  url?: string
  clientRequestId?: string
  errorCodes?: string[]
}

export interface SavePageInput {
  url: string
  title: string
  clientRequestId: string
  originalContent: string
}

export function isSavePageResult(obj: any): obj is SavePageResult {
  return (
    typeof obj === 'object' &&
    (obj.url === undefined || typeof obj.url === 'string') &&
    (obj.clientRequestId === undefined ||
      typeof obj.clientRequestId === 'string') &&
    (obj.errorCodes === undefined ||
      (Array.isArray(obj.errorCodes) &&
        obj.errorCodes.every((code: any) => typeof code === 'string')))
  )
}

export function isSavePageData(obj: any): obj is SavePageData {
  return (
    typeof obj === 'object' &&
    (obj.savePage === undefined || isSavePageResult(obj.savePage))
  )
}

export function isSavePageInput(obj: any): obj is SavePageInput {
  return (
    typeof obj === 'object' &&
    typeof obj.url === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.clientRequestId === 'string' &&
    typeof obj.originalContent === 'string'
  )
}
