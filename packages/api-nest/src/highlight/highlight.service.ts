import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common'
import { HighlightEntity, HighlightType } from './entities/highlight.entity'
import { CreateHighlightInput, UpdateHighlightInput } from './dto/highlight-inputs.type'
import { ILibraryItemRepository } from '../repositories/interfaces/library-item-repository.interface'
import { IHighlightRepository } from '../repositories/interfaces/highlight-repository.interface'

@Injectable()
export class HighlightService {
  private readonly logger = new Logger(HighlightService.name)

  constructor(
    @Inject('IHighlightRepository')
    private readonly highlightRepository: IHighlightRepository,
    @Inject('ILibraryItemRepository')
    private readonly libraryItemRepository: ILibraryItemRepository,
  ) {}

  /**
   * Get all highlights for a library item
   */
  async findByLibraryItem(
    userId: string,
    libraryItemId: string,
  ): Promise<HighlightEntity[]> {
    // Verify the library item belongs to the user
    const libraryItem = await this.libraryItemRepository.findById(
      libraryItemId,
      userId,
    )

    if (!libraryItem) {
      throw new NotFoundException(
        `Library item with ID ${libraryItemId} not found`,
      )
    }

    // Delegate to repository for data access
    return this.highlightRepository.findByLibraryItem(libraryItemId, userId)
  }

  /**
   * Get a single highlight by ID
   */
  async findById(userId: string, id: string): Promise<HighlightEntity | null> {
    return this.highlightRepository.findById(id, userId)
  }

  /**
   * Create a new highlight
   */
  async createHighlight(
    userId: string,
    input: CreateHighlightInput,
  ): Promise<HighlightEntity> {
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
