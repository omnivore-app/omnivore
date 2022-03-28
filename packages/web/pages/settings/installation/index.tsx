import React from 'react'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import MobileInstallHelp from '../../../components/elements/MobileInstallHelp'
import ExtensionInstallHelp from '../../../components/elements/ExtensionsInstallHelp'
import { Box } from '../../../components/elements/LayoutPrimitives'

export default function Installation(): JSX.Element {
  return (
    <SettingsLayout title="Installation">
      <Box
        css={{
          maxWidth: '50rem',
          margin: 'auto',
          marginBottom: '100px',
          padding: '10px',
          borderRadius: '6px',
          '@lg': {
            backgroundColor: '$grayBg',
            border: '1px solid #0000000F',
            boxShadow: '0px 3px 11px 0px #201F1D0A',
          },
        }}
      >
        <MobileInstallHelp />
        <Box
          css={{
            my: '$2',
            '@lg': {
              my: '12px',
              height: '1px',
              backgroundColor: '$grayBorder',
            },
          }}
        />
        <ExtensionInstallHelp />
      </Box>
    </SettingsLayout>
  )
}
