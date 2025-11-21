import {
  Args,
  Int,
  Query,
  Mutation,
  Resolver,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../user/decorators/current-user.decorator'
import { User } from '../user/entities/user.entity'
import { LibraryService } from './library.service'
import { DataLoaderService } from '../graphql/dataloader.service'
import {
  LibraryItem,
  LibraryItemsConnection,
  BulkActionResult,
  SearchResult,
  SearchSuccess,
  SearchItemEdge,
  SearchPageInfo,
} from './dto/library-item.type'
import {
  DeleteResult,
  LibrarySearchInput,
  SaveUrlInput,
  UpdateNotebookInput,
  UpdateLibraryItemInput,
} from './dto/library-inputs.type'
import { LabelService } from '../label/label.service'
import { Label } from '../label/dto/label.type'
import { LibraryItemEntity } from './entities/library-item.entity'

/**
 * Library item with entity fields for field resolvers
 * Extends the GraphQL type to include database entity fields
 */
interface LibraryItemWithEntityFields extends LibraryItem {
  totalSentinels?: number
}

@Resolver(() => LibraryItem)
export class LibraryResolver {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly labelService: LabelService,
  ) {}

  // ==================== FIELD RESOLVERS ====================

  @ResolveField(() => [Label], { nullable: true })
  @UseGuards(JwtAuthGuard)
  async labels(
    @Parent() libraryItem: LibraryItem,
    @CurrentUser() user: User,
    @Context('dataLoaders') dataLoaders: DataLoaderService,
  ): Promise<Label[] | null> {
    // Use DataLoader to batch label queries and prevent N+1 problems
    const labels = await dataLoaders.labels.load(libraryItem.id)
    return labels.length > 0 ? labels : null
  }

  @ResolveField(() => Number, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async readingProgressPercent(
    @Parent() libraryItem: LibraryItemWithEntityFields,
    @CurrentUser() user: User,
    @Context('dataLoaders') dataLoaders: DataLoaderService,
  ): Promise<number | null> {
    // Get total sentinels from the library item
    const totalSentinels = libraryItem.totalSentinels || 0

    if (totalSentinels === 0) {
      return null // No sentinels injected yet
    }

    // Use DataLoader to batch reading progress queries
    const progress = await dataLoaders.readingProgress.load(libraryItem.id)

    if (!progress || progress.highestSeenSentinel === 0) {
      return null // No reading progress yet
    }

    // Calculate percentage: (highest_seen_sentinel / total_sentinels) * 100
    let percent = Math.min(100, Math.round((progress.highestSeenSentinel / totalSentinels) * 100))

    // Round up to 100% if >= 95% (accounts for sentinels not being at the very end)
    if (percent >= 95 && percent < 100) {
      percent = 100
    }

    return percent
  }

  // ==================== QUERIES ====================

  @Query(() => LibraryItemsConnection)
  @UseGuards(JwtAuthGuard)
  async libraryItems(
    @CurrentUser() user: User,
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first = 20,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('search', { type: () => LibrarySearchInput, nullable: true })
    search?: LibrarySearchInput,
  ): Promise<LibraryItemsConnection> {
    const { items, nextCursor } = await this.libraryService.listForUser(
      user.id,
      first,
      after,
      search,
    )

    return {
      items: items.map(mapEntityToGraph),
      nextCursor,
    }
  }

  @Query(() => LibraryItem, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async libraryItem(
    @CurrentUser() user: User,
    @Args('id', { type: () => String }) id: string,
  ): Promise<LibraryItem | null> {
    const entity = await this.libraryService.findById(user.id, id)
    return entity ? mapEntityToGraph(entity) : null
  }

  /**
   * Legacy search query for backward compatibility with frontend
   * Maps to libraryItems but returns the expected edges/pageInfo structure
   */
  @Query(() => SearchResult, {
    name: 'search',
    description: 'Legacy search query for backward compatibility',
  })
  @UseGuards(JwtAuthGuard)
  async search(
    @CurrentUser() user: User,
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first = 20,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('query', { type: () => String, nullable: true }) query?: string,
    @Args('includeContent', {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    includeContent = false,
  ): Promise<typeof SearchResult> {
    try {
      // Convert query string to search input format
      const searchInput: LibrarySearchInput | undefined = query
        ? { query }
        : undefined

      const { items, nextCursor } = await this.libraryService.listForUser(
        user.id,
        first,
        after,
        searchInput,
      )

      // Transform to legacy format with edges and pageInfo
      // Each edge should have cursor = item.id, not nextCursor
      const edges: SearchItemEdge[] = items.map((item) => {
        const graphItem = mapEntityToGraph(item)

        // Strip content if includeContent is false for better performance
        if (!includeContent && graphItem.content) {
          graphItem.content = null
        }

        return {
          cursor: item.id, // Each edge cursor should be the item's ID
          node: graphItem,
        }
      })

      const pageInfo: SearchPageInfo = {
        hasNextPage: !!nextCursor,
        hasPreviousPage: !!after,
        startCursor: items.length > 0 ? items[0].id : null,
        endCursor: items.length > 0 ? items[items.length - 1].id : null, // Last item's ID, not nextCursor
        totalCount: null, // Not currently tracked
      }

      return {
        edges,
        pageInfo,
      } as SearchSuccess
    } catch (error) {
      return {
        errorCodes: ['SEARCH_ERROR'],
      }
    }
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => LibraryItem, {
    description: 'Archive or unarchive a library item',
  })
  @UseGuards(JwtAuthGuard)
  async archiveLibraryItem(
    @CurrentUser() user: User,
    @Args('id', { type: () => String, description: 'Library item ID' })
    id: string,
    @Args('archived', {
      type: () => Boolean,
      description: 'Whether to archive (true) or unarchive (false)',
    })
    archived: boolean,
  ): Promise<LibraryItem> {
    const entity = await this.libraryService.archiveItem(user.id, id, archived)
    return mapEntityToGraph(entity)
  }

  @Mutation(() => DeleteResult, {
    description:
      'Delete a library item (moves to trash or permanently deletes if already in trash)',
  })
  @UseGuards(JwtAuthGuard)
  async deleteLibraryItem(
    @CurrentUser() user: User,
    @Args('id', { type: () => String, description: 'Library item ID' })
    id: string,
  ): Promise<DeleteResult> {
    return await this.libraryService.deleteItem(user.id, id)
  }

  @Mutation(() => LibraryItem, {
    description: 'Update notebook content for a library item',
  })
  @UseGuards(JwtAuthGuard)
  async updateNotebook(
    @CurrentUser() user: User,
    @Args('id', { type: () => String, description: 'Library item ID' })
    id: string,
    @Args('input', {
      type: () => UpdateNotebookInput,
      description: 'Notebook content',
    })
    input: UpdateNotebookInput,
  ): Promise<LibraryItem> {
    const entity = await this.libraryService.updateNotebook(
      user.id,
      id,
      input.note,
    )
    return mapEntityToGraph(entity)
  }

  @Mutation(() => LibraryItem, {
    description: 'Update library item metadata (title, author, description)',
  })
  @UseGuards(JwtAuthGuard)
  async updateLibraryItem(
    @CurrentUser() user: User,
    @Args('id', { type: () => String, description: 'Library item ID' })
    id: string,
    @Args('input', {
      type: () => UpdateLibraryItemInput,
      description: 'Updated library item metadata',
    })
    input: UpdateLibraryItemInput,
  ): Promise<LibraryItem> {
    const entity = await this.libraryService.updateLibraryItemMetadata(
      user.id,
      id,
      input,
    )
    return mapEntityToGraph(entity)
  }

  @Mutation(() => LibraryItem, {
    description: 'Move a library item to a different folder',
  })
  @UseGuards(JwtAuthGuard)
  async moveLibraryItemToFolder(
    @CurrentUser() user: User,
    @Args('id', { type: () => String, description: 'Library item ID' })
    id: string,
    @Args('folder', {
      type: () => String,
      description: 'Target folder (inbox, archive, trash)',
    })
    folder: string,
  ): Promise<LibraryItem> {
    const entity = await this.libraryService.moveToFolder(user.id, id, folder)
    return mapEntityToGraph(entity)
  }

  // ==================== BULK MUTATIONS ====================

  @Mutation(() => BulkActionResult, {
    description: 'Archive or unarchive multiple library items',
  })
  @UseGuards(JwtAuthGuard)
  async bulkArchiveItems(
    @CurrentUser() user: User,
    @Args('itemIds', {
      type: () => [String],
      description: 'List of library item IDs to archive/unarchive',
    })
    itemIds: string[],
    @Args('archived', {
      type: () => Boolean,
      description: 'Whether to archive (true) or unarchive (false)',
    })
    archived: boolean,
  ): Promise<BulkActionResult> {
    return await this.libraryService.bulkArchive(user.id, itemIds, archived)
  }

  @Mutation(() => BulkActionResult, {
    description: 'Delete multiple library items',
  })
  @UseGuards(JwtAuthGuard)
  async bulkDeleteItems(
    @CurrentUser() user: User,
    @Args('itemIds', {
      type: () => [String],
      description: 'List of library item IDs to delete',
    })
    itemIds: string[],
  ): Promise<BulkActionResult> {
    return await this.libraryService.bulkDelete(user.id, itemIds)
  }

  @Mutation(() => BulkActionResult, {
    description: 'Move multiple library items to a different folder',
  })
  @UseGuards(JwtAuthGuard)
  async bulkMoveToFolder(
    @CurrentUser() user: User,
    @Args('itemIds', {
      type: () => [String],
      description: 'List of library item IDs to move',
    })
    itemIds: string[],
    @Args('folder', {
      type: () => String,
      description: 'Target folder (inbox, archive, trash)',
    })
    folder: string,
  ): Promise<BulkActionResult> {
    return await this.libraryService.bulkMoveToFolder(user.id, itemIds, folder)
  }

  @Mutation(() => BulkActionResult, {
    description: 'Mark multiple library items as read',
  })
  @UseGuards(JwtAuthGuard)
  async bulkMarkAsRead(
    @CurrentUser() user: User,
    @Args('itemIds', {
      type: () => [String],
      description: 'List of library item IDs to mark as read',
    })
    itemIds: string[],
  ): Promise<BulkActionResult> {
    return await this.libraryService.bulkMarkAsRead(user.id, itemIds)
  }

  // ==================== CONTENT INGESTION ====================

  @Mutation(() => LibraryItem, {
    description: 'Save a URL to the library with content extraction',
  })
  @UseGuards(JwtAuthGuard)
  async saveUrl(
    @CurrentUser() user: User,
    @Args('input', { type: () => SaveUrlInput })
    input: SaveUrlInput,
  ): Promise<LibraryItem> {
    const entity = await this.libraryService.saveUrl(user.id, input)
    return mapEntityToGraph(entity)
  }
}

/**
 * Map LibraryItemEntity to GraphQL LibraryItem type
 * Handles field name differences and null coalescing
 */
function mapEntityToGraph(entity: LibraryItemEntity): LibraryItem {
  const thumbnail = entity.thumbnail ?? null
  const wordCount = entity.wordCount ?? null
  const itemType = entity.itemType ?? 'ARTICLE'

  return {
    id: entity.id,
    title: entity.title,
    slug: entity.slug,
    originalUrl: entity.originalUrl,
    author: entity.author ?? null,
    description: entity.description ?? null,
    savedAt: entity.savedAt,
    createdAt: entity.createdAt,
    publishedAt: entity.publishedAt ?? null,
    readAt: entity.readAt ?? null,
    updatedAt: entity.updatedAt,
    state: entity.state,
    contentReader: entity.contentReader,
    folder: entity.folder,
    content: entity.readableContent ?? null,
    note: entity.note ?? null,
    noteUpdatedAt: entity.noteUpdatedAt ?? null,
    labels: null,
    thumbnail,
    wordCount,
    siteName: entity.siteName ?? null,
    siteIcon: entity.siteIcon ?? null,
    itemType,
    totalSentinels: entity.totalSentinels ?? 0, // For reading progress calculation
    // Legacy field aliases (TypeScript doesn't know about getters, so we set them directly)
    image: thumbnail,
    wordsCount: wordCount,
    pageType: itemType,
  } as LibraryItem
}
