import React from 'react'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import MobileInstallHelp from '../../../components/elements/MobileInstallHelp'
import ExtensionInstallHelp from '../../../components/elements/ExtensionsInstallHelp'
import { Box } from '../../../components/elements/LayoutPrimitives'

export default function Installation(): JSX.Element {
  return (
    <SettingsLayout title="Installation">
      <MobileInstallHelp />
      <Box css={{ m: '32px' }} />
      <ExtensionInstallHelp />
    </SettingsLayout>
  )
}
