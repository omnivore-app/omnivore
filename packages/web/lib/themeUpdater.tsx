import {
  ThemeId,
  lighterTheme,
  darkTheme,
  sepiaTheme,
} from '../components/tokens/stitches.config'
import { userPersonalizationMutation } from './networking/mutations/userPersonalizationMutation'

const themeKey = 'theme'

export function updateTheme(themeId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  updateThemeLocally(themeId)
  userPersonalizationMutation({ theme: themeId })
}

export function updateThemeLocally(themeId: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(themeKey, themeId)
  }

  document.body.classList.remove(
    lighterTheme,
    darkTheme,
    sepiaTheme
  )
  document.body.classList.add(themeId)
}

export function currentThemeName(): string {
  switch (currentTheme()) {
    case ThemeId.Light:
      return 'Light'
    case ThemeId.Dark:
      return 'Dark'
    case ThemeId.Darker:
      return 'Darker'
    case ThemeId.Lighter:
      return 'Lighter'
    case ThemeId.Sepia:
      return 'Sepia'
    case ThemeId.Charcoal:
      return 'Charcoal'
    default:
      return ''
  }
}

function currentTheme(): ThemeId | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.localStorage.getItem(themeKey) as ThemeId | undefined
}

export function applyStoredTheme(syncWithServer = true): ThemeId | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const theme = window.localStorage.getItem(themeKey) as ThemeId | undefined
  if (theme && Object.values(ThemeId).includes(theme)) {
    syncWithServer ? updateTheme(theme) : updateThemeLocally(theme)
  }
  return theme
}

export function isDarkTheme(): boolean {
  const currentTheme = currentThemeName()
  return currentTheme === 'Dark' || currentTheme === 'Darker' || currentTheme === 'Sepia'
}
