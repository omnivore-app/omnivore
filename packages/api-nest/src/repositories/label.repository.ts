import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Label } from '../label/entities/label.entity'
import { ILabelRepository } from './interfaces/label-repository.interface'

/**
 * TypeORM implementation of the ILabelRepository interface
 * Handles all data access operations for labels
 */
@Injectable()
export class LabelRepository implements ILabelRepository {
  constructor(
    @InjectRepository(Label)
    private readonly repository: Repository<Label>,
  ) {}

  /**
   * Find all labels for a user, sorted by position
   */
  async findAll(userId: string): Promise<Label[]> {
    return this.repository.find({
      where: { userId },
      order: { position: 'ASC' },
    })
  }

  /**
   * Find a label by ID and user ID
   */
  async findById(id: string, userId: string): Promise<Label | null> {
    return this.repository.findOne({
      where: { id, userId },
    })
  }

  /**
   * Find a label by name and user ID
   */
  async findByName(name: string, userId: string): Promise<Label | null> {
    return this.repository.findOne({
      where: { userId, name },
    })
  }

  /**
   * Find multiple labels by IDs for a user
   */
  async findByIds(labelIds: string[], userId: string): Promise<Label[]> {
    if (labelIds.length === 0) {
      return []
    }

    return this.repository.find({
      where: labelIds.map((id) => ({ id, userId })),
      order: { position: 'ASC' },
    })
  }

  /**
   * Create a new label instance (without saving to database)
   */
  create(data: Partial<Label>): Label {
    return this.repository.create(data)
  }

  /**
   * Save (create or update) a label
   */
  async save(label: Label): Promise<Label> {
    return this.repository.save(label)
  }

  /**
   * Remove a label from the database
   */
  async remove(label: Label): Promise<void> {
    await this.repository.remove(label)
  }
}
