import * as HoverCard from '@radix-ui/react-hover-card'
import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { Button } from '../elements/Button'
import { AddToLibraryActionIcon } from '../elements/icons/home/AddToLibraryActionIcon'
import { ArchiveActionIcon } from '../elements/icons/home/ArchiveActionIcon'
import { CommentActionIcon } from '../elements/icons/home/CommentActionIcon'
import { RemoveActionIcon } from '../elements/icons/home/RemoveActionIcon'
import { ShareActionIcon } from '../elements/icons/home/ShareActionIcon'
import Pagination from '../elements/Pagination'
import { timeAgo } from '../patterns/LibraryCards/LibraryCardStyles'
import { theme } from '../tokens/stitches.config'
import { useApplyLocalTheme } from '../../lib/hooks/useApplyLocalTheme'
import { useGetHiddenHomeSection } from '../../lib/networking/queries/useGetHiddenHomeSection'
import {
  HomeItem,
  HomeItemSource,
  HomeItemSourceType,
  HomeSection,
  useGetHomeItems,
} from '../../lib/networking/queries/useGetHome'
import {
  SubscriptionType,
  useGetSubscriptionsQuery,
} from '../../lib/networking/queries/useGetSubscriptionsQuery'
import { Box, HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import { Toaster } from 'react-hot-toast'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'

export function HomeContainer(): JSX.Element {
  const homeData = useGetHomeItems()
  const { viewerData } = useGetViewerQuery()

  useApplyLocalTheme()

  const viewerUsername = useMemo(() => {
    return viewerData?.me?.profile.username
  }, [viewerData])

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
      <Toaster />
      <VStack
        distribution="start"
        css={{
          width: '646px',
          gap: '50px',
          minHeight: '100vh',
          '@mdDown': {
            width: '100%',
          },
        }}
      >
        {homeData.sections?.map((homeSection, idx) => {
          if (homeSection.items.length < 1) {
            return <></>
          }
          switch (homeSection.layout) {
            case 'just_added':
              return (
                <JustAddedHomeSection
                  key={`section-${idx}`}
                  homeSection={homeSection}
                  viewerUsername={viewerUsername}
                />
              )
            case 'top_picks':
              return (
                <TopPicksHomeSection
                  key={`section-${idx}`}
                  homeSection={homeSection}
                  viewerUsername={viewerUsername}
                />
              )
            case 'quick_links':
              return (
                <QuickLinksHomeSection
                  key={`section-${idx}`}
                  homeSection={homeSection}
                  viewerUsername={viewerUsername}
                />
              )
            case 'hidden':
              return (
                <HiddenHomeSection
                  key={`section-${idx}`}
                  homeSection={homeSection}
                  viewerUsername={viewerUsername}
                />
              )
            default:
              return <></>
          }
        })}
      </VStack>
    </VStack>
  )
}

type HomeSectionProps = {
  homeSection: HomeSection
  viewerUsername: string | undefined
}

const JustAddedHomeSection = (props: HomeSectionProps): JSX.Element => {
  const router = useRouter()
  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
        gap: '20px',
      }}
    >
      <HStack
        css={{
          width: '100%',
          lineHeight: '1',
          '@mdDown': {
            px: '20px',
          },
        }}
        distribution="start"
        alignment="start"
      >
        <SpanBox
          css={{
            fontFamily: '$inter',
            fontSize: '16px',
            fontWeight: '600',
            color: '$homeTextTitle',
          }}
        >
          {props.homeSection.title}
        </SpanBox>
        <SpanBox
          css={{
            ml: 'auto',
            fontFamily: '$inter',
            fontSize: '13px',
            fontWeight: '400',
            color: '$homeTextTitle',
          }}
        >
          <Button
            style="link"
            onClick={(event) => {
              router.push('/l/library')
              event.preventDefault()
            }}
            css={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            View All
          </Button>
        </SpanBox>
      </HStack>
      <HStack
        css={{
          width: '100%',
          lineHeight: '1',
          overflow: 'scroll',
          gap: '25px',
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': {
            display: 'none',
          },
          '@mdDown': {
            px: '20px',
          },
        }}
        distribution="start"
        alignment="start"
      >
        {props.homeSection.items.map((homeItem) => {
          return <JustAddedItemView key={homeItem.id} homeItem={homeItem} />
        })}
      </HStack>
    </VStack>
  )
}

const TopPicksHomeSection = (props: HomeSectionProps): JSX.Element => {
  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
        gap: '20px',
      }}
    >
      <SpanBox
        css={{
          fontFamily: '$inter',
          fontSize: '16px',
          fontWeight: '600',
          color: '$homeTextTitle',
          '@mdDown': {
            px: '20px',
          },
        }}
      >
        {props.homeSection.title}
      </SpanBox>

      <Pagination
        items={props.homeSection.items}
        itemsPerPage={4}
        loadMoreButtonText="Load more Top Picks"
        render={(homeItem) => (
          <TopicPickHomeItemView key={homeItem.id} homeItem={homeItem} />
        )}
      />
    </VStack>
  )
}

