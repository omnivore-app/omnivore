import { diff_match_patch, patch_obj } from 'diff-match-patch'
import type { Highlight } from '../networking/fragments/highlightFragment'

export function sortHighlights(highlights: Highlight[]) {
  const sorted = (a: number, b: number) => {
    if (a < b) {
      return -1
    }
    if (a > b) {
      return 1
    }
    return 0
  }

  const getHighlightLocation = (patch: string): number | undefined => {
    const dmp = new diff_match_patch()
    const patches = dmp.patch_fromText(patch) as unknown as patch_obj[]
    return patches[0].start1 || undefined
  }

  return highlights
    .filter((h) => h.type === 'HIGHLIGHT')
    .sort((a: Highlight, b: Highlight) => {
      if (
        a.highlightPositionPercent &&
        b.highlightPositionPercent &&
        a.highlightPositionPercent !== b.highlightPositionPercent
      ) {
        return sorted(a.highlightPositionPercent, b.highlightPositionPercent)
      }
      // We do this in a try/catch because it might be an invalid diff
      // With PDF it will definitely be an invalid diff.
      try {
        const aPos = getHighlightLocation(a.patch)
        const bPos = getHighlightLocation(b.patch)
        if (aPos && bPos) {
          return sorted(aPos, bPos)
        }
      } catch {}
      return a.createdAt.localeCompare(b.createdAt)
    })
}
