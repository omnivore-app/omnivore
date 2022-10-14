import { useEffect, useCallback } from 'react'
import { SettingsLayout } from '../components/templates/SettingsLayout'
import { setupAnalytics } from '../lib/analytics'

export default function Support(): JSX.Element {
  const initAnalytics = useCallback(() => {
    setupAnalytics()
    window.Intercom('show')
  }, [])

  useEffect(() => {
    window.addEventListener('load', initAnalytics)
    return () => {
      window.removeEventListener('load', initAnalytics)
    }
  }, [initAnalytics])

  return (
    <SettingsLayout title="Support">
      <></>
    </SettingsLayout>
  )
}
