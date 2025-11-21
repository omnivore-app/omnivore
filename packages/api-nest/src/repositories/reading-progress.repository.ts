import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ReadingProgressEntity } from '../reading-progress/entities/reading-progress.entity'
import { IReadingProgressRepository } from './interfaces/reading-progress-repository.interface'

/**
 * TypeORM implementation of the IReadingProgressRepository interface
 * Handles all data access operations for sentinel-based reading progress
 */
@Injectable()
export class ReadingProgressRepository implements IReadingProgressRepository {
  constructor(
    @InjectRepository(ReadingProgressEntity)
    private readonly repository: Repository<ReadingProgressEntity>,
  ) {}

  /**
   * Find reading progress for a specific user + item + content version
   */
  async findProgress(
    libraryItemId: string,
    userId: string,
    contentVersion?: string | null,
  ): Promise<ReadingProgressEntity | null> {
    return this.repository.findOne({
      where: {
        libraryItemId,
        userId,
        // Handle null contentVersion correctly
        contentVersion: contentVersion ?? null,
      },
    })
  }

  /**
   * Find the most recent reading progress for a library item (any version)
   * Useful when content version is unknown or has changed
   */
  async findLatestProgress(
    libraryItemId: string,
    userId: string,
  ): Promise<ReadingProgressEntity | null> {
    return this.repository.findOne({
      where: {
        libraryItemId,
        userId,
      },
      order: {
        updatedAt: 'DESC',
      },
    })
  }

  /**
   * Create a new reading progress instance (without saving to database)
   */
  create(data: Partial<ReadingProgressEntity>): ReadingProgressEntity {
    return this.repository.create(data)
  }

  /**
   * Save (create or update) reading progress
   */
  async save(progress: ReadingProgressEntity): Promise<ReadingProgressEntity> {
    return this.repository.save(progress)
  }

  /**
   * Upsert reading progress using INSERT ... ON CONFLICT UPDATE
   * More efficient than separate find + save operations
   */
  async upsertProgress(
    userId: string,
    libraryItemId: string,
    contentVersion: string | null,
    lastSeenSentinel: number,
    highestSeenSentinel: number,
  ): Promise<ReadingProgressEntity> {
    // First, try to find existing progress
    const existing = await this.findProgress(
      libraryItemId,
      userId,
      contentVersion,
    )

    if (existing) {
      // Update existing record
      // Always update lastSeenSentinel, but only increase highestSeenSentinel
      existing.lastSeenSentinel = lastSeenSentinel
      existing.highestSeenSentinel = Math.max(
        existing.highestSeenSentinel,
        highestSeenSentinel,
      )
      return this.save(existing)
    }

    // Create new record
    const progress = this.create({
      userId,
      libraryItemId,
      contentVersion,
      lastSeenSentinel,
      highestSeenSentinel,
    })

    return this.save(progress)
  }

  /**
   * Batch find latest reading progress for multiple library items
   * Optimized for DataLoader to prevent N+1 queries
   */
  async findByLibraryItemIds(
    libraryItemIds: string[],
    userId: string,
  ): Promise<Map<string, ReadingProgressEntity>> {
    if (libraryItemIds.length === 0) {
      return new Map()
    }

    // Fetch all progress records for these items in one query
    const progressRecords = await this.repository
      .createQueryBuilder('rp')
      .where('rp.library_item_id IN (:...itemIds)', { itemIds: libraryItemIds })
      .andWhere('rp.user_id = :userId', { userId })
      .orderBy('rp.updated_at', 'DESC')
      .getMany()

    // Group by library_item_id, keeping only the most recent for each
    const progressMap = new Map<string, ReadingProgressEntity>()
    for (const progress of progressRecords) {
      if (!progressMap.has(progress.libraryItemId)) {
        progressMap.set(progress.libraryItemId, progress)
      }
    }

    return progressMap
  }
}
