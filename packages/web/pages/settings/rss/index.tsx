import { useRouter } from 'next/router'
import { useState } from 'react'
import { StyledText } from '../../../components/elements/StyledText'
import { ConfirmationModal } from '../../../components/patterns/ConfirmationModal'
import {
  EmptySettingsRow,
  SettingsTable,
  SettingsTableRow,
} from '../../../components/templates/settings/SettingsTable'
import { formattedShortTime } from '../../../lib/dateFormatting'
import { unsubscribeMutation } from '../../../lib/networking/mutations/unsubscribeMutation'
import {
  SubscriptionType,
  useGetSubscriptionsQuery,
} from '../../../lib/networking/queries/useGetSubscriptionsQuery'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'

export default function Rss(): JSX.Element {
  const router = useRouter()
  const { subscriptions, revalidate, isValidating } = useGetSubscriptionsQuery(
    SubscriptionType.RSS
  )
  const [onDeleteId, setOnDeleteId] = useState<string>('')

  async function onDelete(id: string): Promise<void> {
    const result = await unsubscribeMutation('', id)
    if (result) {
      showSuccessToast('RSS feed unsubscribed', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to unsubscribe', { position: 'bottom-right' })
    }
    revalidate()
  }

  applyStoredTheme(false)

  return (
    <SettingsTable
      pageId={'rss'}
      pageInfoLink={''} // TODO: https://docs.omnivore.app/integrations/rss.html
      headerTitle={'Subscribed RSS feeds'}
      createTitle={'Add RSS feed'}
      createAction={() => {
        router.push('/settings/rss/add')
      }}
    >
      {subscriptions.length === 0 ? (
        <EmptySettingsRow
          text={isValidating ? '-' : 'No RSS feeds subscribed'}
        />
      ) : (
        subscriptions.map((subscription, i) => {
          return (
            <SettingsTableRow
              key={subscription.id}
              title={subscription.name}
              isLast={i === subscriptions.length - 1}
              onDelete={() => {
                console.log('onDelete triggered: ', subscription.id)
                setOnDeleteId(subscription.id)
              }}
              deleteTitle="Delete"
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
                  {`URL: ${subscription.url}, `}
                  {`Last fetched: ${
                    subscription.lastFetchedAt
                      ? formattedShortTime(subscription.lastFetchedAt)
                      : 'Never'
                  }`}
                </StyledText>
              }
            />
          )
        })
      )}

      {onDeleteId && (
        <ConfirmationModal
          message={
            'RSS feed will be unsubscribed. This action cannot be undone.'
          }
          onAccept={async () => {
            await onDelete(onDeleteId)
            setOnDeleteId('')
          }}
          onOpenChange={() => setOnDeleteId('')}
        />
      )}
    </SettingsTable>
  )
}
