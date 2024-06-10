import { useRouter } from 'next/router'
import { FloppyDisk, Pencil, XCircle } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { FormInput } from '../../../components/elements/FormElements'
import {
  HStack,
  SpanBox,
  VStack,
} from '../../../components/elements/LayoutPrimitives'
import { ConfirmationModal } from '../../../components/patterns/ConfirmationModal'
import {
  EmptySettingsRow,
  SettingsTable,
  SettingsTableRow,
} from '../../../components/templates/settings/SettingsTable'
import { theme } from '../../../components/tokens/stitches.config'
import { formattedDateTime } from '../../../lib/dateFormatting'
import { unsubscribeMutation } from '../../../lib/networking/mutations/unsubscribeMutation'
import {
  UpdateSubscriptionInput,
  updateSubscriptionMutation,
} from '../../../lib/networking/mutations/updateSubscriptionMutation'
import {
  FetchContentType,
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

  const sortedSubscriptions = useMemo(() => {
    if (!subscriptions) {
      return []
    }
    return subscriptions
      .filter((s) => s.status == 'ACTIVE')
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [subscriptions])

  async function updateSubscription(
    input: UpdateSubscriptionInput
  ): Promise<void> {
    const result = await updateSubscriptionMutation(input)

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

  const updateFetchContent = async (
    id: string,
    fetchContent: FetchContentType
  ): Promise<void> => {
    const result = await updateSubscriptionMutation({
      id,
      fetchContentType: fetchContent,
    })

    if (result) {
      showSuccessToast(`Updated feed fetch rule`)
    } else {
      showErrorToast(`Error updating feed fetch rule`)
    }
    revalidate()
  }

  applyStoredTheme()

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
          'When you add a new feed the last 24hrs of items, or at least one item will be added to your account. Feeds will be checked for updates every four hours, and new items will be added to your Following. You can also add feeds to your Library by checking the box below.',
        docs: 'https://docs.omnivore.app/using/feeds.html',
        key: '--settings-feeds-show-help',
        CTAText: 'Add a feed',
        onClickCTA: () => {
          router.push('/settings/feeds/add')
        },
      }}
    >
      {sortedSubscriptions.length === 0 ? (
        <EmptySettingsRow text={isValidating ? '-' : 'No feeds subscribed'} />
      ) : (
        sortedSubscriptions.map((subscription, i) => {
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
                          await updateSubscription({
                            id: onEditId,
                            name: onEditName,
                          })
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
              isLast={i === sortedSubscriptions.length - 1}
              onDelete={() => {
                console.log('onDelete triggered: ', subscription.id)
                setOnDeleteId(subscription.id)
              }}
              deleteTitle="Unsubscribe"
              sublineElement={
                <VStack
                  css={{
                    my: '8px',
                    fontSize: '11px',
                  }}
                >
                  <SpanBox>{`URL: ${subscription.url}`}</SpanBox>
                  {/* show failed timestamp instead of last refreshed timestamp if the feed failed to refresh */}
                  {subscription.failedAt ? (
                    <SpanBox
                      css={{ color: 'red' }}
                    >{`Failed to refresh: ${formattedDateTime(
                      subscription.failedAt
                    )}`}</SpanBox>
                  ) : (
                    <SpanBox>{`Last refreshed: ${
                      subscription.lastFetchedAt
                        ? formattedDateTime(subscription.lastFetchedAt)
                        : 'Never'
                    }`}</SpanBox>
                  )}
                  <SpanBox>
                    {subscription.mostRecentItemDate &&
                      `Most recent item: ${formattedDateTime(
                        subscription.mostRecentItemDate
                      )}`}
                  </SpanBox>
                  <select
                    tabIndex={-1}
                    onChange={(event) => {
                      ;(async () => {
                        updateFetchContent(
                          subscription.id,
                          event.target.value as FetchContentType
                        )
                      })()
                    }}
                    defaultValue={subscription.fetchContentType}
                    style={{
                      padding: '5px',
                      marginTop: '5px',
                      borderRadius: '6px',
                      minWidth: '196px',
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                    }}
                  >
                    <option value="ALWAYS">Fetch link: Always</option>
                    <option value="NEVER">Fetch link: Never</option>
                    <option value="WHEN_EMPTY">Fetch link: When empty</option>
                  </select>
                </VStack>
              }
              onClick={() => {
                router.push(`/home?q=in:inbox rss:"${subscription.url}"`)
              }}
              // extraElement={
              //   <HStack
              //     distribution="start"
              //     alignment="center"
              //     css={{
              //       padding: '0 5px',
              //     }}
              //   >
              //     <CheckboxComponent
              //       checked={!!subscription.autoAddToLibrary}
              //       setChecked={async (checked) => {
              //         await updateSubscriptionMutation({
              //           id: subscription.id,
              //           autoAddToLibrary: checked,
              //         })
              //         revalidate()
              //       }}
              //     />
              //     <SpanBox
              //       css={{
              //         padding: '0 5px',
              //         fontSize: '12px',
              //       }}
              //     >
              //       Auto add to library
              //     </SpanBox>
              //   </HStack>
              // }
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
