// AnchoredHighlights - Robust highlighting with multi-selector anchoring
// Provides DOM Range → TextPosition → TextQuote fallback anchoring,
// idempotent application, multi-node wrapping, and mutation observers

import { useEffect, useRef } from 'react'

import type {
  AnchorDomRange,
  AnchoredSelectors,
  AnchorTextPosition,
  AnchorTextQuote,
  HighlightColor,
} from '../types/api'

export interface AnchoredHighlight {
  id: string
  color: HighlightColor
  annotation?: string
  selectors: AnchoredSelectors
}

export interface ApplyResult {
  id: string
  marks: HTMLElement[]
}

/**********************
 * Internal utilities *
 **********************/

// Compact path serialization: indexes through childNodes from root
function pathTo(node: Node, root: Node): string {
  const parts: string[] = []
  let n: Node | null = node
  while (n && n !== root) {
    const parent: Node | null = n.parentNode
    if (!parent) break
    const i = Array.prototype.indexOf.call(parent.childNodes, n)
    parts.push(String(i))
    n = parent
  }

  return parts.reverse().join('/')
}

function nodeFromPath(path: string, root: Node): Node | null {
  if (!path) return null

  return path.split('/').reduce<Node | null>((curr, idx) => {
    if (!curr) return null
    const i = Number(idx)

    return curr.childNodes[i] ?? null
  }, root)
}

// Text index maps linear offsets ↔ Text nodes for the container subtree
type TextSlice = { node: Text; start: number; end: number }

