import { useEffect, useState } from 'react'

export function useDarkModeListener(): boolean {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (!window?.matchMedia) return

    const matchMediaQuery = '(prefers-color-scheme: dark)'
    const isDark =
      window.matchMedia && window.matchMedia(matchMediaQuery).matches

    setIsDarkMode(isDark)

    window.matchMedia(matchMediaQuery).addEventListener('change', (event) => {
      setIsDarkMode(event.matches)
    })

    return () => {
      window
        .matchMedia(matchMediaQuery)
        .removeEventListener('change', (event) => {
          setIsDarkMode(event.matches)
        })
    }
  }, [])

  return isDarkMode
}
