import {
  ThemeId,
  lighterTheme,
  darkTheme,
  darkerTheme,
  sepiaTheme,
  charcoalTheme,
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
    ThemeId.Light,
    darkTheme,
    darkerTheme,
    sepiaTheme,
    charcoalTheme
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
  return currentTheme === 'Dark' || currentTheme === 'Darker'
}

export function darkenTheme(): void {
  switch (currentTheme()) {
    case ThemeId.Dark:
      updateTheme(ThemeId.Darker)
      break
    case ThemeId.Light:
      updateTheme(ThemeId.Dark)
      break
    case ThemeId.Lighter:
      updateTheme(ThemeId.Light)
      break
    default:
      break
  }
}

export function lightenTheme(): void {
  switch (currentTheme()) {
    case ThemeId.Dark:
      updateTheme(ThemeId.Light)
      break
    case ThemeId.Darker:
      updateTheme(ThemeId.Dark)
      break
    case ThemeId.Light:
      updateTheme(ThemeId.Lighter)
      break
    default:
      break
  }
}
