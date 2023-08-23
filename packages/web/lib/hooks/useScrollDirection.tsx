import { MutableRefObject, useEffect, useState } from 'react'

type ScrollDirection = 'down' | 'up'

export const useScrollDirection = (
  containerRef: MutableRefObject<HTMLDivElement | null> | undefined
) => {
  const [scrollDirection, setScrollDirection] = useState<
    ScrollDirection | undefined
  >(undefined)

  useEffect(() => {
    const target = containerRef?.current ?? window
    let lastScrollY =
      containerRef?.current?.scrollTop ??
      window.document.documentElement.scrollTop ??
      window?.scrollY ??
      0

    const updateScrollDirection = () => {
      const scrollY =
        containerRef?.current?.scrollTop ??
        window.document.documentElement.scrollTop ??
        window?.scrollY ??
        0
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction)
      }
      lastScrollY = scrollY > 0 ? scrollY : 0
    }
    target.addEventListener('scroll', updateScrollDirection)
    return () => {
      target.removeEventListener('scroll', updateScrollDirection)
    }
  }, [scrollDirection])

  return scrollDirection
}
