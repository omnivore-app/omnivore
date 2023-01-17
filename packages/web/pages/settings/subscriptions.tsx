import { useState } from 'react'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { useGetSubscriptionsQuery } from '../../lib/networking/queries/useGetSubscriptionsQuery'
import { unsubscribeMutation } from '../../lib/networking/mutations/unsubscribeMutation'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import {
  EmptySettingsRow,
  SettingsTable,
  SettingsTableRow,
} from '../../components/templates/settings/SettingsTable'
import { StyledText } from '../../components/elements/StyledText'
import Link from 'next/link'
import { formattedShortDate } from '../../lib/dateFormatting'

export default function SubscriptionsPage(): JSX.Element {
  const { subscriptions, revalidate, isValidating } = useGetSubscriptionsQuery()
  const [confirmUnsubscribeName, setConfirmUnsubscribeName] =
    useState<string | null>(null)

  applyStoredTheme(false)

  async function onUnsubscribe(name: string): Promise<void> {
    const result = await unsubscribeMutation(name)
    if (result) {
      showSuccessToast('Unsubscribed', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to unsubscribe', { position: 'bottom-right' })
    }
    revalidate()
  }

  return (
    <SettingsTable
      pageId="settings-subscriptions-tag"
      pageHeadline="Subscriptions"
      pageInfoLink="/help/newsletters"
      headerTitle="Subscriptions"
    >
      <>
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription, i) => {
            return (
              <SettingsTableRow
                key={subscription.id}
                title={subscription.name}
                isLast={i === subscriptions.length - 1}
                onDelete={() => onUnsubscribe(subscription.name)}
                deleteTitle="Unsubscribe"
                sublineElement={
                  <StyledText
                    css={{
                      my: '5px',
                      fontSize: '11px',
                    }}
                  >
                    {`Last received ${formattedShortDate(
                      subscription.updatedAt
                    )} at `}
                    <Link
                      href={`/settings/emails?address=${subscription.newsletterEmail}`}
                    >
                      {subscription.newsletterEmail}
                    </Link>
                  </StyledText>
                }
              />
            )
          })
        ) : (
          <EmptySettingsRow
            text={isValidating ? '' : 'No Email Subscriptions Found'}
          />
        )}

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
      </>
    </SettingsTable>
  )

  // return (
  //   <PrimaryLayout pageTestId="settings-subscriptions-tag">
  //     <Toaster
  //       containerStyle={{
  //         top: '5rem',
  //       }}
  //     />

  //     {confirmUnsubscribeName ? (
  //       <ConfirmationModal
  //         message={
  //           'Are you sure? You will stop receiving newsletters from this subscription.'
  //         }
  //         onAccept={async () => {
  //           await onUnsubscribe(confirmUnsubscribeName)
  //           setConfirmUnsubscribeName(null)
  //         }}
  //         onOpenChange={() => setConfirmUnsubscribeName(null)}
  //       />
  //     ) : null}
  //     <Table
  //       heading={'Subscriptions'}
  //       headers={headers}
  //       rows={rows}
  //       onDelete={setConfirmUnsubscribeName}
  //     />
  //   </PrimaryLayout>
  // )
}
