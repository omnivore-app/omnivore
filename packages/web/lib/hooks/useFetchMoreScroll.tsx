import { useEffect, useRef, useState } from 'react'

export const useFetchMore = (callback: () => void, delay = 500): void => {
  const [first, setFirst] = useState(true)
  const throttleTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const callbackInternal = (): void => {
      const { scrollTop, scrollHeight, clientHeight } =
        window.document.documentElement

      if (scrollTop + clientHeight >= scrollHeight - scrollHeight / 3) {
        callback()
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
        throttleTimeout.current = setTimeout(callbackInternal, delay)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [callback, delay, first, setFirst])
}
