import { Module } from '@nestjs/common'
import { LibraryResolver } from './library.resolver'
import { LibraryService } from './library.service'
import { LibraryController } from './library.controller'
import { LabelModule } from '../label/label.module'
import { QueueModule } from '../queue/queue.module'
import { RepositoriesModule } from '../repositories/repositories.module'

@Module({
  imports: [
    RepositoriesModule, // Access to ILibraryItemRepository
    LabelModule,
    QueueModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryResolver, LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
