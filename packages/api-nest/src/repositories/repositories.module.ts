import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LibraryItemEntity } from '../library/entities/library-item.entity'
import { LibraryItemRepository } from './library-item.repository'
import { HighlightEntity } from '../highlight/entities/highlight.entity'
import { HighlightRepository } from './highlight.repository'
import { Label } from '../label/entities/label.entity'
import { EntityLabel } from '../label/entities/entity-label.entity'
import { LabelRepository } from './label.repository'
import { EntityLabelRepository } from './entity-label.repository'
import { ReadingProgressEntity } from '../reading-progress/entities/reading-progress.entity'
import { ReadingProgressRepository } from './reading-progress.repository'
import { REPOSITORY_TOKENS } from './injection-tokens'

/**
 * RepositoriesModule
 *
 * Centralized module for all repository implementations.
 * This module can be imported by any module that needs repository access
 * without creating circular dependencies.
 */
@Module({
  imports: [
    // Register all entities that repositories need
    TypeOrmModule.forFeature([
      LibraryItemEntity,
      HighlightEntity,
      Label,
      EntityLabel,
      ReadingProgressEntity,
    ]),
  ],
  providers: [
    {
      provide: REPOSITORY_TOKENS.ILibraryItemRepository,
      useClass: LibraryItemRepository,
    },
    {
      provide: REPOSITORY_TOKENS.IHighlightRepository,
      useClass: HighlightRepository,
    },
    {
      provide: REPOSITORY_TOKENS.ILabelRepository,
      useClass: LabelRepository,
    },
    {
      provide: REPOSITORY_TOKENS.IEntityLabelRepository,
      useClass: EntityLabelRepository,
    },
    {
      provide: REPOSITORY_TOKENS.IReadingProgressRepository,
      useClass: ReadingProgressRepository,
    },
  ],
  exports: [
    REPOSITORY_TOKENS.ILibraryItemRepository,
    REPOSITORY_TOKENS.IHighlightRepository,
    REPOSITORY_TOKENS.ILabelRepository,
    REPOSITORY_TOKENS.IEntityLabelRepository,
    REPOSITORY_TOKENS.IReadingProgressRepository,
    TypeOrmModule, // Export TypeOrmModule to make raw repositories available in tests
  ],
})
export class RepositoriesModule {}
