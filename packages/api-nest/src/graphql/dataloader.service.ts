import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { IEntityLabelRepository } from '../repositories/interfaces/entity-label-repository.interface'
import { IHighlightRepository } from '../repositories/interfaces/highlight-repository.interface'
import { IReadingProgressRepository } from '../repositories/interfaces/reading-progress-repository.interface'
import { Label } from '../label/entities/label.entity'
import { HighlightEntity } from '../highlight/entities/highlight.entity'
import { ReadingProgressEntity } from '../reading-progress/entities/reading-progress.entity'
import { User } from '../user/entities/user.entity'
import { REPOSITORY_TOKENS } from '../repositories/injection-tokens'

/**
 * Authenticated request object with user populated by JwtAuthGuard
 */
export interface AuthenticatedRequest {
  user?: User
}

/**
 * DataLoader service for batching GraphQL queries
 * Prevents N+1 query problems by batching multiple individual requests
 * into single database queries
 *
 * This service should be instantiated per GraphQL request in the context
 */
export class DataLoaderService {
  public readonly labels: DataLoader<string, Label[]>

  public readonly highlights: DataLoader<string, HighlightEntity[]>

  public readonly readingProgress: DataLoader<
    string,
    ReadingProgressEntity | null
  >

  constructor(
    entityLabelRepository: IEntityLabelRepository,
    highlightRepository: IHighlightRepository,
    readingProgressRepository: IReadingProgressRepository,
    request: AuthenticatedRequest,
  ) {
    // Access user lazily from request (set by JwtAuthGuard after context is created)
    const getUserId = (): string | undefined => request.user?.id

    // Initialize DataLoader for labels
    // This batches multiple getLibraryItemLabels calls into a single query
    this.labels = new DataLoader<string, Label[]>(
      async (libraryItemIds: readonly string[]) => {
        const ids = libraryItemIds as string[]
        const userId = getUserId()

        if (!userId || ids.length === 0) {
          return libraryItemIds.map(() => [])
        }

        // Batch fetch all entity labels for the given library item IDs
        const entityLabelsMap =
          await entityLabelRepository.findByLibraryItemIds(ids)

        // Map to array of label arrays, filtering by user ID and sorting by position
        return libraryItemIds.map((libraryItemId) => {
          const entityLabels = entityLabelsMap.get(libraryItemId) || []
          const labels = entityLabels
            .map((el) => el.label)
            .filter((label) => label.userId === userId)

          // Sort by position
          return labels.sort((a, b) => a.position - b.position)
        })
      },
      {
        cacheKeyFn: (key: string) => key,
      },
    )

    // Initialize DataLoader for highlights
    // This batches multiple highlights queries into a single query
    this.highlights = new DataLoader<string, HighlightEntity[]>(
      async (libraryItemIds: readonly string[]) => {
        const ids = libraryItemIds as string[]
        const userId = getUserId()

        if (!userId || ids.length === 0) {
          return libraryItemIds.map(() => [])
        }

        // Batch fetch all highlights for the given library item IDs
        const highlightsMap = await highlightRepository.findByLibraryItemIds(
          ids,
          userId,
        )

        // Map to array of highlight arrays
        return libraryItemIds.map(
          (libraryItemId) => highlightsMap.get(libraryItemId) || [],
        )
      },
      {
        cacheKeyFn: (key: string) => key,
      },
    )

    // Initialize DataLoader for reading progress
    // This batches multiple reading progress queries into a single query
    this.readingProgress = new DataLoader<string, ReadingProgressEntity | null>(
      async (libraryItemIds: readonly string[]) => {
        const ids = libraryItemIds as string[]
        const userId = getUserId()

        if (!userId || ids.length === 0) {
          return libraryItemIds.map(() => null)
        }

        // Batch fetch reading progress for the given library item IDs
        const progressMap =
          await readingProgressRepository.findByLibraryItemIds(ids, userId)

        // Map to array of progress entities (or null if not found)
        return libraryItemIds.map(
          (libraryItemId) => progressMap.get(libraryItemId) || null,
        )
      },
      {
        cacheKeyFn: (key: string) => key,
      },
    )
  }
}

/**
 * Factory service to create DataLoader instances per request
 */
@Injectable()
export class DataLoaderFactory {
  constructor(
    @Inject(REPOSITORY_TOKENS.IEntityLabelRepository)
    private readonly entityLabelRepository: IEntityLabelRepository,
    @Inject(REPOSITORY_TOKENS.IHighlightRepository)
    private readonly highlightRepository: IHighlightRepository,
    @Inject(REPOSITORY_TOKENS.IReadingProgressRepository)
    private readonly readingProgressRepository: IReadingProgressRepository,
  ) {}

  create(request: AuthenticatedRequest): DataLoaderService {
    return new DataLoaderService(
      this.entityLabelRepository,
      this.highlightRepository,
      this.readingProgressRepository,
      request,
    )
  }
}
