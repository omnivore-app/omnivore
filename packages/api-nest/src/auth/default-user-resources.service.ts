import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Filter } from '../filter/entities/filter.entity'

export interface ProvisionOptions {
  client?: string
  username?: string
}

@Injectable()
export class DefaultUserResourcesService {
  private readonly logger = new Logger(DefaultUserResourcesService.name)

  constructor(
    @InjectRepository(Filter)
    private readonly filterRepository: Repository<Filter>,
  ) {}

  async provisionForUser(
    userId: string,
    options: ProvisionOptions,
  ): Promise<void> {
    this.logger.debug(`Provisioning default resources for ${userId}`, options)

    try {
      await this.createDefaultFilters(userId)
      await this.addPopularReads(userId, options.client)
    } catch (error) {
      this.logger.error(
        `Failed to provision resources for user ${userId}`,
        error,
      )
      // Don't throw - this shouldn't block user creation
    }
  }

  private async createDefaultFilters(userId: string): Promise<void> {
    const defaultFilters = [
      { name: 'Inbox', filter: 'in:inbox' },
      {
        name: 'Continue Reading',
        filter: 'in:inbox sort:read-desc is:unread',
      },
      { name: 'Non-Feed Items', filter: 'in:library' },
      { name: 'Highlights', filter: 'has:highlights mode:highlights' },
      { name: 'Unlabeled', filter: 'no:label' },
      { name: 'Oldest First', filter: 'sort:saved-asc' },
      { name: 'Files', filter: 'type:file' },
      { name: 'Archived', filter: 'in:archive' },
    ].map((filterData, position) => ({
      userId,
      name: filterData.name,
      filter: filterData.filter,
      position,
      category: 'Search',
      defaultFilter: true,
      visible: true,
      folder: 'inbox',
    }))

    try {
      // Create and save all default filters
      await this.filterRepository.save(defaultFilters)

      this.logger.debug(
        `Created ${defaultFilters.length} default filters for user ${userId}`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to create default filters for user ${userId}`,
        error,
      )
      throw error
    }
  }

  private async addPopularReads(
    userId: string,
    client?: string,
  ): Promise<void> {
    const defaultReads = ['omnivore_organize', 'power_read_it_later']

    switch (client) {
      case 'web':
        defaultReads.push('omnivore_web')
        break
      case 'ios':
        defaultReads.push('omnivore_ios')
        break
      case 'android':
        defaultReads.push('omnivore_android')
        break
    }

    // Always add the getting started article last
    defaultReads.push('omnivore_get_started')

    try {
      // TODO: Implement actual popular reads creation once we have:
      // 1. PopularRead entity
      // 2. LibraryItem entity
      // 3. The popular_read table data migrated to NestJS
      //
      // The implementation should:
      // 1. Query popular_read table for each key in defaultReads
      // 2. Copy each popular read to user's library_item table
      // 3. Set read_at to NOW() and reading_progress_bottom_percent to 2
      //    so items show up in "Continue Reading" section

      this.logger.debug(
        `Would add ${defaultReads.length} popular reads for user ${userId}`,
        {
          userId,
          client,
          popularReads: defaultReads,
          implementation: 'STUB - needs PopularRead and LibraryItem entities',
        },
      )

      // In the full implementation, this would be:
      // for (const readKey of defaultReads) {
      //   await this.addPopularReadToUser(userId, readKey)
      // }
    } catch (error) {
      this.logger.error(`Failed to add popular reads for user ${userId}`, error)
      // Don't throw - this shouldn't block user creation
    }
  }
}
