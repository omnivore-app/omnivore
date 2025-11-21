/**
 * Injection tokens for dependency injection
 * Using Symbols instead of strings provides:
 * - Type safety (prevents typos)
 * - Better IDE autocomplete
 * - Prevents accidental token collisions
 * - Enables tree-shaking of unused tokens
 */
export const REPOSITORY_TOKENS = {
  ILibraryItemRepository: Symbol('ILibraryItemRepository'),
  IHighlightRepository: Symbol('IHighlightRepository'),
  ILabelRepository: Symbol('ILabelRepository'),
  IEntityLabelRepository: Symbol('IEntityLabelRepository'),
  IReadingProgressRepository: Symbol('IReadingProgressRepository'),
} as const

