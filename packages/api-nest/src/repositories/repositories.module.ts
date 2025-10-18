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
    ]),
  ],
  providers: [
    {
      provide: 'ILibraryItemRepository',
      useClass: LibraryItemRepository,
    },
    {
      provide: 'IHighlightRepository',
      useClass: HighlightRepository,
    },
    {
      provide: 'ILabelRepository',
      useClass: LabelRepository,
    },
    {
      provide: 'IEntityLabelRepository',
      useClass: EntityLabelRepository,
    },
  ],
  exports: [
    'ILibraryItemRepository',
    'IHighlightRepository',
    'ILabelRepository',
    'IEntityLabelRepository',
    TypeOrmModule, // Export TypeOrmModule to make raw repositories available in tests
  ],
})
export class RepositoriesModule {}
