export function extendRangeToWordBoundaries(range: Range): void {
  const { nodeValue: startValue } = range.startContainer
  const { nodeValue: endValue } = range.endContainer
  const noWordSnap = disableWordSnap(range.toString())

  const startOffset = noWordSnap ? range.startOffset : findNextWord(range.startOffset, false, startValue)
  const endOffset = noWordSnap ? range.endOffset : findNextWord(range.endOffset, true, endValue)

  try {
    range.setStart(range.startContainer, startOffset)
    range.setEnd(range.endContainer, endOffset)
  } catch {
    console.warn('Unable to snap selection to the next word')
  }
}

function disableWordSnap(str: string): boolean {
  // For CJK languages we don't attempt word snapping
  // @ts-ignore
  if (str.match(/[\u3131-\uD79D]/ugi)) {
    return true
  }
  return false
}

const isWhitespace = (c?: string): boolean => {
  return !!c && /\u2014|\u2013|,|\s/.test(c);
}

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