const QuickLinksHomeSection = (props: HomeSectionProps): JSX.Element => {
  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
        gap: '10px',
        bg: '$thNavMenuFooter',
        py: '20px',
        px: '20px',
        borderRadius: '5px',
      }}
    >
      <SpanBox
        css={{
          fontFamily: '$inter',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          color: '$ctaBlue',
          bg: '#007AFF10',
          px: '10px',
          py: '5px',
          borderRadius: '5px',
        }}
      >
        {props.homeSection.title}
      </SpanBox>

      <Pagination
        items={props.homeSection.items}
        itemsPerPage={8}
        render={(homeItem) => (
          <QuickLinkHomeItemView key={homeItem.id} homeItem={homeItem} />
        )}
      />
    </VStack>
  )
}

const HiddenHomeSection = (props: HomeSectionProps): JSX.Element => {
  const [isHidden, setIsHidden] = useState(true)
  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
        gap: '20px',
        marginBottom: '40px',
      }}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{
          gap: '10px',
          cursor: 'pointer',
        }}
        onClick={() => setIsHidden(!isHidden)}
      >
        <SpanBox
          css={{
            fontFamily: '$inter',
            fontSize: '16px',
            fontWeight: '600',
            color: '$homeTextTitle',
          }}
        >
          {props.homeSection.title}
        </SpanBox>
        <SpanBox
          css={{
            fontFamily: '$inter',
            fontSize: '13px',
            color: '$readerFont',
          }}
        >
          {isHidden ? 'Show' : 'Hide'}
        </SpanBox>
      </HStack>

      {isHidden ? <></> : <HiddenHomeSectionView />}
    </VStack>
  )
}

const HiddenHomeSectionView = (): JSX.Element => {
  const hiddenSectionData = useGetHiddenHomeSection()

  if (hiddenSectionData.error) {
    return <SpanBox>Error loading hidden section</SpanBox>
  }

  if (hiddenSectionData.isValidating) {
    return <SpanBox>Loading...</SpanBox>
  }

  if (!hiddenSectionData.section) {
    return <SpanBox>No hidden section data</SpanBox>
  }

  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
      }}
    >
      {hiddenSectionData.section.items.map((homeItem) => {
        return <QuickLinkHomeItemView key={homeItem.id} homeItem={homeItem} />
      })}
    </VStack>
  )
}

const CoverImage = styled('img', {
  objectFit: 'cover',
})

type HomeItemViewProps = {
  homeItem: HomeItem
  viewerUsername?: string | undefined
}

const TimeAgo = (props: HomeItemViewProps): JSX.Element => {
  return (
    <HStack
      distribution="start"
      alignment="center"
      css={{
        fontSize: '12px',
        fontWeight: 'medium',
        fontFamily: '$inter',
        color: '$homeTextSubtle',
      }}
    >
      {timeAgo(props.homeItem.date)}
    </HStack>
  )
}

const Title = (props: HomeItemViewProps): JSX.Element => {
  return (
    <HStack
      className="title-text"
      distribution="start"
      alignment="center"
      css={{
        fontSize: '16px',
        lineHeight: '20px',
        fontWeight: '600',
        fontFamily: '$inter',
        color: '$homeTextTitle',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-line-clamp': '3',
        '-webkit-box-orient': 'vertical',
        '&:title-text': {
          transition: 'text-decoration 0.3s ease',
        },
      }}
    >
      {props.homeItem.title}
    </HStack>
  )
}

const TitleSmall = (props: HomeItemViewProps): JSX.Element => {
  return (
    <HStack
      className="title-text"
      distribution="start"
      alignment="center"
      css={{
        fontSize: '13px',
        lineHeight: '26px',
        fontWeight: '500',
        fontFamily: '$inter',
        color: '$homeTextTitle',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-line-clamp': '3',
        '-webkit-box-orient': 'vertical',
      }}
    >
      {props.homeItem.title}
    </HStack>
  )
}

type PreviewContentProps = {
  previewContent?: string
  maxLines?: string
}

const PreviewContent = (props: PreviewContentProps): JSX.Element => {
  return (
    <SpanBox
      css={{
        fontFamily: '$inter',
        fontSize: '14px',
        lineHeight: '28px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-line-clamp': props.maxLines ?? '3',
        '-webkit-box-orient': 'vertical',
      }}
    >
      {props.previewContent ?? ''}
    </SpanBox>
  )
}

