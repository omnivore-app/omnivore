import { useRouter } from 'next/router'
import { FloppyDisk, Pencil, XCircle } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { FormInput } from '../../../components/elements/FormElements'
import { HStack, SpanBox } from '../../../components/elements/LayoutPrimitives'
import { ConfirmationModal } from '../../../components/patterns/ConfirmationModal'
import {
  EmptySettingsRow,
  SettingsTable,
  SettingsTableRow,
} from '../../../components/templates/settings/SettingsTable'
import { theme } from '../../../components/tokens/stitches.config'
import { unsubscribeDiscoverFeedMutation } from '../../../lib/networking/mutations/unsubscribeDiscoverFeedMutation'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { formatMessage } from '../../../locales/en/messages'
import { useGetDiscoverFeeds } from '../../../lib/networking/queries/useGetDiscoverFeeds'
import {
  UpdateDiscoverFeedInput,
  updateDiscoverFeedMutation,
} from '../../../lib/networking/mutations/updateDiscoverFeedMutation'

export default function DiscoverFeedsSettings(): JSX.Element {
  const router = useRouter()
  const { feeds, revalidate, isValidating } = useGetDiscoverFeeds()
  const [onDeleteId, setOnDeleteId] = useState<string>('')
  const [onEditId, setOnEditId] = useState('')
  const [onEditName, setOnEditName] = useState('')

  const sortedFeeds = useMemo(() => {
    if (!feeds) {
      return []
    }
    return feeds
  }, [feeds])

  async function updateSubscription(
    input: UpdateDiscoverFeedInput
  ): Promise<void> {
    const result = await updateDiscoverFeedMutation(input)

    if (result.editDiscoverFeed.errorCodes) {
      const errorMessage = formatMessage({
        id: `error.${result.editDiscoverFeed.errorCodes[0]}`,
      })
      showErrorToast(`failed to update subscription: ${errorMessage}`, {
        position: 'bottom-right',
      })
      return
    }

    showSuccessToast('Discover Feed updated', { position: 'bottom-right' })
    revalidate()
  }

  async function onDelete(id: string): Promise<void> {
    const result = await unsubscribeDiscoverFeedMutation(id)
    if (result) {
      showSuccessToast('Discover Feed unsubscribed', {
        position: 'bottom-right',
      })
    } else {
      showErrorToast('Failed to unsubscribe', { position: 'bottom-right' })
    }
    revalidate()
  }

  applyStoredTheme()

  return (
    <SettingsTable
      pageId={'feeds'}
      pageInfoLink="https://docs.omnivore.app/using/feeds.html"
      headerTitle="Subscribed feeds"
      createTitle="Add a Discover feed"
      createAction={() => {
        router.push('/settings/discover-feeds/add')
      }}
      suggestionInfo={{
        title: 'Add RSS and Atom feeds to your Omnivore account',
        message:
          'When you add a new feed the last 24hrs of items, or at least one item will be added to your account. Feeds will be checked for updates every four hours, and new items will be added to your Following. You can also add feeds to your Library by checking the box below.',
        docs: 'https://docs.omnivore.app/using/feeds.html',
        key: '--settings-feeds-show-help',
        CTAText: 'Add a feed',
        onClickCTA: () => {
          router.push('/settings/discover-feeds/add')
        },
      }}
    >
      {sortedFeeds.length === 0 ? (
        <EmptySettingsRow text={isValidating ? '-' : 'No feeds subscribed'} />
      ) : (
        sortedFeeds.map((feed, i) => {
          return (
            <SettingsTableRow
              key={feed.id}
              title={
                onEditId === feed.id ? (
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
                            feedId: onEditId,
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
                      {feed.visibleName}
                    </SpanBox>
                    <Pencil
                      style={{ cursor: 'pointer', marginLeft: '5px' }}
                      color={theme.colors.omnivoreLightGray.toString()}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOnEditName(feed.visibleName)
                        setOnEditId(feed.id)
                      }}
                    />
                  </HStack>
                )
              }
              isLast={i === sortedFeeds.length - 1}
              onDelete={() => {
                console.log('onDelete triggered: ', feed.title)
                setOnDeleteId(feed.id)
              }}
              deleteTitle="Unsubscribe"
              sublineElement={
                <SpanBox
                  css={{
                    my: '8px',
                    fontSize: '11px',
                  }}
                >
                  {`URL: ${feed.link}, `}
                </SpanBox>
              }
              onClick={() => {
                // router.push(`/home?q=in:inbox rss:"${subscription.url}"`)
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
          message={'Discover Feed will be unsubscribed.'}
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
