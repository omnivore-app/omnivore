import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HighlightEntity } from '../highlight/entities/highlight.entity'
import { IHighlightRepository } from './interfaces/highlight-repository.interface'

/**
 * TypeORM implementation of the IHighlightRepository interface
 * Handles all data access operations for highlights
 */
@Injectable()
export class HighlightRepository implements IHighlightRepository {
  constructor(
    @InjectRepository(HighlightEntity)
    private readonly repository: Repository<HighlightEntity>,
  ) {}

  /**
   * Find a highlight by ID and user ID
   */
  async findById(
    id: string,
    userId: string,
  ): Promise<HighlightEntity | null> {
    return this.repository.findOne({
      where: {
        id,
        userId,
      },
    })
  }

  /**
   * Find all highlights for a library item
   * Sorted by position (reading order)
   */
  async findByLibraryItem(
    libraryItemId: string,
    userId: string,
  ): Promise<HighlightEntity[]> {
    return this.repository.find({
      where: {
        libraryItemId,
        userId,
      },
      order: {
        highlightPositionPercent: 'ASC',
      },
    })
  }

  /**
   * Create a new highlight instance (without saving to database)
   */
  create(data: Partial<HighlightEntity>): HighlightEntity {
    return this.repository.create(data)
  }

  /**
   * Save (create or update) a highlight
   */
  async save(highlight: HighlightEntity): Promise<HighlightEntity> {
    return this.repository.save(highlight)
  }

  /**
   * Remove a highlight from the database
   */
  async remove(highlight: HighlightEntity): Promise<void> {
    await this.repository.remove(highlight)
  }
}
