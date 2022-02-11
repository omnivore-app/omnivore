import React, { useEffect } from 'react'
import Router from 'next/router'
import ExtensionInstallHelp from '../../../components/elements/ExtensionsInstallHelp'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { VStack } from '../../../components/elements/LayoutPrimitives'

export default function Extensions(): JSX.Element {
  return (
    <SettingsLayout>
      <VStack distribution="center" alignment="center" css={{ width: '100%' }}>
        <ExtensionInstallHelp />
      </VStack>
    </SettingsLayout>
  )
}
