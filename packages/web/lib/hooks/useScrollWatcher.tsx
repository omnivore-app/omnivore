import { useRef, useEffect, useState, useCallback } from 'react'

type ScrollOffset = {
  x: number
  y: number
}

export type ScrollOffsetChangeset = {
  current: ScrollOffset
  previous: ScrollOffset
}

type Effect = (offset: ScrollOffsetChangeset) => void

export function useScrollWatcher(
  effect: Effect,
  interval: number
): (node: HTMLDivElement | null) => void {
  const [scrollableElement, setScrollableElement] =
    useState<HTMLDivElement | null>(null)

  useScrollWatcherInternal(effect, scrollableElement, interval)

  const ref = useRef<HTMLDivElement | null>(null)

  const setRef = useCallback((node) => {
    setScrollableElement(node)
    ref.current = node
  }, [])

  return setRef
}

function useScrollWatcherInternal(
  effect: Effect,
  element: HTMLDivElement | null,
  delay: number
): void {
  const throttleTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const [currentOffset, setCurrentOffset] = useState<ScrollOffset>({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const callback = () => {
      const newOffset = {
        x: element?.scrollLeft ?? window?.scrollX ?? 0,
        y: element?.scrollTop ?? window?.scrollY ?? 0,
      }
      effect({ current: newOffset, previous: currentOffset })
      setCurrentOffset(newOffset)
      throttleTimeout.current = undefined
    }

    const handleScroll = () => {
      if (typeof throttleTimeout.current === 'undefined') {
        throttleTimeout.current = setTimeout(callback, delay)
      }
    }

    (element ?? window)?.addEventListener('scroll', handleScroll)

    return () =>
      (element ?? window)?.removeEventListener('scroll', handleScroll)
  }, [currentOffset, delay, effect, element])
}
