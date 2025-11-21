import { Module } from '@nestjs/common'
import { ReadingProgressService } from './reading-progress.service'
import { ReadingProgressResolver } from './reading-progress.resolver'
import { RepositoriesModule } from '../repositories/repositories.module'

/**
 * ReadingProgressModule
 *
 * Provides sentinel-based reading progress tracking functionality
 * Manages reading position persistence per user/item/content version
 */
@Module({
  imports: [
    RepositoriesModule, // Access to IReadingProgressRepository and ILibraryItemRepository
  ],
  providers: [ReadingProgressService, ReadingProgressResolver],
  exports: [ReadingProgressService],
})
export class ReadingProgressModule {}
