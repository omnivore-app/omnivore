import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Label } from './entities/label.entity'
import { EntityLabel } from './entities/entity-label.entity'
import { LibraryItemEntity } from '../library/entities/library-item.entity'
import { LabelService } from './label.service'
import { LabelResolver } from './label.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Label, EntityLabel, LibraryItemEntity])],
  providers: [LabelService, LabelResolver],
  exports: [LabelService],
})
export class LabelModule {}
