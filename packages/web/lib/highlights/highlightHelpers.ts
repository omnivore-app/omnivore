export type SelectionAttributes = {
  selection: Selection
  mouseEvent: React.MouseEvent
  range: Range
  focusPosition: {
    x: number
    y: number
    isReverseSelected: boolean
  }
  overlapHighlights: string[]
}

export const highlightIdAttribute = 'omnivore-highlight-id'
export const highlightNoteIdAttribute = 'omnivore-highlight-note-id'

export function getHighlightElements(highlightId: string): Element[] {
  return Array.from(
    document.querySelectorAll(`[${highlightIdAttribute}='${highlightId}']`)
  )
}

export function getHighlightNoteButton(highlightId: string): Element[] {
  return Array.from(
    document.querySelectorAll(`[${highlightNoteIdAttribute}='${highlightId}']`)
  )
}
