import React from 'react'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { SettingsMenuView } from '../../components/patterns/SettingsMenuView'

export default function SettingsPage(): JSX.Element {

  return (
    <SettingsLayout title="Settings">
      <SettingsMenuView selected='Settings' />
    </SettingsLayout>
  )
}
