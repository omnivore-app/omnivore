import React from 'react'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import MobileInstallHelp from '../../../components/elements/MobileInstallHelp'
import ExtensionInstallHelp from '../../../components/elements/ExtensionsInstallHelp'
import { VStack } from '../../../components/elements/LayoutPrimitives'
import { SettingsMenuView } from '../../../components/patterns/SettingsMenuView'
import { Box } from '../../../components/elements/LayoutPrimitives'

export default function Installation(): JSX.Element {
  return (
    <SettingsLayout title="Installation">
      <SettingsMenuView selected='Apps and Extensions'>
        <VStack css={{
          bg: '$grayBg',
          width: '100%',
          '@smDown': {
            marginBottom: 80,
          }
        }}>
          <Box
            css={{
              padding: '10px',
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
        </VStack>
      </SettingsMenuView>
    </SettingsLayout>
  )
}
