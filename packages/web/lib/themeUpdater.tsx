import {
  ThemeId,
  darkTheme,
  sepiaTheme,
  apolloTheme,
  blackTheme,
  theme,
} from '../components/tokens/stitches.config'

const themeKey = 'theme'
const preferredDarkThemeKey = 'preferredDarkThemeKey'
const preferredLightThemeKey = 'preferredLightThemeKey'

// Map legacy theme names to their new equivelents
const LEGACY_THEMES: { [string: string]: string } = {
  White: ThemeId.Light,
  LightGray: ThemeId.Light,
  Gray: ThemeId.Dark,
  Darker: ThemeId.Dark,
}

export function updateTheme(themeId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  updateThemeLocally(themeId)
}

const visibleThemeId = (themeId: string) => {
  if (themeId == ThemeId.System) {
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        try {
          const preferred = window.localStorage.getItem(preferredDarkThemeKey)
          if (preferred) {
            return JSON.parse(preferred)
          }
        } catch {}
        return ThemeId.Dark
      } else {
        try {
          const preferred = window.localStorage.getItem(preferredLightThemeKey)
          if (preferred) {
            return JSON.parse(preferred)
          }
        } catch {}
        return ThemeId.Light
      }
    }
    return ThemeId.Light
  } else {
    return themeId
  }
}

export function getTheme(themeId: string) {
  const themeToUse = visibleThemeId(themeId)
  switch (themeToUse) {
    case ThemeId.Dark:
      return darkTheme
    case ThemeId.Sepia:
      return sepiaTheme
    case ThemeId.Apollo:
      return apolloTheme
    case ThemeId.Black:
      return blackTheme
  }
  return theme
}

export function updateThemeLocally(themeId: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(themeKey, themeId)
  }

  document.documentElement.classList.remove(
    ...Object.keys(LEGACY_THEMES),
    sepiaTheme,
    darkTheme,
    apolloTheme,
    blackTheme,
    ...Object.keys(ThemeId)
  )
  document.documentElement.classList.add(getTheme(themeId))
}

export function currentThemeName(): string {
  switch (getCurrentLocalTheme()) {
    case ThemeId.Light:
      return 'Light'
    case ThemeId.Dark:
      return 'Dark'
    case ThemeId.Sepia:
      return 'Sepia'
    case ThemeId.Apollo:
      return 'Apollo'
    case ThemeId.Black:
      return 'Black'
  }
  return 'Light'
}

export function getCurrentLocalTheme(): ThemeId | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const str = window.localStorage.getItem(themeKey)
  if (str && Object.values(ThemeId).includes(str as ThemeId)) {
    return str as ThemeId
  }

  if (str && Object.keys(LEGACY_THEMES).includes(str)) {
    return LEGACY_THEMES[str] as ThemeId
  }

  return ThemeId.Light
}

export function applyStoredTheme(): ThemeId | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const theme = (window.themeKey || window.localStorage.getItem(themeKey)) as
    | ThemeId
    | undefined
  if (theme && Object.values(ThemeId).includes(theme)) {
    updateThemeLocally(theme)
  }
  return theme
}

export function isDarkTheme(): boolean {
  const currentTheme = currentThemeName()
  return (
    currentTheme === 'Dark' ||
    currentTheme === 'Darker' ||
    currentTheme === 'Apollo' ||
    currentTheme == 'Black'
  )
}

export const highlightColors = ['yellow', 'red', 'green', 'blue']

export const highlightColor = (name: string | undefined) => {
  switch (name) {
    case 'green':
      return '#55C689'
    case 'blue':
      return '#6AB1FF'
    case 'yellow':
      return '#FFD234'
    case 'orange':
      return '#FEB56D'
    case 'red':
      return '#FB9A9A'
  }
  return '#FFD234'
}

export const highlightColorVar = (name: string | undefined) => {
  switch (name) {
    case 'green':
      return 'var(--colors-highlight_background_green)'
    case 'blue':
      return 'var(--colors-highlight_background_blue)'
    case 'yellow':
      return 'var(--colors-highlight_background_yellow)'
    case 'orange':
      return 'var(--colors-highlight_background_orange)'
    case 'red':
      return 'var(--colors-highlight_background_red)'
  }
  return 'var(--colors-highlightBackground)'
}
