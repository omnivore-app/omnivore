import React, { useEffect } from 'react'
import Router from 'next/router'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import MobileInstallHelp from '../../../components/elements/MobileInstallHelp'
import { VStack } from '../../../components/elements/LayoutPrimitives'

export default function Mobile(): JSX.Element {
  return (
    <SettingsLayout title="Mobile Installation">
      <MobileInstallHelp />
    </SettingsLayout>
  )
}
