import { Highlight } from "./networking/fragments/highlightFragment"
import { ArticleReadingProgressMutationInput } from "./networking/mutations/articleReadingProgressMutation"
import { CreateHighlightInput } from "./networking/mutations/createHighlightMutation"
import { MergeHighlightInput, MergeHighlightOutput } from "./networking/mutations/mergeHighlightMutation"
import { UpdateHighlightInput } from "./networking/mutations/updateHighlightMutation"


export type ArticleMutations = {
  createHighlightMutation: (input: CreateHighlightInput) => Promise<Highlight | undefined>
  deleteHighlightMutation: (highlightId: string) => Promise<boolean>
  mergeHighlightMutation: (input: MergeHighlightInput) => Promise<MergeHighlightOutput | undefined>
  updateHighlightMutation: (input: UpdateHighlightInput) => Promise<string | undefined>
  articleReadingProgressMutation: (input: ArticleReadingProgressMutationInput) => Promise<boolean>
}
