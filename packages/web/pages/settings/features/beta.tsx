import { useCallback, useEffect, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Button } from '../../../components/elements/Button'
import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../../components/elements/LayoutPrimitives'
import { StyledText } from '../../../components/elements/StyledText'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { styled, theme } from '../../../components/tokens/stitches.config'
import { updateEmailMutation } from '../../../lib/networking/mutations/updateEmailMutation'
import { updateUserMutation } from '../../../lib/networking/mutations/updateUserMutation'
import { updateUserProfileMutation } from '../../../lib/networking/mutations/updateUserProfileMutation'
import { useGetLibraryItemsQuery } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useValidateUsernameQuery } from '../../../lib/networking/queries/useValidateUsernameQuery'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { ConfirmationModal } from '../../../components/patterns/ConfirmationModal'
import { ProgressBar } from '../../../components/elements/ProgressBar'
import { emptyTrashMutation } from '../../../lib/networking/mutations/emptyTrashMutation'
import { ProgressIndicator } from '@radix-ui/react-progress'
import { Spinner } from 'phosphor-react'
import { optInFeature } from '../../../lib/networking/mutations/optIntoFeatureMutation'

const ACCOUNT_LIMIT = 50_000

const StyledLabel = styled('label', {
  fontWeight: 600,
  fontSize: '16px',
  marginBottom: '5px',
})

export default function Account(): JSX.Element {
  const { viewerData, isLoading, mutate } = useGetViewerQuery()
  const [pageLoading, setPageLoading] = useState(false)

  const showSpinner = useMemo(() => {
    return isLoading || pageLoading
  }, [isLoading, pageLoading])

  const requestFeatureAccess = useCallback(
    async (featureName: string) => {
      setPageLoading(true)
      const result = await optInFeature({ name: featureName })
      if (!result) {
        showErrorToast('Error opting into feature.')
      } else {
        showSuccessToast('Feature added')
      }
      mutate()
      setPageLoading(false)
    },
    [setPageLoading, mutate]
  )

  const hasYouTube = useMemo(() => {
    return (
      (viewerData?.me?.features.indexOf('youtube-transcripts') ?? -1) !== -1
    )
  }, [viewerData])

  applyStoredTheme()

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      <VStack
        css={{ width: '100%', height: '100%' }}
        distribution="start"
        alignment="center"
      >
        <VStack
          css={{
            padding: '24px',
            width: '100%',
            height: '100%',
            minWidth: '300px',
            maxWidth: '865px',
          }}
        >
          <VStack
            css={{
              padding: '24px',
              width: '100%',
              height: '100%',
              bg: '$grayBg',
              gap: '10px',
              borderRadius: '5px',
            }}
          >
            <StyledLabel>Enabled beta features</StyledLabel>
            {!showSpinner ? (
              <>
                {viewerData?.me?.features.map((feature) => {
                  return (
                    <StyledText
                      key={`feature-${feature}`}
                      style="footnote"
                      css={{
                        display: 'flex',
                        gap: '5px',
                        marginBlockStart: '0px',
                        marginBlockEnd: '0px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                      ></input>
                      {feature}
                    </StyledText>
                  )
                })}

                {!hasYouTube /* || !hasAISummaries || !hasDigest */ && (
                  <StyledLabel css={{ mt: '25px' }}>
                    Available beta features
                  </StyledLabel>
                )}

                <VStack css={{ gap: '15px' }}>
                  {!hasYouTube && (
                    <VStack
                      alignment="start"
                      distribution="start"
                      css={{ width: '100%' }}
                    >
                      <StyledText
                        style="footnote"
                        css={{ display: 'flex', gap: '5px' }}
                      >
                        - YouTube transcripts: nicely formatted documents
                        generated from YouTube transcript data. Currently
                        limited to videos under 30 minutes.
                      </StyledText>
                      <Button
                        style="ctaDarkYellow"
                        onClick={(event) => {
                          requestFeatureAccess('youtube-transcripts')
                          event.preventDefault()
                        }}
                      >
                        Request feature
                      </Button>
                    </VStack>
                  )}

                  {/* <VStack
                    alignment="start"
                    distribution="start"
                    css={{ width: '100%' }}
                  >
                    <StyledText
                      style="footnote"
                      css={{ display: 'flex', gap: '5px' }}
                    >
                      - AI Summaries: Short summaries of your newly saved
                      articles
                    </StyledText>
                    <Button
                      style="ctaDarkYellow"
                      onClick={(event) => {
                        requestFeatureAccess('ai-summaries')
                        event.preventDefault()
                      }}
                    >
                      Request feature
                    </Button>
                  </VStack>

                  <VStack
                    alignment="start"
                    distribution="start"
                    css={{ width: '100%' }}
                  >
                    <StyledText
                      style="footnote"
                      css={{ display: 'flex', gap: '5px' }}
                    >
                      - Daily digest: Every day we pick some of the items we
                      think You will enjoy reading the most and create a daily
                      digest of them.
                    </StyledText>
                    <Button
                      style="ctaDarkYellow"
                      onClick={(event) => {
                        requestFeatureAccess('daily-digest')
                        event.preventDefault()
                      }}
                    >
                      Request feature
                    </Button>
                  </VStack> */}
                </VStack>
              </>
            ) : (
              <HStack
                distribution="center"
                css={{
                  width: '100%',
                  svg: {
                    animation: 'spin 1s infinite linear',
                    '@keyframes spin': {
                      from: {
                        transform: 'scale(1) rotate(0deg)',
                      },
                      to: {
                        transform: 'scale(1) rotate(360deg)',
                      },
                    },
                  },
                }}
              >
                <Spinner size={16} />
              </HStack>
            )}
          </VStack>
        </VStack>
      </VStack>
    </SettingsLayout>
  )
}
