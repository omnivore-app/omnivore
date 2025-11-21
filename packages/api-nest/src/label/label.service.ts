import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common'
import { Label } from './entities/label.entity'
import { CreateLabelInput, UpdateLabelInput } from './dto/label-inputs.type'
import { ILibraryItemRepository } from '../repositories/interfaces/library-item-repository.interface'
import { ILabelRepository } from '../repositories/interfaces/label-repository.interface'
import { IEntityLabelRepository } from '../repositories/interfaces/entity-label-repository.interface'
import { REPOSITORY_TOKENS } from '../repositories/injection-tokens'

@Injectable()
export class LabelService {
  constructor(
    @Inject(REPOSITORY_TOKENS.ILabelRepository)
    private readonly labelRepository: ILabelRepository,
    @Inject(REPOSITORY_TOKENS.IEntityLabelRepository)
    private readonly entityLabelRepository: IEntityLabelRepository,
    @Inject(REPOSITORY_TOKENS.ILibraryItemRepository)
    private readonly libraryItemRepository: ILibraryItemRepository,
  ) {}

  /**
   * Get all labels for a user
   */
  async findAll(userId: string): Promise<Label[]> {
    return this.labelRepository.findAll(userId)
  }

  /**
   * Get a single label by ID
   */
  async findOne(userId: string, labelId: string): Promise<Label> {
    const label = await this.labelRepository.findById(labelId, userId)

    if (!label) {
      throw new NotFoundException(`Label with ID ${labelId} not found`)
    }

    return label
  }

  /**
   * Create a new label
   */
  async create(userId: string, input: CreateLabelInput): Promise<Label> {
    // Check for duplicate label name
    const existing = await this.labelRepository.findByName(input.name, userId)

    if (existing) {
      throw new ConflictException(
        `Label with name "${input.name}" already exists`,
      )
    }

    const label = this.labelRepository.create({
      userId,
      name: input.name,
      color: input.color || '#000000',
      description: input.description,
    })

    return this.labelRepository.save(label)
  }

  /**
   * Update an existing label
   */
  async update(
    userId: string,
    labelId: string,
    input: UpdateLabelInput,
  ): Promise<Label> {
    const label = await this.findOne(userId, labelId)

    // Check if the label is internal (system label)
    if (label.internal) {
      throw new BadRequestException('Cannot modify internal system labels')
    }

    // If updating name, check for duplicates
    if (input.name && input.name !== label.name) {
      const existing = await this.labelRepository.findByName(input.name, userId)

      if (existing) {
        throw new ConflictException(
          `Label with name "${input.name}" already exists`,
        )
      }
    }

    // Update fields
    if (input.name !== undefined) label.name = input.name
    if (input.color !== undefined) label.color = input.color
    if (input.description !== undefined) label.description = input.description

    return this.labelRepository.save(label)
  }

  /**
   * Delete a label
   */
  async delete(userId: string, labelId: string): Promise<boolean> {
    const label = await this.findOne(userId, labelId)

    // Check if the label is internal (system label)
    if (label.internal) {
      throw new BadRequestException('Cannot delete internal system labels')
    }

    await this.labelRepository.remove(label)
    return true
  }

  /**
   * Set labels for a library item (replaces existing labels)
   */
  async setLibraryItemLabels(
    userId: string,
    libraryItemId: string,
    labelIds: string[],
  ): Promise<Label[]> {
    // Verify library item exists and belongs to user
    const libraryItem = await this.libraryItemRepository.findById(
      libraryItemId,
      userId,
    )

    if (!libraryItem) {
      throw new NotFoundException(
        `Library item with ID ${libraryItemId} not found`,
      )
    }

    // Verify all labels belong to the user
    let labels: Label[] = []
    if (labelIds.length > 0) {
      labels = await this.labelRepository.findByIds(labelIds, userId)

      if (labels.length !== labelIds.length) {
        throw new NotFoundException(
          'One or more labels not found or do not belong to the user',
        )
      }
    }

    // Remove existing labels for this library item
    await this.entityLabelRepository.deleteByLibraryItemId(libraryItemId)

    // Add new labels
    if (labelIds.length > 0) {
      const entityLabels = labelIds.map((labelId) =>
        this.entityLabelRepository.create({
          libraryItemId,
          labelId,
          source: 'user',
        }),
      )

      await this.entityLabelRepository.save(entityLabels)
    }

    // Update the label_names column on the library_item table for filtering
    libraryItem.labelNames = labels.map((label) => label.name)
    await this.libraryItemRepository.save(libraryItem)

    // Return the updated labels
    if (labelIds.length === 0) {
      return []
    }

    return this.labelRepository.findByIds(labelIds, userId)
  }

  /**
   * Get labels for a library item
   */
  async getLibraryItemLabels(
    userId: string,
    libraryItemId: string,
  ): Promise<Label[]> {
    const entityLabels =
      await this.entityLabelRepository.findByLibraryItemId(libraryItemId)

    // Filter to only return labels owned by the user
    const labels = entityLabels
      .map((el) => el.label)
      .filter((label) => label.userId === userId)

    // Sort by position
    return labels.sort((a, b) => a.position - b.position)
  }
}
