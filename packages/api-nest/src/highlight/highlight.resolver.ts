import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../user/decorators/current-user.decorator'
import { User } from '../user/entities/user.entity'
import { HighlightService } from './highlight.service'
import { Highlight } from './dto/highlight.type'
import {
  CreateHighlightInput,
  UpdateHighlightInput,
} from './dto/highlight-inputs.type'
import { DeleteResult } from '../library/dto/library-inputs.type'
import { HighlightColor } from './entities/highlight.entity'

@Resolver(() => Highlight)
export class HighlightResolver {
  constructor(private readonly highlightService: HighlightService) {}

  // ==================== QUERIES ====================

  @Query(() => [Highlight], {
    description: 'Get all highlights for a library item',
  })
  @UseGuards(JwtAuthGuard)
  async highlights(
    @CurrentUser() user: User,
    @Args('libraryItemId', {
      type: () => String,
      description: 'Library item ID',
    })
    libraryItemId: string,
  ): Promise<Highlight[]> {
    const entities = await this.highlightService.findByLibraryItem(
      user.id,
      libraryItemId,
    )
    return entities.map(mapEntityToGraph)
  }

  @Query(() => Highlight, {
    nullable: true,
    description: 'Get a single highlight by ID',
  })
  @UseGuards(JwtAuthGuard)
  async highlight(
    @CurrentUser() user: User,
    @Args('id', { type: () => String, description: 'Highlight ID' })
    id: string,
  ): Promise<Highlight | null> {
    const entity = await this.highlightService.findById(user.id, id)
    return entity ? mapEntityToGraph(entity) : null
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => Highlight, {
    description: 'Create a new highlight with optional color',
  })
  @UseGuards(JwtAuthGuard)
  async createHighlight(
    @CurrentUser() user: User,
    @Args('input', {
      type: () => CreateHighlightInput,
      description: 'Highlight creation data',
    })
    input: CreateHighlightInput,
  ): Promise<Highlight> {
    const entity = await this.highlightService.createHighlight(user.id, input)
    return mapEntityToGraph(entity)
  }

  @Mutation(() => Highlight, {
    description: 'Update a highlight (annotation and/or color)',
  })
  @UseGuards(JwtAuthGuard)
  async updateHighlight(
    @CurrentUser() user: User,
    @Args('id', { type: () => String, description: 'Highlight ID' })
    id: string,
    @Args('input', {
      type: () => UpdateHighlightInput,
      description: 'Highlight update data',
    })
    input: UpdateHighlightInput,
  ): Promise<Highlight> {
    const entity = await this.highlightService.updateHighlight(
      user.id,
      id,
      input,
    )
    return mapEntityToGraph(entity)
  }

  @Mutation(() => DeleteResult, {
    description: 'Delete a highlight',
  })
  @UseGuards(JwtAuthGuard)
  async deleteHighlight(
    @CurrentUser() user: User,
    @Args('id', { type: () => String, description: 'Highlight ID' })
    id: string,
  ): Promise<DeleteResult> {
    return await this.highlightService.deleteHighlight(user.id, id)
  }
}

function mapEntityToGraph(entity: any): Highlight {
  return {
    id: entity.id,
    shortId: entity.shortId,
    libraryItemId: entity.libraryItemId,
    quote: entity.quote ?? null,
    prefix: entity.prefix ?? null,
    suffix: entity.suffix ?? null,
    patch: entity.patch ?? null,
    annotation: entity.annotation ?? null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    sharedAt: entity.sharedAt ?? null,
    highlightPositionPercent: entity.highlightPositionPercent ?? 0,
    highlightPositionAnchorIndex: entity.highlightPositionAnchorIndex ?? 0,
    highlightType: entity.highlightType,
    html: entity.html ?? null,
    color: entity.color ?? HighlightColor.YELLOW,
    representation: entity.representation,
    selectors: entity.selectors ?? {},
    contentVersion: entity.contentVersion ?? null,
  }
}
