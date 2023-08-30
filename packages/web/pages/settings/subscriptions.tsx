import { useMemo, useState } from 'react'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import {
  Subscription,
  SubscriptionType,
  useGetSubscriptionsQuery,
} from '../../lib/networking/queries/useGetSubscriptionsQuery'
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
  const [confirmUnsubscribeSubscription, setConfirmUnsubscribeSubscription] =
    useState<Subscription | null>(null)

  applyStoredTheme(false)

  async function onUnsubscribe(subscription: Subscription): Promise<void> {
    const result = await unsubscribeMutation(subscription.name, subscription.id)
    if (result) {
      showSuccessToast('Unsubscribed', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to unsubscribe', { position: 'bottom-right' })
    }
    revalidate()
  }

  const sortedSubscriptions = useMemo(() => {
    if (!subscriptions) {
      return []
    }
    return subscriptions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [subscriptions])

  return (
    <SettingsTable
      pageId="settings-subscriptions-tag"
      pageInfoLink="https://docs.omnivore.app/using/inbox.html"
      headerTitle="Subscriptions"
    >
      <>
        {sortedSubscriptions.length > 0 ? (
          sortedSubscriptions.map((subscription, i) => {
            return (
              <SettingsTableRow
                key={subscription.id}
                title={subscription.name}
                isLast={i === sortedSubscriptions.length - 1}
                onDelete={() => setConfirmUnsubscribeSubscription(subscription)}
                deleteTitle="Unsubscribe"
                sublineElement={
                  <StyledText
                    css={{
                      my: '5px',
                      fontSize: '11px',
                      a: {
                        color: '$omnivoreCtaYellow',
                      },
                    }}
                  >
                    {`Last received ${formattedShortDate(
                      subscription.updatedAt
                    )} at `}
                    {subscription.newsletterEmail && (
                      <Link
                        href={`/settings/emails?address=${subscription.newsletterEmail}`}
                      >
                        {subscription.newsletterEmail}
                      </Link>
                    )}
                  </StyledText>
                }
              />
            )
          })
        ) : (
          <EmptySettingsRow
            text={isValidating ? '-' : 'No Email Subscriptions Found'}
          />
        )}

        {confirmUnsubscribeSubscription ? (
          <ConfirmationModal
            message={
              confirmUnsubscribeSubscription.type == SubscriptionType.NEWSLETTER
                ? 'Are you sure? You will stop receiving newsletters from this subscription.'
                : 'Are you sure? You will stop receiving updates from this feed.'
            }
            onAccept={async () => {
              await onUnsubscribe(confirmUnsubscribeSubscription)
              setConfirmUnsubscribeSubscription(null)
            }}
            onOpenChange={() => setConfirmUnsubscribeSubscription(null)}
          />
        ) : null}
      </>
    </SettingsTable>
  )
}
