import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EntityLabel } from '../label/entities/entity-label.entity'
import { IEntityLabelRepository } from './interfaces/entity-label-repository.interface'

/**
 * TypeORM implementation of the IEntityLabelRepository interface
 * Handles all data access operations for entity labels (library item <-> label relationships)
 */
@Injectable()
export class EntityLabelRepository implements IEntityLabelRepository {
  constructor(
    @InjectRepository(EntityLabel)
    private readonly repository: Repository<EntityLabel>,
  ) {}

  /**
   * Find entity labels for a library item with label relations loaded
   */
  async findByLibraryItemId(libraryItemId: string): Promise<EntityLabel[]> {
    return this.repository.find({
      where: { libraryItemId },
      relations: ['label'],
    })
  }

  /**
   * Delete all entity labels for a library item
   */
  async deleteByLibraryItemId(libraryItemId: string): Promise<void> {
    await this.repository.delete({ libraryItemId })
  }

  /**
   * Create a new entity label instance (without saving to database)
   */
  create(data: Partial<EntityLabel>): EntityLabel {
    return this.repository.create(data)
  }

  /**
   * Save (create or update) entity labels in bulk
   */
  async save(entityLabels: EntityLabel[]): Promise<EntityLabel[]> {
    return this.repository.save(entityLabels)
  }
}
