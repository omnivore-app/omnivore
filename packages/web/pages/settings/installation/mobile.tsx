import React, { useEffect } from 'react'
import Router from 'next/router'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import MobileInstallHelp from '../../../components/elements/MobileInstallHelp'
import { VStack } from '../../../components/elements/LayoutPrimitives'

export default function Mobile(): JSX.Element {
  return (
    <SettingsLayout>
      {/* <VStack distribution="center" alignment="center" css={{ width: '100%', height: '100%' }}> */}
        <MobileInstallHelp />
      {/* </VStack> */}
    </SettingsLayout>
  )
}
