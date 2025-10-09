import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LibraryResolver } from './library.resolver'
import { LibraryService } from './library.service'
import { LibraryController } from './library.controller'
import { LibraryItemEntity } from './entities/library-item.entity'
import { LabelModule } from '../label/label.module'
import { QueueModule } from '../queue/queue.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([LibraryItemEntity]),
    LabelModule,
    QueueModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryResolver, LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
