import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HighlightEntity } from './entities/highlight.entity'
import { LibraryItemEntity } from '../library/entities/library-item.entity'
import { HighlightService } from './highlight.service'
import { HighlightResolver } from './highlight.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([HighlightEntity, LibraryItemEntity])],
  providers: [HighlightService, HighlightResolver],
  exports: [HighlightService],
})
export class HighlightModule {}
