import React from 'react'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import MobileInstallHelp from '../../../components/elements/MobileInstallHelp'

export default function Mobile(): JSX.Element {
  return (
    <SettingsLayout title="Mobile Installation">
      <MobileInstallHelp />
    </SettingsLayout>
  )
}
