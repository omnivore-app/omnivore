export function extendRangeToWordBoundaries(range: Range): void {
  const { nodeValue: startValue } = range.startContainer
  const { nodeValue: endValue } = range.endContainer

  const startOffset = findNextWord(range.startOffset, false, startValue)
  const endOffset = findNextWord(range.endOffset, true, endValue)

  try {
    range.setStart(range.startContainer, startOffset)
    range.setEnd(range.endContainer, endOffset)
  } catch {
    console.warn('Unable to snap selection to the next word')
  }
}

const isWhitespace = (c?: string): boolean => !!c && /\s/.test(c)

function findNextWord(
  start: number,
  forward: boolean,
  str?: string | null
): number {
  if (!str) {
    return start
  }
  const chars = str.split('')

  let i = start
  if (forward) {
    if (isWhitespace(chars[i - 1])) {
      return i - 1
    }
    while (i < str.length) {
      if (isWhitespace(chars[i])) {
        return i
      }
      i++
    }
  } else {
    if (isWhitespace(chars[i])) {
      return i + 1
    }
    while (i > 0) {
      if (isWhitespace(chars[i - 1])) {
        return i
      }
      i--
    }
  }

  return i
}
