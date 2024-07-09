import { Spinner } from '@phosphor-icons/react'
import { useCallback, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Button } from '../../../components/elements/Button'
import { HStack, VStack } from '../../../components/elements/LayoutPrimitives'
import { StyledText } from '../../../components/elements/StyledText'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { styled } from '../../../components/tokens/stitches.config'
import { userHasFeature } from '../../../lib/featureFlag'
import { optInFeature } from '../../../lib/networking/mutations/optIntoFeatureMutation'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'

const StyledLabel = styled('label', {
  fontWeight: 600,
  fontSize: '16px',
  marginBottom: '5px',
})

export default function BetaFeatures(): JSX.Element {
  applyStoredTheme()

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      <VStack
        css={{ width: '100%', height: '100%', mt: '80px' }}
        distribution="start"
        alignment="center"
      >
        All beta features are enabled.
      </VStack>
    </SettingsLayout>
  )
}
