import { Module } from '@nestjs/common'
import { HighlightService } from './highlight.service'
import { HighlightResolver } from './highlight.resolver'
import { RepositoriesModule } from '../repositories/repositories.module'

@Module({
  imports: [
    RepositoriesModule, // Access to IHighlightRepository and ILibraryItemRepository
  ],
  providers: [HighlightService, HighlightResolver],
  exports: [HighlightService],
})
export class HighlightModule {}
