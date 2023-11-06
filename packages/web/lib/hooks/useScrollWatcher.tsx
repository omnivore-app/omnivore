import { useRef, useEffect, useState, MutableRefObject } from 'react'

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
  containerRef: MutableRefObject<HTMLDivElement | null> | undefined,
  effect: Effect,
  delay: number
): void {
  const throttleTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const [currentOffset, setCurrentOffset] = useState<ScrollOffset>({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const target = containerRef?.current ?? window
    const callback = () => {
      const newOffset = {
        x:
          containerRef?.current?.scrollLeft ??
          window.document.documentElement.scrollLeft ??
          window?.scrollX ??
          0,
        y:
          containerRef?.current?.scrollTop ??
          window.document.documentElement.scrollTop ??
          window?.scrollY ??
          0,
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

    target.addEventListener('scroll', handleScroll)
    return () => {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current)
        throttleTimeout.current = undefined
      }
      target.removeEventListener('scroll', handleScroll)
    }
  }, [currentOffset, delay, effect])
}
