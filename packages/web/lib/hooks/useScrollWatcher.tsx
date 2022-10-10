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

export function useScrollWatcher(effect: Effect, delay: number): void {
  const throttleTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const [currentOffset, setCurrentOffset] = useState<ScrollOffset>({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const callback = () => {
      const newOffset = {
        x: window.document.documentElement.scrollLeft ?? window?.scrollX ?? 0,
        y: window.document.documentElement.scrollTop ?? window?.scrollY ?? 0,
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

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentOffset, delay, effect])
}
