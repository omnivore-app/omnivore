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

export function noteImage(): SVGSVGElement {
  const svgURI = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgURI, 'svg')
  svg.setAttribute('viewBox', '0 0 14 14')
  svg.setAttribute('width', '14')
  svg.setAttribute('height', '14')
  svg.setAttribute('fill', 'none')

  const path = document.createElementNS(svgURI, 'path')
  path.setAttribute(
    'd',
    'M1 5.66602C1 3.7804 1 2.83759 1.58579 2.2518C2.17157 1.66602 3.11438 1.66602 5 1.66602H9C10.8856 1.66602 11.8284 1.66602 12.4142 2.2518C13 2.83759 13 3.7804 13 5.66602V7.66601C13 9.55163 13 10.4944 12.4142 11.0802C11.8284 11.666 10.8856 11.666 9 11.666H4.63014C4.49742 11.666 4.43106 11.666 4.36715 11.6701C3.92582 11.6984 3.50632 11.8722 3.17425 12.1642C3.12616 12.2065 3.07924 12.2534 2.98539 12.3473V12.3473C2.75446 12.5782 2.639 12.6937 2.55914 12.7475C1.96522 13.1481 1.15512 12.8125 1.01838 12.1093C1 12.0148 1 11.8515 1 11.5249V5.66602Z'
  )
  path.setAttribute('stroke', 'rgba(255, 210, 52, 0.8)')
  path.setAttribute('stroke-width', '1.8')
  path.setAttribute('stroke-linejoin', 'round')
  svg.appendChild(path)
  return svg
}
