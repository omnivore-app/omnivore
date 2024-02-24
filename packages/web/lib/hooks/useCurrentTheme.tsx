import { useCallback, useMemo } from 'react'
import { usePersistedState } from './usePersistedState'
import { getCurrentLocalTheme, updateThemeLocally } from '../themeUpdater'
import { useDarkModeListener } from './useDarkModeListener'

const themeKey = 'currentTheme'
const preferredDarkThemeKey = 'preferredDarkThemeKey'
const preferredLightThemeKey = 'preferredLightThemeKey'

export const isDarkTheme = (themeId: string): boolean => {
  if (
    themeId === 'Dark' ||
    themeId === 'Darker' ||
    themeId === 'Apollo' ||
    themeId == 'Black'
  ) {
    return true
  }
  return false
}

export const isLightTheme = (themeId: string): boolean => {
  if (themeId === 'Sepia' || themeId == 'Light') {
    return true
  }
  return false
}

export function useCurrentTheme() {
  const isDarkMode = useDarkModeListener()
  const [currentThemeInternal, setCurrentThemeInternal] = usePersistedState<
    string | undefined
  >({
    key: themeKey,
    initialValue: getCurrentLocalTheme(),
  })

  const [preferredLightTheme, setPreferredLightTheme] =
    usePersistedState<string>({
      key: preferredLightThemeKey,
      initialValue: 'Light',
    })

  const [preferredDarkTheme, setPreferredDarkTheme] = usePersistedState<string>(
    {
      key: preferredDarkThemeKey,
      initialValue: 'Dark',
    }
  )

  const currentTheme = useMemo(() => {
    return currentThemeInternal
  }, [currentThemeInternal])

  const setCurrentTheme = useCallback(
    (themeId: string) => {
      if (isDarkTheme(themeId)) {
        setPreferredDarkTheme(themeId)
      }
      if (isLightTheme(themeId)) {
        setPreferredLightTheme(themeId)
      }
      if (themeId == 'System') {
        const current = currentThemeInternal
        if (current && isDarkTheme(current)) {
          setPreferredDarkTheme(current)
        }
        if (current && isLightTheme(current)) {
          setPreferredLightTheme(current)
        }
      }
      setCurrentThemeInternal(themeId)
      updateThemeLocally(themeId)
    },
    [
      currentThemeInternal,
      setCurrentThemeInternal,
      setPreferredDarkTheme,
      setPreferredLightTheme,
    ]
  )

  // This is used when the user disables "System" theme
  const resetSystemTheme = useCallback(() => {
    if (isDarkMode) {
      setCurrentThemeInternal(preferredDarkTheme ?? 'Dark')
    } else {
      setCurrentThemeInternal(preferredLightTheme ?? 'Light')
    }
  }, [
    isDarkMode,
    preferredDarkTheme,
    preferredLightTheme,
    setCurrentThemeInternal,
  ])

  const currentThemeIsDark = useMemo(() => {
    if (currentTheme) {
      return isDarkTheme(currentTheme)
    }
    return false
  }, [currentTheme])

  return {
    currentTheme,
    setCurrentTheme,
    resetSystemTheme,
    currentThemeIsDark,
  }
}
