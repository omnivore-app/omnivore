import { useEffect, useRef, useState } from 'react'

function getWindowDimensions() {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
    }
  }
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height,
  }
}
export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  )
  const prevDimensionsRef = useRef(windowDimensions)

  useEffect(() => {
    function handleResize() {
      const currentDimensions = getWindowDimensions()
      setWindowDimensions((prev) => {
        prevDimensionsRef.current = prev
        return currentDimensions
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    ...windowDimensions,
    previous: prevDimensionsRef.current,
  }
}