const JustAddedItemView = (props: HomeItemViewProps): JSX.Element => {
  const router = useRouter()

  return (
    <VStack
      css={{
        minWidth: '377px',
        gap: '5px',
        padding: '12px',
        cursor: 'pointer',
        bg: '$homeCardHover',
        borderRadius: '5px',
        '&:hover': {
          bg: '$homeCardHover',
        },
        '&:hover .title-text': {
          textDecoration: 'underline',
        },
      }}
      onClick={(event) => {
        const path = `/${props.viewerUsername ?? 'me'}/${props.homeItem.slug}`
        if (event.metaKey || event.ctrlKey) {
          window.open(path, '_blank')
        } else {
          router.push(path)
        }
      }}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ width: '100%', gap: '5px', lineHeight: '1' }}
      >
        <SourceInfo homeItem={props.homeItem} subtle={true} />
        <SpanBox css={{ ml: 'auto' }}>
          <TimeAgo homeItem={props.homeItem} />
        </SpanBox>
      </HStack>

      <TitleSmall homeItem={props.homeItem} />
    </VStack>
  )
}

const TopicPickHomeItemView = (props: HomeItemViewProps): JSX.Element => {
  const router = useRouter()

  return (
    <VStack
      css={{
        width: '100%',
        p: '0px',
        pt: '35px',
        cursor: 'pointer',
        borderRadius: '5px',
        '@mdDown': {
          borderRadius: '0px',
        },
        '&:hover': {
          bg: '$homeCardHover',
        },
        '&:hover .title-text': {
          textDecoration: 'underline',
        },
      }}
      onClick={(event) => {
        const path = `/${props.viewerUsername ?? 'me'}/${props.homeItem.slug}`
        if (event.metaKey || event.ctrlKey) {
          window.open(path, '_blank')
        } else {
          router.push(path)
        }
      }}
      alignment="start"
    >
      <HStack css={{ width: '100%', gap: '5px', px: '20px' }}>
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
      <SpanBox css={{ px: '20px' }}>
        <PreviewContent
          previewContent={props.homeItem.previewContent}
          maxLines="6"
        />
      </SpanBox>
      <HStack css={{ gap: '10px', my: '15px', px: '20px' }}>
        <Button style="homeAction">
          <AddToLibraryActionIcon
            color={theme.colors.homeActionIcons.toString()}
          />
        </Button>
        <Button style="homeAction">
          <CommentActionIcon color={theme.colors.homeActionIcons.toString()} />
        </Button>
        <Button style="homeAction">
          <ShareActionIcon color={theme.colors.homeActionIcons.toString()} />
        </Button>
        <Button style="homeAction">
          <ArchiveActionIcon color={theme.colors.homeActionIcons.toString()} />
        </Button>
        <Button style="homeAction">
          <RemoveActionIcon color={theme.colors.homeActionIcons.toString()} />
        </Button>
      </HStack>
      <Box
        css={{ mt: '15px', width: '100%', height: '1px', bg: '$homeDivider' }}
      />
    </VStack>
  )
}

const QuickLinkHomeItemView = (props: HomeItemViewProps): JSX.Element => {
  const router = useRouter()

  return (
    <VStack
      css={{
        mt: '10px',
        width: '100%',
        px: '10px',
        py: '10px',
        gap: '5px',
        borderRadius: '5px',
        '&:hover': {
          cursor: 'pointer',
        },
        '&:hover .title-text': {
          textDecoration: 'underline',
        },
      }}
      onClick={(event) => {
        const path = `/${props.viewerUsername ?? 'me'}/${props.homeItem.slug}`
        if (event.metaKey || event.ctrlKey) {
          window.open(path, '_blank')
        } else {
          router.push(path)
        }
      }}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ width: '100%', gap: '5px', lineHeight: '1' }}
      >
        <SourceInfo homeItem={props.homeItem} subtle={true} />

        <SpanBox css={{ ml: 'auto' }}>
          <TimeAgo homeItem={props.homeItem} />
        </SpanBox>
      </HStack>
      <Title homeItem={props.homeItem} />
      <PreviewContent
        previewContent={props.homeItem.previewContent}
        maxLines="2"
      />
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

type SourceInfoProps = {
  subtle?: boolean
}

const SourceInfo = (props: HomeItemViewProps & SourceInfoProps) => (
  <HoverCard.Root>
    <HoverCard.Trigger asChild>
      <HStack
        distribution="start"
        alignment="center"
        css={{ gap: '8px', cursor: 'pointer' }}
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
            fontFamily: '$inter',
            fontWeight: '500',
            fontSize: props.subtle ? '12px' : '13px',
            color: props.subtle ? '$homeTextSubtle' : '$homeTextSource',
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
          color: '$homeTextBody',
        }}
      >
        {subscription ? <>{subscription.description}</> : <></>}
      </SpanBox>
    </VStack>
  )
}
