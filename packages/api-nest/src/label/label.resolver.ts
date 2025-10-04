import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../user/decorators/current-user.decorator'
import { User } from '../user/entities/user.entity'
import { LabelService } from './label.service'
import { Label } from './dto/label.type'
import { CreateLabelInput, UpdateLabelInput } from './dto/label-inputs.type'
import { DeleteResult } from '../library/dto/library-inputs.type'

@Resolver(() => Label)
export class LabelResolver {
  constructor(private readonly labelService: LabelService) {}

  @Query(() => [Label], { description: 'Get all labels for the current user' })
  @UseGuards(JwtAuthGuard)
  async labels(@CurrentUser() user: User): Promise<Label[]> {
    return this.labelService.findAll(user.id)
  }

  @Query(() => Label, {
    nullable: true,
    description: 'Get a single label by ID',
  })
  @UseGuards(JwtAuthGuard)
  async label(
    @CurrentUser() user: User,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Label | null> {
    try {
      return await this.labelService.findOne(user.id, id)
    } catch (error) {
      return null
    }
  }

  @Mutation(() => Label, { description: 'Create a new label' })
  @UseGuards(JwtAuthGuard)
  async createLabel(
    @CurrentUser() user: User,
    @Args('input') input: CreateLabelInput,
  ): Promise<Label> {
    return this.labelService.create(user.id, input)
  }

  @Mutation(() => Label, { description: 'Update an existing label' })
  @UseGuards(JwtAuthGuard)
  async updateLabel(
    @CurrentUser() user: User,
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateLabelInput,
  ): Promise<Label> {
    return this.labelService.update(user.id, id, input)
  }

  @Mutation(() => DeleteResult, { description: 'Delete a label' })
  @UseGuards(JwtAuthGuard)
  async deleteLabel(
    @CurrentUser() user: User,
    @Args('id', { type: () => String }) id: string,
  ): Promise<DeleteResult> {
    const success = await this.labelService.delete(user.id, id)
    return {
      success,
      message: success ? 'Label deleted successfully' : 'Failed to delete label',
      itemId: id,
    }
  }

  @Mutation(() => [Label], {
    description: 'Set labels for a library item (replaces existing labels)',
  })
  @UseGuards(JwtAuthGuard)
  async setLibraryItemLabels(
    @CurrentUser() user: User,
    @Args('itemId', { type: () => String }) itemId: string,
    @Args('labelIds', { type: () => [String] }) labelIds: string[],
  ): Promise<Label[]> {
    return this.labelService.setLibraryItemLabels(user.id, itemId, labelIds)
  }
}
