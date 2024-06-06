import { Box, HStack, VStack } from '../../elements/LayoutPrimitives'
import { LibraryFilterMenu } from '../navMenu/LibraryMenu'
import { DiscoverHeader } from './DiscoverHeader/DiscoverHeader'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import { DiscoverItemFeed } from './DiscoverFeed/DiscoverFeed'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import toast from 'react-hot-toast'
import { Button } from '../../elements/Button'
import { showErrorToast } from '../../../lib/toastHelpers'
import {
  saveDiscoverArticleMutation,
  SaveDiscoverArticleOutput,
} from '../../../lib/networking/mutations/saveDiscoverArticle'
import { saveUrlMutation } from '../../../lib/networking/mutations/saveUrlMutation'
import { useFetchMore } from '../../../lib/hooks/useFetchMoreScroll'
import { AddLinkModal } from '../AddLinkModal'
import { useGetDiscoverFeedItems } from '../../../lib/networking/queries/useGetDiscoverFeedItems'
import { useGetDiscoverFeeds } from '../../../lib/networking/queries/useGetDiscoverFeeds'

export type LayoutType = 'LIST_LAYOUT' | 'GRID_LAYOUT'

export type TopicTabData = { title: string; subTitle: string }

export function DiscoverContainer(): JSX.Element {
  const router = useRouter()
  const viewer = useGetViewerQuery()
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [layoutType, setLayoutType] = useState<LayoutType>('GRID_LAYOUT')
  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const { feeds, revalidate, isValidating } = useGetDiscoverFeeds()
  const topics = [
    {
      title: 'Popular',
      subTitle: 'Stories that are popular on Omnivore right now...',
    },
    {
      title: 'All',
      subTitle: 'All the discover stories...',
    },
    {
      title: 'Technology',
      subTitle:
        'Stories about Gadgets, AI, Software and other technology related topics',
    },
    {
      title: 'Politics',
      subTitle:
        'Stories about Leadership, Elections, and issues affecting countries and the world',
    },
    {
      title: 'Health & Wellbeing',
      subTitle: 'Stories about Physical, Mental and Preventative Health',
    },
    {
      title: 'Business & Finance',
      subTitle:
        'Stories about the business world, startups, and the world of financial advice. ',
    },
    {
      title: 'Science & Education',
      subTitle:
        'Stories about science, breakthroughs, and the way the world works. ',
    },
    {
      title: 'Culture',
      subTitle:
        'Entertainment, Movies, Television and things that make life worth living',
    },
    {
      title: 'Gaming',
      subTitle: 'PC and Console gaming, reviews, and opinions',
    },
  ]

  const [selectedFeed, setSelectedFeed] = useState('All Feeds')
  const {
    discoverItems,
    setTopic,
    activeTopic,
    isLoading,
    hasMore,
    setPage,
    page,
  } = useGetDiscoverFeedItems(topics[1], selectedFeed)
  const handleFetchMore = useCallback(() => {
    if (isLoading || !hasMore) {
      return
    }
    setPage(page + 1)
  }, [page, isLoading])
  useFetchMore(handleFetchMore)

  const handleSaveDiscover = async (
    discoverArticleId: string,
    timezone: string,
    locale: string
  ): Promise<SaveDiscoverArticleOutput | undefined> => {
    const result = await saveDiscoverArticleMutation({
      discoverArticleId,
      timezone,
      locale,
    })
    if (result?.saveDiscoverArticle) {
      toast(
        () => (
          <Box>
            Link Saved
            <span style={{ padding: '16px' }} />
            <Button
              style="ctaDarkYellow"
              autoFocus
              onClick={() => {
                window.location.href = `/article?url=${encodeURIComponent(
                  result.saveDiscoverArticle.url
                )}`
              }}
            >
              Read Now
            </Button>
          </Box>
        ),
        { position: 'bottom-right' }
      )

      return result
    } else {
      showErrorToast('Error saving link', { position: 'bottom-right' })
    }
  }

  const handleLinkSave = async (
    link: string,
    timezone: string,
    locale: string
  ): Promise<void> => {
    const result = await saveUrlMutation(link, timezone, locale)
    if (result) {
      toast(
        () => (
          <Box>
            Link Saved
            <span style={{ padding: '16px' }} />
            <Button
              style="ctaDarkYellow"
              autoFocus
              onClick={() => {
                window.location.href = `/article?url=${encodeURIComponent(
                  link
                )}`
              }}
            >
              Read Now
            </Button>
          </Box>
        ),
        { position: 'bottom-right' }
      )
    } else {
      showErrorToast('Error saving link', { position: 'bottom-right' })
    }
  }

  useEffect(() => {
    if (window) {
      setLayoutType(
        JSON.parse(
          window.localStorage.getItem('libraryLayout') || 'GRID_LAYOUT'
        )
      )
    }
  }, [])

  const setTopicAndReturnToTop = (topic: TopicTabData) => {
    window.scroll(0, 0)
    setTopic(topic)
  }

  return (
    <VStack
      css={{
        height: '100%',
        width: 'unset',
      }}
    >
      <DiscoverHeader
        handleLinkSubmission={handleLinkSave}
        allowSelectMultiple={true}
        alwaysShowHeader={false}
        showFilterMenu={showFilterMenu}
        setShowFilterMenu={setShowFilterMenu}
        selectedFeedFilter={selectedFeed}
        applyFeedFilter={setSelectedFeed}
        feeds={feeds}
        activeTab={activeTopic}
        setActiveTab={setTopicAndReturnToTop}
        layout={layoutType}
        setShowAddLinkModal={setShowAddLinkModal}
        setLayoutType={setLayoutType}
        topics={topics}
      />
      <HStack css={{ width: '100%', height: '100%' }}>
        <LibraryFilterMenu
          setShowAddLinkModal={setShowAddLinkModal}
          searchTerm={'NONE'} // This is done to stop the library filter menu actually having a highlight. Hacky.
          applySearchQuery={(searchQuery: string) => {
            router?.push(`/home?q=${searchQuery}`)
          }}
          showFilterMenu={showFilterMenu}
          setShowFilterMenu={setShowFilterMenu}
        />
        <DiscoverItemFeed
          layout={layoutType}
          activeTab={activeTopic}
          handleLinkSubmission={handleSaveDiscover}
          items={discoverItems ?? []}
          viewer={viewer.viewerData?.me}
        />
        {showAddLinkModal && (
          <AddLinkModal
            handleLinkSubmission={handleLinkSave}
            onOpenChange={() => setShowAddLinkModal(false)}
          />
        )}
      </HStack>
    </VStack>
  )
}
