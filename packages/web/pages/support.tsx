import { useEffect } from 'react'
import { SettingsLayout } from '../components/templates/SettingsLayout'

export default function Support(): JSX.Element {
  useEffect(() => {
    window.Intercom('show')
  }, [])

  return (
    <SettingsLayout title="Support">
      <></>
    </SettingsLayout>
  )
}
