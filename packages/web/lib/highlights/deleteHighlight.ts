import { HighlightLocation } from './highlightGenerator'
import {
  getHighlightElements,
  getHighlightLabelButton,
  getHighlightNoteButton,
} from './highlightHelpers'

export function removeHighlights(
  ids: string[],
  locations: HighlightLocation[]
): void {
  ids.forEach((id) => {
    const elements = getHighlightElements(id)
    const noteButtons = getHighlightNoteButton(id)
    const labelButtons = getHighlightLabelButton(id)

    noteButtons.forEach((button) => {
      button.remove()
    })

    labelButtons.forEach((button) => {
      button.remove()
    })

    elements.forEach((t: Element) => {
      if (t.nodeName === 'IMG') {
        t.classList.remove('highlight-image')
      } else if (t.childNodes) {
        //  Before removing the highlight element node, move any of its child
        //  nodes in the parent. We insert these child nodes at the same
        //  position as the highlight element node in the parent's children.
        while (t.hasChildNodes()) {
          const child = t.firstChild
          if (child) {
            t.removeChild(child)
            if (!t.parentNode) {
              throw new Error('highlight span has no parent node')
            }
            t.parentNode.insertBefore(child, t.nextSibling)
          }
        }
        t.remove()
      } else {
        const newNode = document.createTextNode(t.textContent || '')
        t.parentElement?.replaceChild(newNode, t)
      }
    })
  })
}
