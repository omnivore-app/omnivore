import { useEffect } from 'react'
import { applyStoredTheme } from '../themeUpdater'
import { useDarkModeListener } from './useDarkModeListener'

export function useApplyLocalTheme() {
  const isDark = useDarkModeListener()

  useEffect(() => {
    applyStoredTheme()
  }, [isDark])
}
