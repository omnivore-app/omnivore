import {
  ThemeId,
  darkTheme,
  sepiaTheme,
  apolloTheme,
  blackTheme,
  theme,
} from '../components/tokens/stitches.config'

const themeKey = 'theme'

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

export function getTheme(themeId: string) {
  switch (themeId) {
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
  switch (currentTheme()) {
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

export function currentTheme(): ThemeId | undefined {
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

export function applyStoredTheme(syncWithServer = true): ThemeId | undefined {
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
