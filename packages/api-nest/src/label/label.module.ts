import { Module } from '@nestjs/common'
import { LabelService } from './label.service'
import { LabelResolver } from './label.resolver'
import { RepositoriesModule } from '../repositories/repositories.module'

@Module({
  imports: [
    RepositoriesModule, // Access to ILabelRepository, IEntityLabelRepository, and ILibraryItemRepository
  ],
  providers: [LabelService, LabelResolver],
  exports: [LabelService],
})
export class LabelModule {}
