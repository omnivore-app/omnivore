import { useRouter } from 'next/router'
import { FloppyDisk, Pencil, XCircle } from 'phosphor-react'
import { useState } from 'react'
import { FormInput } from '../../../components/elements/FormElements'
import { HStack, SpanBox } from '../../../components/elements/LayoutPrimitives'
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
  SubscriptionStatus,
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
  const [onPauseId, setOnPauseId] = useState('')
  const [onEditStatus, setOnEditStatus] = useState<SubscriptionStatus>()

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

    showSuccessToast('Feed updated', { position: 'bottom-right' })
    revalidate()
  }

  async function onDelete(id: string): Promise<void> {
    const result = await unsubscribeMutation('', id)
    if (result) {
      showSuccessToast('Feed unsubscribed', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to unsubscribe', { position: 'bottom-right' })
    }
    revalidate()
  }

  async function onPause(
    id: string,
    status: SubscriptionStatus = 'UNSUBSCRIBED'
  ): Promise<void> {
    const result = await updateSubscriptionMutation({
      id,
      status,
    })

    const action = status == 'UNSUBSCRIBED' ? 'pause' : 'resume'

    if (result) {
      showSuccessToast(`Feed ${action}d`, {
        position: 'bottom-right',
      })
    } else {
      showErrorToast(`Failed to ${action}`, { position: 'bottom-right' })
    }
    revalidate()
  }

  applyStoredTheme(false)

  return (
    <SettingsTable
      pageId={'feeds'}
      pageInfoLink="https://docs.omnivore.app/using/feeds.html"
      headerTitle="Subscribed feeds"
      createTitle="Add a feed"
      createAction={() => {
        router.push('/settings/feeds/add')
      }}
      suggestionInfo={{
        title: 'Add RSS and Atom feeds to your Omnivore account',
        message:
          'When you add a new feed the last 24hrs of items, or at least one item will be added to your account. Feeds will be checked for updates every hour, and new items will be added to your library.',
        docs: 'https://docs.omnivore.app/using/feeds.html',
        key: '--settings-feeds-show-help',
        CTAText: 'Add a feed',
        onClickCTA: () => {
          router.push('/settings/feeds/add')
        },
      }}
    >
      {subscriptions.length === 0 ? (
        <EmptySettingsRow text={isValidating ? '-' : 'No feeds subscribed'} />
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
                    <SpanBox
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
                    </SpanBox>
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
              onEdit={() => {
                setOnEditStatus(
                  subscription.status == 'ACTIVE' ? 'UNSUBSCRIBED' : 'ACTIVE'
                )
                setOnPauseId(subscription.id)
              }}
              deleteTitle="Delete"
              editTitle={subscription.status === 'ACTIVE' ? 'Pause' : 'Resume'}
              sublineElement={
                <SpanBox
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
                </SpanBox>
              }
              onClick={() => {
                router.push(`/home?q=in:inbox rss:"${subscription.url}"`)
              }}
              extraElement={
                <SpanBox
                  css={{
                    fontSize: '12px',
                  }}
                >
                  {subscription.status === 'ACTIVE' ? 'Active' : 'Paused'}
                </SpanBox>
              }
            />
          )
        })
      )}

      {onDeleteId && (
        <ConfirmationModal
          message={'Feed will be unsubscribed. This action cannot be undone.'}
          onAccept={async () => {
            await onDelete(onDeleteId)
            setOnDeleteId('')
          }}
          onOpenChange={() => setOnDeleteId('')}
        />
      )}

      {onPauseId && (
        <ConfirmationModal
          message={`Feed will be ${
            onEditStatus === 'UNSUBSCRIBED' ? 'paused' : 'resumed'
          }. You can ${
            onEditStatus === 'UNSUBSCRIBED' ? 'resume' : 'pause'
          } it at any time.`}
          onAccept={async () => {
            await onPause(onPauseId, onEditStatus)
            setOnPauseId('')
            setOnEditStatus(undefined)
          }}
          onOpenChange={() => {
            setOnPauseId('')
            setOnEditStatus(undefined)
          }}
        />
      )}
    </SettingsTable>
  )
}
