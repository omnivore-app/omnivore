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
import { useMemo } from 'react'

export default function Home(): JSX.Element {
  const homeData = useGetHomeItems()
  console.log('home sections: ', homeData.sections)
  useApplyLocalTheme()

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
        {homeData.sections?.map((homeSection, idx) => {
          switch (homeSection.layout) {
            case 'just added':
            case 'long':
              return (
                <LongHomeSection
                  key={`section-${idx}`}
                  homeSection={homeSection}
                />
              )
          }
        })}
      </VStack>
    </VStack>
  )
}

type HomeSectionProps = {
  homeSection: HomeSection
}

const LongHomeSection = (props: HomeSectionProps): JSX.Element => {
  return (
    <SpanBox css={{ width: '100%' }}>
      {props.homeSection.items.map((homeItem) => {
        return <HomeItemView key={homeItem.id} homeItem={homeItem} />
      })}
    </SpanBox>
  )
}

const CoverImage = styled('img', {
  objectFit: 'cover',
})

type HomeItemViewProps = {
  homeItem: HomeItem
}

const TimeAgo = (props: HomeItemViewProps): JSX.Element => {
  return (
    <HStack
      distribution="start"
      alignment="center"
      css={{
        fontSize: '12px',
        fontWeight: 'normal',
        fontFamily: '$inter',
        color: '$readerContrast',
      }}
    >
      {timeAgo(props.homeItem.date)}
    </HStack>
  )
}

const Title = (props: HomeItemViewProps): JSX.Element => {
  return (
    <HStack
      distribution="start"
      alignment="center"
      css={{
        fontSize: '16px',
        lineHeight: '20px',
        fontWeight: '600',
        fontFamily: '$inter',
        color: '$readerText',
      }}
    >
      {props.homeItem.title}
    </HStack>
  )
}

const HomeItemView = (props: HomeItemViewProps): JSX.Element => {
  const router = useRouter()

  return (
    <VStack
      css={{
        width: '100%',
        padding: '20px',
        borderRadius: '5px',
        '&:hover': {
          bg: '$thBackground',
          borderRadius: '0px',
        },
      }}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey) {
          window.open(props.homeItem.url, '_blank')
        } else {
          router.push(props.homeItem.url)
        }
      }}
    >
      <HStack css={{ width: '100%', gap: '5px' }}>
        <VStack css={{ gap: '15px' }}>
          <HStack
            distribution="start"
            alignment="center"
            css={{ gap: '5px', lineHeight: '1' }}
          >
            <SourceInfo homeItem={props.homeItem} />
            <TimeAgo homeItem={props.homeItem} />
          </HStack>
          <Title homeItem={props.homeItem} />
        </VStack>
        <SpanBox css={{ ml: 'auto' }}>
          {props.homeItem.thumbnail && (
            <CoverImage
              css={{
                mt: '6px',
                width: '120px',
                height: '70px',
                borderRadius: '4px',
              }}
              src={props.homeItem.thumbnail}
            ></CoverImage>
          )}
        </SpanBox>
      </HStack>
      <SpanBox
        css={{ fontFamily: '$inter', fontSize: '13px', lineHeight: '23px' }}
      >
        {props.homeItem.previewContent}
      </SpanBox>
      <HStack css={{ gap: '6px', mt: '20px' }}>
        <Button style="ghost">
          <AddToLibraryActionIcon />
        </Button>
        <Button style="ghost">
          <CommentActionIcon />
        </Button>
        <Button style="ghost">
          <ShareActionIcon />
        </Button>
        <Button style="ghost">
          <ArchiveActionIcon />
        </Button>
        <Button style="ghost">
          <RemoveActionIcon />
        </Button>
      </HStack>
    </VStack>
  )
}

const SiteIconSmall = styled('img', {
  width: '16px',
  height: '16px',
  borderRadius: '100px',
})

const SiteIconLarge = styled('img', {
  width: '25px',
  height: '25px',
  borderRadius: '100px',
})

const SourceInfo = (props: HomeItemViewProps) => (
  <HoverCard.Root>
    <HoverCard.Trigger asChild>
      <HStack
        distribution="start"
        alignment="center"
        css={{ gap: '5px', cursor: 'pointer' }}
      >
        {props.homeItem.source.icon && (
          <SiteIconSmall
            src={props.homeItem.source.icon}
            alt={props.homeItem.source.name}
          />
        )}
        <HStack
          css={{
            lineHeight: '1',
            pb: '3px',
            fontFamily: '$inter',
            fontWeight: '500',
            fontSize: '13px',
            color: '$readerFont',
            textDecoration: 'underline',
          }}
        >
          {props.homeItem.source.name}
        </HStack>
      </HStack>
    </HoverCard.Trigger>
    <HoverCard.Portal>
      <HoverCard.Content sideOffset={5}>
        <SubscriptionSourceHoverContent source={props.homeItem.source} />
        <HoverCard.Arrow fill={theme.colors.thBackground2.toString()} />
      </HoverCard.Content>
    </HoverCard.Portal>
  </HoverCard.Root>
)

type SourceHoverContentProps = {
  source: HomeItemSource
}

const SubscriptionSourceHoverContent = (
  props: SourceHoverContentProps
): JSX.Element => {
  const mapSourceType = (
    sourceType: HomeItemSourceType
  ): SubscriptionType | undefined => {
    switch (sourceType) {
      case 'RSS':
      case 'NEWSLETTER':
        return sourceType as SubscriptionType
      default:
        return undefined
    }
  }
  const { subscriptions, isValidating } = useGetSubscriptionsQuery(
    mapSourceType(props.source.type)
  )
  const subscription = useMemo(() => {
    if (props.source.id && subscriptions) {
      return subscriptions.find((sub) => sub.id == props.source.id)
    }
    return undefined
  }, [subscriptions])

  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{
        width: '380px',
        height: '200px',
        bg: '$thBackground2',
        borderRadius: '10px',
        padding: '15px',
        gap: '10px',
        boxShadow: theme.shadows.cardBoxShadow.toString(),
      }}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ width: '100%', gap: '10px' }}
      >
        {props.source.icon && (
          <SiteIconLarge src={props.source.icon} alt={props.source.name} />
        )}
        <SpanBox
          css={{
            fontFamily: '$inter',
            fontWeight: '500',
            fontSize: '14px',
          }}
        >
          {props.source.name}
        </SpanBox>
        <SpanBox css={{ ml: 'auto', minWidth: '100px' }}>
          {subscription && subscription.status == 'ACTIVE' && (
            <Button style="ctaSubtle" css={{ fontSize: '12px' }}>
              + Unsubscribe
            </Button>
          )}
        </SpanBox>
      </HStack>
      <SpanBox
        css={{
          fontFamily: '$inter',
          fontSize: '13px',
          color: '$thTextSubtle4',
        }}
      >
        {subscription ? <>{subscription.description}</> : <></>}
      </SpanBox>
    </VStack>
  )
}
