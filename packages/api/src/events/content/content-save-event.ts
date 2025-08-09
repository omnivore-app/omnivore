import { BaseEvent } from '../event-manager'

export interface ContentSaveRequestedEventData {
  userId: string
  libraryItemId: string
  url: string
  contentType: ContentType
  metadata: {
    labels?: string[]
    folder?: string
    source: string
    savedAt: string
    publishedAt?: string
  }
}

export enum ContentType {
  HTML = 'html',
  PDF = 'pdf',
  EMAIL = 'email',
  RSS = 'rss',
  YOUTUBE = 'youtube',
}

export enum EventType {
  CONTENT_SAVE_REQUESTED = 'CONTENT_SAVE_REQUESTED',
  CONTENT_PROCESSING_STARTED = 'CONTENT_PROCESSING_STARTED',
  CONTENT_PROCESSING_COMPLETED = 'CONTENT_PROCESSING_COMPLETED',
  CONTENT_PROCESSING_FAILED = 'CONTENT_PROCESSING_FAILED',
}

export class ContentSaveRequestedEvent {
  public readonly eventType = EventType.CONTENT_SAVE_REQUESTED

  constructor(public readonly data: ContentSaveRequestedEventData) {
    this.validate()
  }

  serialize(): string {
    return JSON.stringify({
      eventType: this.eventType,
      timestamp: new Date().toISOString(),
      ...this.data,
    })
  }

  protected validate(): void {
    const { userId, libraryItemId, url, contentType, metadata } = this.data

    if (!userId?.trim()) throw new Error('userId is required')
    if (!libraryItemId?.trim()) throw new Error('libraryItemId is required')
    if (!url?.trim()) throw new Error('url is required')
    if (!contentType) throw new Error('contentType is required')
    if (!metadata?.source?.trim())
      throw new Error('metadata.source is required')
    if (!metadata?.savedAt?.trim())
      throw new Error('metadata.savedAt is required')

    // Validate URL format
    try {
      new URL(url)
    } catch {
      throw new Error('Invalid URL format')
    }

    // Validate savedAt date
    if (isNaN(Date.parse(metadata.savedAt))) {
      throw new Error('Invalid savedAt date format')
    }
  }

  // Getters
  public get userId(): string {
    return this.data.userId
  }

  public get libraryItemId(): string {
    return this.data.libraryItemId
  }

  public get url(): string {
    return this.data.url
  }

  public get contentType(): ContentType {
    return this.data.contentType
  }

  public get metadata(): ContentSaveRequestedEventData['metadata'] {
    return this.data.metadata
  }
}
