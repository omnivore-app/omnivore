import { Highlight } from './networking/fragments/highlightFragment'
import { ArticleReadingProgressMutationInput } from './networking/mutations/articleReadingProgressMutation'
import { MergeHighlightInput } from './networking/mutations/mergeHighlightMutation'
import { UpdateHighlightInput } from './networking/mutations/updateHighlightMutation'
import { CreateHighlightInput } from './networking/highlights/useItemHighlights'

export type ArticleMutations = {
  createHighlightMutation: (
    input: CreateHighlightInput
  ) => Promise<Highlight | undefined>
  deleteHighlightMutation: (
    libraryItemId: string,
    highlightId: string
  ) => Promise<boolean>
  mergeHighlightMutation: (
    input: MergeHighlightInput
  ) => Promise<Highlight | undefined>
  updateHighlightMutation: (
    input: UpdateHighlightInput
  ) => Promise<string | undefined>
  articleReadingProgressMutation: (
    input: ArticleReadingProgressMutationInput
  ) => Promise<boolean>
}
