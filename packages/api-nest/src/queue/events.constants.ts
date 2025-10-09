/**
 * Event Type Constants and Interfaces
 *
 * Centralized event definitions for type-safe event emission
 * and handling throughout the system.
 */

/**
 * Event Names - Define all event types in the system
 */
export const EVENT_NAMES = {
  // Content events
  CONTENT_SAVE_REQUESTED: 'content.save.requested',
  CONTENT_FETCH_STARTED: 'content.fetch.started',
  CONTENT_FETCH_COMPLETED: 'content.fetch.completed',
  CONTENT_FETCH_FAILED: 'content.fetch.failed',
  CONTENT_PARSE_COMPLETED: 'content.parse.completed',
  CONTENT_PARSE_FAILED: 'content.parse.failed',

  // Library events
  LIBRARY_ITEM_CREATED: 'library.item.created',
  LIBRARY_ITEM_UPDATED: 'library.item.updated',
  LIBRARY_ITEM_DELETED: 'library.item.deleted',

  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Notification events
  NOTIFICATION_REQUESTED: 'notification.requested',
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_FAILED: 'notification.failed',

  // Post-processing events
  SEARCH_INDEX_UPDATE_REQUESTED: 'search.index.update.requested',
  THUMBNAIL_GENERATION_REQUESTED: 'thumbnail.generation.requested',
} as const

/**
 * Base Event Interface
 */
export interface BaseEvent {
  eventType: string
  timestamp: Date
  userId?: string
  metadata?: Record<string, unknown>
}

/**
 * Content Save Requested Event
 * Emitted when a user saves a new URL to their library
 */
export interface ContentSaveRequestedEvent extends BaseEvent {
  eventType: typeof EVENT_NAMES.CONTENT_SAVE_REQUESTED
  libraryItemId: string
  url: string
  userId: string
  priority?: number
  source?: 'web' | 'mobile' | 'api' | 'extension'
}

/**
 * Content Fetch Started Event
 */
export interface ContentFetchStartedEvent extends BaseEvent {
  eventType: typeof EVENT_NAMES.CONTENT_FETCH_STARTED
  libraryItemId: string
  url: string
  jobId: string
}

/**
 * Content Fetch Completed Event
 */
export interface ContentFetchCompletedEvent extends BaseEvent {
  eventType: typeof EVENT_NAMES.CONTENT_FETCH_COMPLETED
  libraryItemId: string
  jobId: string
  contentLength: number
  processingTime: number
}

/**
 * Content Fetch Failed Event
 */
export interface ContentFetchFailedEvent extends BaseEvent {
  eventType: typeof EVENT_NAMES.CONTENT_FETCH_FAILED
  libraryItemId: string
  jobId: string
  error: string
  retryCount: number
  willRetry: boolean
}

/**
 * Library Item Created Event
 */
export interface LibraryItemCreatedEvent extends BaseEvent {
  eventType: typeof EVENT_NAMES.LIBRARY_ITEM_CREATED
  libraryItemId: string
  userId: string
  url: string
  title?: string
}

/**
 * Library Item Updated Event
 */
export interface LibraryItemUpdatedEvent extends BaseEvent {
  eventType: typeof EVENT_NAMES.LIBRARY_ITEM_UPDATED
  libraryItemId: string
  userId: string
  updatedFields: string[]
}

/**
 * Library Item Deleted Event
 */
export interface LibraryItemDeletedEvent extends BaseEvent {
  eventType: typeof EVENT_NAMES.LIBRARY_ITEM_DELETED
  libraryItemId: string
  userId: string
}

/**
 * Notification Requested Event
 */
export interface NotificationRequestedEvent extends BaseEvent {
  eventType: typeof EVENT_NAMES.NOTIFICATION_REQUESTED
  userId: string
  notificationType: 'email' | 'push' | 'in-app'
  title: string
  message: string
  data?: Record<string, unknown>
}

/**
 * Search Index Update Requested Event
 */
export interface SearchIndexUpdateRequestedEvent extends BaseEvent {
  eventType: typeof EVENT_NAMES.SEARCH_INDEX_UPDATE_REQUESTED
  libraryItemId: string
  action: 'index' | 'update' | 'delete'
}

/**
 * Union type of all events
 */
export type AppEvent =
  | ContentSaveRequestedEvent
  | ContentFetchStartedEvent
  | ContentFetchCompletedEvent
  | ContentFetchFailedEvent
  | LibraryItemCreatedEvent
  | LibraryItemUpdatedEvent
  | LibraryItemDeletedEvent
  | NotificationRequestedEvent
  | SearchIndexUpdateRequestedEvent

/**
 * Type exports for type-safe usage
 */
export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES]
