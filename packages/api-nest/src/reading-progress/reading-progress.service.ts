import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common'
import { ReadingProgressEntity } from './entities/reading-progress.entity'
import { UpdateReadingProgressInput } from './dto/reading-progress-inputs.type'
import { ILibraryItemRepository } from '../repositories/interfaces/library-item-repository.interface'
import { IReadingProgressRepository } from '../repositories/interfaces/reading-progress-repository.interface'
import { REPOSITORY_TOKENS } from '../repositories/injection-tokens'

/**
 * Service for managing sentinel-based reading progress
 * Handles business logic for tracking user reading positions
 */
@Injectable()
export class ReadingProgressService {
  private readonly logger = new Logger(ReadingProgressService.name)

  constructor(
    @Inject(REPOSITORY_TOKENS.IReadingProgressRepository)
    private readonly progressRepository: IReadingProgressRepository,
    @Inject(REPOSITORY_TOKENS.ILibraryItemRepository)
    private readonly libraryItemRepository: ILibraryItemRepository,
  ) {}

  /**
   * Get reading progress for a library item
   * @param userId - User ID
   * @param libraryItemId - Library item ID
   * @param contentVersion - Optional content version to filter by
   * @returns Reading progress or null if not found
   */
  async getProgress(
    userId: string,
    libraryItemId: string,
    contentVersion?: string,
  ): Promise<ReadingProgressEntity | null> {
    // Verify the library item exists and belongs to the user
    const libraryItem = await this.libraryItemRepository.findById(
      libraryItemId,
      userId,
    )

    if (!libraryItem) {
      throw new NotFoundException(
        `Library item with ID ${libraryItemId} not found`,
      )
    }

    // If content version is provided, get progress for that specific version
    if (contentVersion) {
      return this.progressRepository.findProgress(
        libraryItemId,
        userId,
        contentVersion,
      )
    }

    // Otherwise, get the most recent progress (any version)
    return this.progressRepository.findLatestProgress(libraryItemId, userId)
  }

  /**
   * Update or create reading progress
   * @param userId - User ID
   * @param input - Progress update data
   * @returns Updated reading progress
   */
  async updateProgress(
    userId: string,
    input: UpdateReadingProgressInput,
  ): Promise<ReadingProgressEntity> {
    // Verify the library item exists and belongs to the user
    const libraryItem = await this.libraryItemRepository.findById(
      input.libraryItemId,
      userId,
    )

    if (!libraryItem) {
      throw new NotFoundException(
        `Library item with ID ${input.libraryItemId} not found`,
      )
    }

    // Validate sentinel values
    if (input.lastSeenSentinel < 0 || input.highestSeenSentinel < 0) {
      throw new BadRequestException('Sentinel values must be non-negative')
    }

    // Normalize highestSeenSentinel: it should never be lower than lastSeenSentinel
    // This ensures data consistency - highest can't be less than current position
    let normalizedHighest = input.highestSeenSentinel
    if (input.lastSeenSentinel > input.highestSeenSentinel) {
      normalizedHighest = input.lastSeenSentinel
      this.logger.debug(
        `Normalizing highestSeenSentinel: ${input.highestSeenSentinel} -> ${normalizedHighest} ` +
          `(lastSeen: ${input.lastSeenSentinel}) for user ${userId} on item ${input.libraryItemId}`,
      )
    }

    // Update library item's total_sentinels if provided
    if (input.totalSentinels !== undefined && input.totalSentinels > 0) {
      await this.libraryItemRepository.update(input.libraryItemId, userId, {
        totalSentinels: input.totalSentinels,
      })
      this.logger.debug(
        `Updated total_sentinels to ${input.totalSentinels} for item ${input.libraryItemId}`,
      )
    }

    // Upsert progress (create or update) with normalized values
    const progress = await this.progressRepository.upsertProgress(
      userId,
      input.libraryItemId,
      input.contentVersion || null,
      input.lastSeenSentinel,
      normalizedHighest,
    )

    this.logger.log(
      `Updated reading progress for user ${userId} on item ${input.libraryItemId}: sentinel ${input.lastSeenSentinel}`,
    )

    return progress
  }

  /**
   * Get completion percentage based on sentinel progress
   * @param progress - Reading progress entity
   * @param totalSentinels - Total number of sentinels in the content
   * @returns Completion percentage (0-100)
   */
  calculateCompletion(
    progress: ReadingProgressEntity,
    totalSentinels: number,
  ): number {
    if (totalSentinels <= 0) return 0
    return Math.min(
      100,
      Math.round((progress.highestSeenSentinel / totalSentinels) * 100),
    )
  }

  /**
   * Detect if content has changed since last read
   * @param userId - User ID
   * @param libraryItemId - Library item ID
   * @param currentContentVersion - Current content hash
   * @returns True if content has changed, false otherwise
   */
  async hasContentChanged(
    userId: string,
    libraryItemId: string,
    currentContentVersion: string,
  ): Promise<boolean> {
    const latestProgress = await this.progressRepository.findLatestProgress(
      libraryItemId,
      userId,
    )

    if (!latestProgress || !latestProgress.contentVersion) {
      return false
    }

    return latestProgress.contentVersion !== currentContentVersion
  }
}
