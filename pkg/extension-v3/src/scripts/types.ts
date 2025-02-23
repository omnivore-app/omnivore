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

export interface Highlight {
  id: string
  type: string
  annotation: string
}

export interface ArticleResult {
  highlights?: Highlight[]
  errorCodes?: string[]
}
export interface ArticleData {
  article?: ArticleResult
}

export interface SetLinkArchivedResult {
  linkId?: string
  message?: string
  errorCodes?: string[]
}

export interface SetLinkArchivedData {
  setLinkArchived?: SetLinkArchivedResult
}

export interface SavePageInput {
  url: string
  title: string
  clientRequestId: string
  originalContent: string
}

export interface AddNoteInput {
  clientRequestId: string
  note: string
}

export interface TaskInput {
  clientRequestId: string
  libraryItemId?: string | undefined
  task: 'addNote' | 'archive' | 'editTitle' | 'delete' | 'updateLabelCache' | 'setLabels'
  title?: string | undefined
  note?: string | undefined
  labels?: string[] | undefined
}

export interface Label {
  id: string
  name: string
  color: string
  selected: 'on' | 'off'
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

export function isAddNoteInput(obj: any): obj is AddNoteInput {
  return (
    typeof obj === 'object' &&
    typeof obj.note === 'string' &&
    typeof obj.clientRequestId === 'string'
  )
}

export function isEnqueueTaskMessage(obj: any): obj is TaskInput {
  return (
    typeof obj === 'object' &&
    typeof obj.task === 'string' &&
    typeof obj.clientRequestId === 'string'
  )
}
