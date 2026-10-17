import { HeaderValue } from 'mailparser'

export type EmailContents = {
  from: string
  to: string
  subject: string
  html: string
  text: string
  headers: Map<string, HeaderValue>
  unsubMailTo?: string
  unsubHttpUrl?: string
  forwardedFrom?: string
  replyTo?: string
  confirmationCode?: string
  uploadFile?: {
    fileName: string
    contentType: string
    id: string
  }
}
