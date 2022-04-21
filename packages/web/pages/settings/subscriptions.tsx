import { useState } from 'react'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { styled } from '../../components/tokens/stitches.config'
import { Box, VStack } from '../../components/elements/LayoutPrimitives'
import { Toaster } from 'react-hot-toast'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { StyledText } from '../../components/elements/StyledText'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { useGetSubscriptionsQuery } from '../../lib/networking/queries/useGetSubscriptionsQuery'

const HeaderWrapper = styled(Box, {
  width: '100%',
})

export default function SubscriptionsPage(): JSX.Element {
  const { subscriptions, revalidate } = useGetSubscriptionsQuery()
  const [confirmUnsubscribeName, setConfirmUnsubscribeName] =
    useState<string | null>(null)

  applyStoredTheme(false)

  async function onUnsubscribe(name: string): Promise<void> {
    // TODO: unsubscribe from the server
    // const result = await deleteLabelMutation(name)
    // if (result) {
    //   showSuccessToast('Unsubscribed', { position: 'bottom-right' })
    // } else {
    //   showErrorToast('Failed to unsubscribe', { position: 'bottom-right' })
    // }
    // revalidate()
  }

  return (
    <PrimaryLayout pageTestId="settings-subscriptions-tag">
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <VStack
        css={{
          mx: '10px',
          color: '$grayText',
        }}
      >
        {confirmUnsubscribeName ? (
          <ConfirmationModal
            message={
              'Are you sure? You will stop receiving newsletters from this subscription.'
            }
            onAccept={async () => {
              await onUnsubscribe(confirmUnsubscribeName)
              setConfirmUnsubscribeName(null)
            }}
            onOpenChange={() => setConfirmUnsubscribeName(null)}
          />
        ) : null}
        <HeaderWrapper>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              <StyledText style="fixedHeadline">Subscriptions </StyledText>
            </Box>
          </Box>
        </HeaderWrapper>
        {subscriptions
          ? subscriptions.map((subscription, i) => {
              return
            })
          : null}
      </VStack>
      <Box css={{ height: '120px' }} />
    </PrimaryLayout>
  )
}
