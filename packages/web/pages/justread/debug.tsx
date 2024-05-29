import { styled } from '@stitches/react'
import { AddToLibraryActionIcon } from '../../components/elements/icons/home/AddToLibraryActionIcon'
import { ArchiveActionIcon } from '../../components/elements/icons/home/ArchiveActionIcon'
import { CommentActionIcon } from '../../components/elements/icons/home/CommentActionIcon'
import { RemoveActionIcon } from '../../components/elements/icons/home/RemoveActionIcon'
import { ShareActionIcon } from '../../components/elements/icons/home/ShareActionIcon'
import { useApplyLocalTheme } from '../../lib/hooks/useApplyLocalTheme'
import {
  HStack,
  SpanBox,
  VStack,
} from './../../components/elements/LayoutPrimitives'

import * as HoverCard from '@radix-ui/react-hover-card'
import { Button } from '../../components/elements/Button'
import {
  HomeItem,
  HomeItemSource,
  HomeItemSourceType,
  HomeSection,
  useGetHomeItems,
} from '../../lib/networking/queries/useGetHome'
import { timeAgo } from '../../components/patterns/LibraryCards/LibraryCardStyles'
import { theme } from '../../components/tokens/stitches.config'
import { useRouter } from 'next/router'
import {
  SubscriptionType,
  useGetSubscriptionsQuery,
} from '../../lib/networking/queries/useGetSubscriptionsQuery'
import { useCallback, useMemo } from 'react'
import { refreshHomeMutation } from '../../lib/networking/mutations/refreshHome'

export default function DebugHome(): JSX.Element {
  const homeData = useGetHomeItems()
  console.log('home sections: ', homeData.errorMessage)
  useApplyLocalTheme()

  const refreshHome = useCallback(() => {
    ;(async () => {
      refreshHomeMutation()
      if (homeData?.mutate) {
        homeData.mutate()
      }
    })()
  }, [])

  return (
    <VStack
      distribution="start"
      alignment="center"
      css={{
        width: '100%',
        bg: '$readerBg',
        pt: '45px',
        minHeight: '100vh',
      }}
    >
      <VStack
        distribution="start"
        css={{
          width: '646px',
          gap: '40px',
          minHeight: '100vh',
          '@mdDown': {
            width: '100%',
          },
        }}
      >
        <Button
          style="ctaBlue"
          onClick={(event) => {
            refreshHome()
            event.preventDefault()
          }}
        >
          Refresh
        </Button>
        {homeData.sections?.map((homeSection, idx) => {
          return (
            <VStack key={`homeSection-${idx}`} css={{ width: '100%' }}>
              <SpanBox>Section {idx}</SpanBox>
              <SpanBox>Title: {homeSection.title}</SpanBox>
              <SpanBox>Layout: {homeSection.layout}</SpanBox>
              <SpanBox>Layout: {homeSection.thumbnail}</SpanBox>

              {homeSection.items.map((homeItem) => {
                return (
                  <VStack key={homeItem.id}>
                    <SpanBox>
                      {' '}
                      - Title:{' '}
                      <a href={`/me/${homeItem.slug}`}>{homeItem.title}</a>
                    </SpanBox>
                    <SpanBox> - Score: {homeItem.score}</SpanBox>
                    <SpanBox> - Word count: {homeItem.wordCount}</SpanBox>
                    <SpanBox> - Date: {homeItem.date}</SpanBox>
                    <SpanBox> - </SpanBox>
                  </VStack>
                )
              })}
            </VStack>
          )
        })}
      </VStack>
    </VStack>
  )
}
