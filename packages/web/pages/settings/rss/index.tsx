import { useRouter } from 'next/router'
import { FloppyDisk, Pencil, XCircle } from 'phosphor-react'
import { useState } from 'react'
import { FormInput } from '../../../components/elements/FormElements'
import { HStack } from '../../../components/elements/LayoutPrimitives'
import { StyledText } from '../../../components/elements/StyledText'
import { ConfirmationModal } from '../../../components/patterns/ConfirmationModal'
import {
  EmptySettingsRow,
  SettingsTable,
  SettingsTableRow,
} from '../../../components/templates/settings/SettingsTable'
import { theme } from '../../../components/tokens/stitches.config'
import { formattedDateTime } from '../../../lib/dateFormatting'
import { unsubscribeMutation } from '../../../lib/networking/mutations/unsubscribeMutation'
import { updateSubscriptionMutation } from '../../../lib/networking/mutations/updateSubscriptionMutation'
import {
  SubscriptionType,
  useGetSubscriptionsQuery,
} from '../../../lib/networking/queries/useGetSubscriptionsQuery'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { formatMessage } from '../../../locales/en/messages'

export default function Rss(): JSX.Element {
  const router = useRouter()
  const { subscriptions, revalidate, isValidating } = useGetSubscriptionsQuery(
    SubscriptionType.RSS
  )
  const [onDeleteId, setOnDeleteId] = useState<string>('')
  const [onEditId, setOnEditId] = useState('')
  const [onEditName, setOnEditName] = useState('')

  async function updateSubscription(): Promise<void> {
    const result = await updateSubscriptionMutation({
      id: onEditId,
      name: onEditName,
    })

    if (result.updateSubscription.errorCodes) {
      const errorMessage = formatMessage({
        id: `error.${result.updateSubscription.errorCodes[0]}`,
      })
      showErrorToast(`failed to update subscription: ${errorMessage}`, {
        position: 'bottom-right',
      })
      return
    }

    showSuccessToast('RSS feed updated', { position: 'bottom-right' })
    revalidate()
  }

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
              title={
                onEditId === subscription.id ? (
                  <HStack alignment={'center'} distribution={'start'}>
                    <FormInput
                      value={onEditName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setOnEditName(e.target.value)}
                      placeholder="Description"
                      css={{
                        m: '0px',
                        fontSize: '18px',
                        '@mdDown': {
                          fontSize: '12px',
                          fontWeight: 'bold',
                        },
                        width: '400px',
                      }}
                    />
                    <HStack>
                      <FloppyDisk
                        style={{ cursor: 'pointer', marginLeft: '5px' }}
                        color={theme.colors.omnivoreCtaYellow.toString()}
                        onClick={async (e) => {
                          e.stopPropagation()
                          await updateSubscription()
                          setOnEditId('')
                        }}
                      />
                      <XCircle
                        style={{ cursor: 'pointer', marginLeft: '5px' }}
                        color={theme.colors.omnivoreRed.toString()}
                        onClick={(e) => {
                          e.stopPropagation()
                          setOnEditId('')
                          setOnEditName('')
                        }}
                      />
                    </HStack>
                  </HStack>
                ) : (
                  <HStack alignment={'center'} distribution={'start'}>
                    <StyledText
                      css={{
                        m: '0px',
                        fontSize: '18px',
                        '@mdDown': {
                          fontSize: '12px',
                          fontWeight: 'bold',
                        },
                      }}
                    >
                      {subscription.name}
                    </StyledText>
                    <Pencil
                      style={{ cursor: 'pointer', marginLeft: '5px' }}
                      color={theme.colors.omnivoreLightGray.toString()}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOnEditName(subscription.name)
                        setOnEditId(subscription.id)
                      }}
                    />
                  </HStack>
                )
              }
              isLast={i === subscriptions.length - 1}
              onDelete={() => {
                console.log('onDelete triggered: ', subscription.id)
                setOnDeleteId(subscription.id)
              }}
              deleteTitle="Delete"
              sublineElement={
                <StyledText
                  css={{
                    my: '8px',
                    fontSize: '11px',
                  }}
                >
                  {`URL: ${subscription.url}, `}
                  {`Last fetched: ${
                    subscription.lastFetchedAt
                      ? formattedDateTime(subscription.lastFetchedAt)
                      : 'Never'
                  }`}
                </StyledText>
              }
              onClick={() => {
                router.push(`/home?q=in:inbox rss:"${subscription.url}"`)
              }}
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
