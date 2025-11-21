import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../user/decorators/current-user.decorator'
import { User } from '../user/entities/user.entity'
import { ReadingProgressService } from './reading-progress.service'
import { ReadingProgress } from './dto/reading-progress.type'
import { UpdateReadingProgressInput } from './dto/reading-progress-inputs.type'
import { ReadingProgressEntity } from './entities/reading-progress.entity'

/**
 * Map ReadingProgressEntity to GraphQL ReadingProgress type
 */
function mapEntityToGraph(entity: ReadingProgressEntity): ReadingProgress {
  return {
    id: entity.id,
    libraryItemId: entity.libraryItemId,
    contentVersion: entity.contentVersion,
    lastSeenSentinel: entity.lastSeenSentinel,
    highestSeenSentinel: entity.highestSeenSentinel,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}

@Resolver(() => ReadingProgress)
export class ReadingProgressResolver {
  constructor(
    private readonly readingProgressService: ReadingProgressService,
  ) {}

  // ==================== QUERIES ====================

  @Query(() => ReadingProgress, {
    nullable: true,
    description: 'Get reading progress for a library item',
  })
  @UseGuards(JwtAuthGuard)
  async readingProgress(
    @CurrentUser() user: User,
    @Args('libraryItemId', {
      type: () => String,
      description: 'Library item ID',
    })
    libraryItemId: string,
    @Args('contentVersion', {
      type: () => String,
      nullable: true,
      description: 'Optional content version to filter by',
    })
    contentVersion?: string,
  ): Promise<ReadingProgress | null> {
    const entity = await this.readingProgressService.getProgress(
      user.id,
      libraryItemId,
      contentVersion,
    )
    return entity ? mapEntityToGraph(entity) : null
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => ReadingProgress, {
    description: 'Update sentinel-based reading progress for a library item',
  })
  @UseGuards(JwtAuthGuard)
  async updateReadingProgress(
    @CurrentUser() user: User,
    @Args('input', {
      type: () => UpdateReadingProgressInput,
      description: 'Reading progress data with sentinels',
    })
    input: UpdateReadingProgressInput,
  ): Promise<ReadingProgress> {
    const entity = await this.readingProgressService.updateProgress(
      user.id,
      input,
    )
    return mapEntityToGraph(entity)
  }
}