function buildIndex(root: HTMLElement) {
  const slices: TextSlice[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node: Node | null
  let offset = 0
  while ((node = walker.nextNode())) {
    const t = node as Text
    const len = t.data.length
    slices.push({ node: t, start: offset, end: offset + len })
    offset += len
  }

  return { slices, length: offset }
}

function positionFromRange(range: Range, root: HTMLElement) {
  const { slices } = buildIndex(root)
  const toAbs = (n: Node, off: number) => {
    if (n.nodeType !== Node.TEXT_NODE) {
      // If selection boundary is an element, move inward to nearest text
      const walker = document.createTreeWalker(n, NodeFilter.SHOW_TEXT)
      const t = walker.nextNode() as Text | null
      if (!t) throw new Error('No text node at boundary')
      n = t
      off = 0
    }
    const slice = slices.find((s) => s.node === n)
    if (!slice) throw new Error('Node not indexed')

    return slice.start + off
  }

  return {
    start: toAbs(range.startContainer, range.startOffset),
    end: toAbs(range.endContainer, range.endOffset),
  }
}

function rangeFromPosition(pos: AnchorTextPosition, root: HTMLElement) {
  const { slices } = buildIndex(root)
  let startNode: Text | null = null
  let startOff = 0
  let endNode: Text | null = null
  let endOff = 0
  for (const s of slices) {
    if (!startNode && pos.start >= s.start && pos.start <= s.end) {
      startNode = s.node
      startOff = pos.start - s.start
    }
    if (!endNode && pos.end >= s.start && pos.end <= s.end) {
      endNode = s.node
      endOff = pos.end - s.start
    }
    if (startNode && endNode) break
  }
  if (!startNode || !endNode) return null
  const r = document.createRange()
  r.setStart(startNode, startOff)
  r.setEnd(endNode, endOff)

  return r
}

// Tolerant text search using exact + (optional) prefix/suffix with whitespace normalization
function findByQuote(root: HTMLElement, q: AnchorTextQuote): Range | null {
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
  const full = norm(root.textContent || '')
  const exact = norm(q.exact)
  if (!exact) return null

  // If prefix/suffix provided, search in that context window to reduce false matches
  let startIndex = 0
  let endIndex = full.length
  if (q.prefix) {
    const p = norm(q.prefix)
    const i = full.indexOf(p)
    if (i >= 0) startIndex = i + p.length
  }
  if (q.suffix) {
    const s = norm(q.suffix)
    const i = full.indexOf(s)
    if (i >= 0) endIndex = i
  }

  const segment = full.slice(startIndex, endIndex)
  const rel = segment.indexOf(exact)
  if (rel < 0) return null

  const absStart = startIndex + rel
  const absEnd = absStart + exact.length

  return rangeFromPosition(
    {
      start: mapNormalizedToRawOffset(root, absStart),
      end: mapNormalizedToRawOffset(root, absEnd),
    },
    root,
  )
}

// Map normalized (collapsed-space) offset back to raw offset
function mapNormalizedToRawOffset(root: HTMLElement, target: number): number {
  // Walk text nodes accumulating a normalized counter and return raw offset index
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node: Node | null
  let normCount = 0
  while ((node = walker.nextNode())) {
    const t = node as Text
    const raw = t.data
    let i = 0
    while (i < raw.length) {
      const ch = raw[i]
      const isSpace = /\s/.test(ch)
      if (!isSpace) {
        if (normCount === target) {
          return buildIndex(root).slices.find((s) => s.node === t)!.start + i
        }
        normCount++
      } else {
        // collapse sequences of whitespace to a single space
        // count one normalized space when encountering the first of a run
        if (i === 0 || !/\s/.test(raw[i - 1])) {
          if (normCount === target) {
            return buildIndex(root).slices.find((s) => s.node === t)!.start + i
          }
          normCount++
        }
      }
      i++
    }
  }
  // If target beyond, clamp to end
  return buildIndex(root).length
}

function serializeRange(range: Range, root: HTMLElement): AnchorDomRange {
  const startNode =
    range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer
      : range.startContainer.childNodes[range.startOffset]
  const endNode =
    range.endContainer.nodeType === Node.TEXT_NODE
      ? range.endContainer
      : range.endContainer.childNodes[range.endOffset]

  const sNode =
    startNode?.nodeType === Node.TEXT_NODE ? startNode : range.startContainer
  const eNode =
    endNode?.nodeType === Node.TEXT_NODE ? endNode : range.endContainer

  return {
    startPath: pathTo(sNode!, root),
    startOffset: range.startOffset,
    endPath: pathTo(eNode!, root),
    endOffset: range.endOffset,
  }
}

function rangeFromDomSelector(
  sel: AnchorDomRange,
  root: HTMLElement,
): Range | null {
  const sNode = nodeFromPath(sel.startPath, root)
  const eNode = nodeFromPath(sel.endPath, root)
  if (!sNode || !eNode) return null
  if (sNode.nodeType !== Node.TEXT_NODE || eNode.nodeType !== Node.TEXT_NODE) {
    return null
  }
  const r = document.createRange()
  try {
    r.setStart(sNode as Text, sel.startOffset)
    r.setEnd(eNode as Text, sel.endOffset)
  } catch {
    return null
  }

  return r
}

// Wrap a Range across multiple text nodes, return all created marks
function wrapRange(root: HTMLElement, range: Range, cls: string, id: string) {
  const marks: HTMLElement[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const texts: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) texts.push(node as Text)

  const startT = range.startContainer as Text
  const endT = range.endContainer as Text

  let active = false
  for (const t of texts) {
    if (!active && t === startT) active = true
    if (!active) continue

    const sOff = t === startT ? range.startOffset : 0
    const eOff = t === endT ? range.endOffset : t.data.length
    if (eOff > sOff) {
      // Split the text node to isolate the highlighted portion
      // If sOff > 0: split to separate text before highlight
      // If eOff < length: split to separate text after highlight
      let targetNode = t

      // Split off text before the highlight (if any)
      if (sOff > 0) {
        targetNode = t.splitText(sOff) as Text
      }

      // Split off text after the highlight (if any)
      if (eOff < t.data.length) {
        targetNode.splitText(eOff - sOff) as Text
      }

      // Wrap the target node in a mark element
      const mark = document.createElement('mark')
      mark.className = cls
      mark.dataset.hl = '1'
      mark.dataset.id = id
      mark.setAttribute('aria-label', 'Highlight')
      mark.textContent = targetNode.data
      targetNode.parentNode!.replaceChild(mark, targetNode)
      marks.push(mark)
    }
    if (t === endT) break
  }

  return marks
}

function clearExistingMarks(root: HTMLElement) {
  root.querySelectorAll('mark[data-hl="1"]').forEach((m) => {
    const parent = m.parentNode
    const text = document.createTextNode(m.textContent || '')
    m.replaceWith(text)
    // Normalize AFTER replace, using saved parent reference
    parent?.normalize()
  })
}

/**********************
 * Hook: useAnchors   *
 **********************/

export function useAnchoredHighlights(
  contentRef: React.RefObject<HTMLElement>,
  highlights: AnchoredHighlight[],
) {
  const reapply = useRef<() => void>(() => {})

  useEffect(() => {
    const root = contentRef.current
    if (!root) return

    const apply = () => {
      clearExistingMarks(root)

      const applied: ApplyResult[] = []

      for (const h of highlights) {
        let r: Range | null = null
        // 1) DOM Range
        if (h.selectors.domRange) {
          r = rangeFromDomSelector(h.selectors.domRange, root)
        }
        // 2) TextPosition
        if (!r && h.selectors.textPosition) {
          r = rangeFromPosition(h.selectors.textPosition, root)
        }
        // 3) TextQuote
        if (!r && h.selectors.textQuote) {
          r = findByQuote(root, h.selectors.textQuote)
        }

        if (r) {
          const cls = `highlight highlight-${h.color.toLowerCase()}`
          const marks = wrapRange(root, r, cls, h.id)
          if (marks.length) {
            applied.push({ id: h.id, marks })
          }
        } else {
          console.warn(
            `[AnchoredHighlights] Could not find range for highlight ${h.id}`,
          )
        }
      }

      return applied
    }

    reapply.current = apply

    // Defer initial application to avoid blocking the main thread
    const applyTimer = setTimeout(() => apply(), 100)

    // TEMPORARILY DISABLED - MutationObserver causing performance issues
    // Only reapply on explicit highlight changes, not on every DOM mutation
    // TODO: Re-enable with throttling once performance is stable

    // const mo = new MutationObserver(() => {
    //   queueMicrotask(() => reapply.current())
    // })
    // mo.observe(root, { subtree: true, characterData: true, childList: true })

    // const ro =
    //   typeof ResizeObserver !== 'undefined'
    //     ? new ResizeObserver(() => reapply.current())
    //     : null

    // if (ro) ro.observe(root)

    return () => {
      clearTimeout(applyTimer)
      // mo.disconnect()
      // ro?.disconnect()
    }
  }, [contentRef, highlights])

  return {
    reapply: () => reapply.current?.(),
    jumpTo: (id: string) => {
      const el = contentRef.current?.querySelector(`mark[data-id="${id}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('highlight-flash')
        setTimeout(() => el.classList.remove('highlight-flash'), 900)
      }
    },
  }
}

/********************************
 * Selector capture on creation *
 ********************************/

export function buildSelectorsFromSelection(
  selection: Selection,
  contentEl: HTMLElement,
  textQuoteContextWords = 5,
): AnchoredSelectors {
  if (!selection.rangeCount) throw new Error('No selection range')
  const range = selection.getRangeAt(0)

  // DOM Range
  const domRange = serializeRange(range, contentEl)

  // TextPosition
  const pos = positionFromRange(range, contentEl)

  // TextQuote (with ±N words context from linearized content)
  const full = contentEl.textContent || ''
  const exact = selection.toString()
  const { start, end } = pos

  const left = full.slice(0, start).trim()
  const right = full.slice(end).trim()
  const wordsL = left.split(/\s+/).slice(-textQuoteContextWords).join(' ')
  const wordsR = right.split(/\s+/).slice(0, textQuoteContextWords).join(' ')

  return {
    domRange,
    textPosition: { start, end },
    textQuote: {
      exact,
      prefix: wordsL || undefined,
      suffix: wordsR || undefined,
    },
  }
}
