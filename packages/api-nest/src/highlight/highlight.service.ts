import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HighlightEntity, HighlightType } from './entities/highlight.entity'
import { LibraryItemEntity } from '../library/entities/library-item.entity'
import { CreateHighlightInput, UpdateHighlightInput } from './dto/highlight-inputs.type'

@Injectable()
export class HighlightService {
  private readonly logger = new Logger(HighlightService.name)

  constructor(
    @InjectRepository(HighlightEntity)
    private readonly highlightRepository: Repository<HighlightEntity>,
    @InjectRepository(LibraryItemEntity)
    private readonly libraryItemRepository: Repository<LibraryItemEntity>,
  ) {}

  /**
   * Get all highlights for a library item
   */
  async findByLibraryItem(
    userId: string,
    libraryItemId: string,
  ): Promise<HighlightEntity[]> {
    // Verify the library item belongs to the user
    const libraryItem = await this.libraryItemRepository.findOne({
      where: { id: libraryItemId, userId },
    })

    if (!libraryItem) {
      throw new NotFoundException(
        `Library item with ID ${libraryItemId} not found`,
      )
    }

    return this.highlightRepository.find({
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
   * Get a single highlight by ID
   */
  async findById(userId: string, id: string): Promise<HighlightEntity | null> {
    return this.highlightRepository.findOne({
      where: {
        id,
        userId,
      },
    })
  }

  /**
   * Create a new highlight
   */
  async createHighlight(
    userId: string,
    input: CreateHighlightInput,
  ): Promise<HighlightEntity> {
    // Verify the library item exists and belongs to the user
    const libraryItem = await this.libraryItemRepository.findOne({
      where: { id: input.libraryItemId, userId },
    })

    if (!libraryItem) {
      throw new NotFoundException(
        `Library item with ID ${input.libraryItemId} not found`,
      )
    }

    // Generate a short ID (8 characters)
    const shortId = this.generateShortId()

    const highlight = this.highlightRepository.create({
      userId,
      libraryItemId: input.libraryItemId,
      shortId,
      quote: input.quote,
      prefix: input.prefix,
      suffix: input.suffix,
      annotation: input.annotation,
      highlightPositionPercent: input.highlightPositionPercent ?? 0,
      highlightPositionAnchorIndex: input.highlightPositionAnchorIndex ?? 0,
      color: input.color ?? 'yellow',
      html: input.html,
      highlightType: HighlightType.HIGHLIGHT,
      representation: 'CONTENT' as any,
    })

    return this.highlightRepository.save(highlight)
  }

  /**
   * Update an existing highlight
   */
  async updateHighlight(
    userId: string,
    id: string,
    input: UpdateHighlightInput,
  ): Promise<HighlightEntity> {
    const highlight = await this.findById(userId, id)

    if (!highlight) {
      throw new NotFoundException(`Highlight with ID ${id} not found`)
    }

    // Update only the fields that are provided
    if (input.annotation !== undefined) {
      highlight.annotation = input.annotation
    }

    if (input.color !== undefined) {
      highlight.color = input.color
    }

    return this.highlightRepository.save(highlight)
  }

  /**
   * Delete a highlight
   */
  async deleteHighlight(
    userId: string,
    id: string,
  ): Promise<{ success: boolean; message?: string; itemId: string }> {
    const highlight = await this.findById(userId, id)

    if (!highlight) {
      throw new NotFoundException(`Highlight with ID ${id} not found`)
    }

    await this.highlightRepository.remove(highlight)

    return {
      success: true,
      message: 'Highlight deleted successfully',
      itemId: id,
    }
  }

  /**
   * Generate a short ID for the highlight
   */
  private generateShortId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
