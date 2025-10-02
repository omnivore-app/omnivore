import { logger } from '../utils/logger'
import { ClassifiedError } from '../errors/content-error-classifier'

/**
 * Service responsible for communicating content processing errors to users
 * and handling retry success notifications
 */
export class ErrorCommunicationService {
  private readonly logger = logger.child({
    context: 'error-communication-service',
  })

  /**
   * Handle content processing errors by logging and potentially notifying users
   * @param libraryItemId The ID of the library item that failed
   * @param userId The ID of the user who owns the item
   * @param classifiedError The classified error information
   * @param url The URL that was being processed
   * @param attemptCount The current attempt number
   */
  async handleContentError(
    libraryItemId: string,
    userId: string,
    classifiedError: ClassifiedError,
    url: string,
    attemptCount: number
  ): Promise<void> {
    this.logger.error('Content processing error', {
      libraryItemId,
      userId,
      url,
      attemptCount,
      errorType: classifiedError.errorType,
      isRetryable: classifiedError.isRetryable,
      shouldNotifyUser: classifiedError.shouldNotifyUser,
      userMessage: classifiedError.userMessage,
      technicalMessage: classifiedError.technicalMessage,
    })

    // TODO: Implement actual user notification system
    // This could involve:
    // - Updating the library item with error state
    // - Sending push notifications for critical errors
    // - Email notifications for persistent failures
    // - WebSocket notifications for real-time updates

    if (classifiedError.shouldNotifyUser && attemptCount >= 3) {
      // Only notify users after multiple attempts for non-retryable errors
      await this.notifyUserOfError(
        libraryItemId,
        userId,
        classifiedError.userMessage,
        url
      )
    }
  }

  /**
   * Handle successful retry after previous failures
   * @param libraryItemId The ID of the library item that succeeded
   * @param userId The ID of the user who owns the item
   * @param attemptCount The attempt number that succeeded
   */
  async handleRetrySuccess(
    libraryItemId: string,
    userId: string,
    attemptCount: number
  ): Promise<void> {
    this.logger.info('Content processing succeeded after retry', {
      libraryItemId,
      userId,
      attemptCount,
    })

    // TODO: Implement retry success notifications
    // This could involve:
    // - Updating the library item to clear error state
    // - Sending success notifications to users who were previously notified of errors
    // - Updating metrics for retry success rates

    if (attemptCount > 3) {
      // Notify user of eventual success after multiple failures
      await this.notifyUserOfRetrySuccess(libraryItemId, userId, attemptCount)
    }
  }

  /**
   * Notify user of content processing error
   * @param libraryItemId The ID of the library item that failed
   * @param userId The ID of the user to notify
   * @param message The user-friendly error message
   * @param url The URL that failed to process
   */
  private async notifyUserOfError(
    libraryItemId: string,
    userId: string,
    message: string,
    url: string
  ): Promise<void> {
    this.logger.info('Notifying user of content processing error', {
      libraryItemId,
      userId,
      message,
      url,
    })

    // TODO: Implement actual notification mechanism
    // Options include:
    // - GraphQL subscriptions for real-time updates
    // - Push notifications via service workers
    // - Email notifications for persistent errors
    // - In-app notification system
    // - Update library item status to show error state
  }

  /**
   * Notify user of successful retry
   * @param libraryItemId The ID of the library item that succeeded
   * @param userId The ID of the user to notify
   * @param attemptCount The attempt number that succeeded
   */
  private async notifyUserOfRetrySuccess(
    libraryItemId: string,
    userId: string,
    attemptCount: number
  ): Promise<void> {
    this.logger.info('Notifying user of successful retry', {
      libraryItemId,
      userId,
      attemptCount,
    })

    // TODO: Implement actual success notification mechanism
    // This should clear any previous error notifications and
    // potentially inform the user that the content is now available
  }
}
