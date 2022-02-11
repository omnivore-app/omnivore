import { useCallback, useEffect, useRef, useState } from 'react'

type SetRef = (node: HTMLDivElement | null) => void

export const useFetchMoreScroll = (
  callback: () => void,
): SetRef => {
  const [scrollableElement, setScrollableElement] =useState<HTMLDivElement | null>(null)

  useFetchMoreInternal(scrollableElement, callback)

  const ref = useRef<HTMLDivElement | null>(null)
  const setRef = useCallback((node) => {
    setScrollableElement(node)
    ref.current = node
  }, [])

  return setRef
}

const useFetchMoreInternal = (node: HTMLDivElement | null, callback: () => void, delay = 500): void => {
  let first = false
  const throttleTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined' || !node) {
      return
    }

    const callbackInternal = (): void => {
      const {
        scrollTop,
        scrollHeight,
        clientHeight
      } = node;

      if (scrollTop + clientHeight >= scrollHeight - (scrollHeight / 3)) {
        callback()
      }
      throttleTimeout.current = undefined
    }

    const handleScroll = () => {
      if (first) {
        first = false
        callbackInternal()
        return
      }
      if (typeof throttleTimeout.current === 'undefined') {
        throttleTimeout.current = setTimeout(callbackInternal, delay)
      }
    }

    node.addEventListener('scroll', handleScroll)

    return () => {
      node.removeEventListener('scroll', handleScroll)
    }
  }, [node, callback, delay])
}
