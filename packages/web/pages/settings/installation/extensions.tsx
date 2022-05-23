import React from 'react'
import ExtensionInstallHelp from '../../../components/elements/ExtensionsInstallHelp'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { VStack } from '../../../components/elements/LayoutPrimitives'
import { SettingsMenuView } from '../../../components/patterns/SettingsMenuView'

export default function Extensions(): JSX.Element {
  return (
    <SettingsLayout title="Apps and Extensions">
      <SettingsMenuView selected='Apps and Extensions'>
        <VStack distribution="start" alignment="start" css={{ width: '100%', background: '$grayBg' }}>
          <ExtensionInstallHelp />
        </VStack>
      </SettingsMenuView>
    </SettingsLayout>
  )
}
