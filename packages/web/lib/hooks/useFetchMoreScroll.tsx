import { useEffect, useRef, useState } from 'react'

export const useFetchMore = (fetchNextPage: () => void, delay = 500): void => {
  const [first, setFirst] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const throttleTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    const callbackInternal = (isInitial = false): void => {
      const { scrollTop, scrollHeight, clientHeight } =
        window.document.documentElement
      const direction = scrollTop > lastScrollTop ? 'down' : 'up'
      setLastScrollTop(scrollTop)

      if (
        (direction == 'down' || isInitial) &&
        scrollTop + clientHeight >= scrollHeight - scrollHeight / 3
      ) {
        fetchNextPage()
      }

      throttleTimeout.current = undefined
    }

    const handleScroll = () => {
      if (first) {
        setFirst(false)
        callbackInternal()
        return
      }
      if (typeof throttleTimeout.current === 'undefined') {
        throttleTimeout.current = setTimeout(() => callbackInternal(true), delay)
      }
    }


    window.addEventListener('scroll', handleScroll)
    window.addEventListener('wheel', handleScroll)


    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleScroll)

    }
  }, [fetchNextPage, delay, first, setFirst])
}
