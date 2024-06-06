import * as HoverCard from '@radix-ui/react-hover-card'
import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '../../components/elements/Button'
import { AddToLibraryActionIcon } from '../../components/elements/icons/home/AddToLibraryActionIcon'
import { ArchiveActionIcon } from '../../components/elements/icons/home/ArchiveActionIcon'
import { CommentActionIcon } from '../../components/elements/icons/home/CommentActionIcon'
import { RemoveActionIcon } from '../../components/elements/icons/home/RemoveActionIcon'
import { ShareActionIcon } from '../../components/elements/icons/home/ShareActionIcon'
import Pagination from '../../components/elements/Pagination'
import { timeAgo } from '../../components/patterns/LibraryCards/LibraryCardStyles'
import { theme } from '../../components/tokens/stitches.config'
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
import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from './../../components/elements/LayoutPrimitives'
import { List, ThumbsDown, ThumbsUp } from 'phosphor-react'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { Toaster } from 'react-hot-toast'
import { DEFAULT_HEADER_HEIGHT } from '../../components/templates/homeFeed/HeaderSpacer'
import { NavigationMenu } from '../../components/templates/navMenu/NavigationMenu'

export default function Home(): JSX.Element {
  const [showLeftMenu, setShowLeftMenu] = useState(false)
  const homeData = useGetHomeItems()
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
      <Toaster />
      <Header
        toggleMenu={() => {
          setShowLeftMenu(!showLeftMenu)
        }}
      />
      {showLeftMenu && (
        <NavigationMenu
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          setShowAddLinkModal={() => {}}
          searchTerm={''}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          applySearchQuery={(searchQuery: string) => {}}
          showFilterMenu={showLeftMenu}
          setShowFilterMenu={(show) => {
            setShowLeftMenu(show)
          }}
        />
      )}
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
          if (homeSection.items.length < 1) {
            return <></>
          }
          switch (homeSection.layout) {
            case 'just_added':
              return (
                <JustAddedHomeSection
                  key={`section-${idx}`}
                  homeSection={homeSection}
                />
              )
            case 'top_picks':
              return (
                <TopPicksHomeSection
                  key={`section-${idx}`}
                  homeSection={homeSection}
                />
              )
            case 'quick_links':
              return (
                <QuickLinksHomeSection
                  key={`section-${idx}`}
                  homeSection={homeSection}
                />
              )
            case 'hidden':
              return (
                <HiddenHomeSection
                  key={`section-${idx}`}
                  homeSection={homeSection}
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
}

const JustAddedHomeSection = (props: HomeSectionProps): JSX.Element => {
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
          color: '$readerText',
        }}
      >
        {props.homeSection.title}
      </SpanBox>

      {props.homeSection.items.map((homeItem) => {
        return <JustAddedItemView key={homeItem.id} homeItem={homeItem} />
      })}
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
          color: '$readerText',
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
        gap: '20px',
        bg: '#3D3D3D',
        py: '30px',
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
            color: '$readerText',
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
        color: '$readerTextSubtle',
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
        width: '100%',
        padding: '5px',
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

        borderRadius: '5px',
        '&:hover': {
          bg: '#323232',
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
          <AddToLibraryActionIcon />
        </Button>
        <Button style="homeAction">
          <CommentActionIcon />
        </Button>
        <Button style="homeAction">
          <ShareActionIcon />
        </Button>
        <Button style="homeAction">
          <ArchiveActionIcon />
        </Button>
        <Button style="homeAction">
          <RemoveActionIcon />
        </Button>
      </HStack>
      <Box css={{ mt: '15px', width: '100%', height: '1px', bg: '#3D3D3D' }} />
    </VStack>
  )
}

const QuickLinkHomeItemView = (props: HomeItemViewProps): JSX.Element => {
  const router = useRouter()

  return (
    <VStack
      css={{
        width: '100%',
        px: '10px',
        py: '10px',
        gap: '2px',
        borderRadius: '5px',
        '&:hover': {
          bg: '$readerBg',
          cursor: 'pointer',
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
      <TimeAgo homeItem={props.homeItem} />
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

// const SiteSourceHoverContent = (
//   props: SourceHoverContentProps
// ): JSX.Element => {
//   const sendHomeFeedback = useCallback(
//     async (feedbackType: SendHomeFeedbackType) => {
//       const feedback: SendHomeFeedbackInput = {
//         feedbackType,
//       }
//       feedback.site = props.source.name
//       const result = await sendHomeFeedbackMutation(feedback)
//       if (result) {
//         showSuccessToast('Feedback sent')
//       } else {
//         showErrorToast('Error sending feedback')
//       }
//     },
//     [props]
//   )

//   return (
//     <VStack
//       alignment="start"
//       distribution="start"
//       css={{
//         width: '240px',
//         height: '100px',
//         bg: '$thBackground2',
//         borderRadius: '10px',
//         padding: '15px',
//         gap: '10px',
//         boxShadow: theme.shadows.cardBoxShadow.toString(),
//       }}
//     >
//       <HStack
//         distribution="start"
//         alignment="center"
//         css={{ width: '100%', gap: '10px' }}
//       >
//         {props.source.icon && (
//           <SiteIcon
//             src={props.source.icon}
//             alt={props.source.name}
//             size="large"
//           />
//         )}
//         <SpanBox
//           css={{
//             fontFamily: '$inter',
//             fontWeight: '500',
//             fontSize: '14px',
//           }}
//         >
//           {props.source.name}
//         </SpanBox>
//       </HStack>
//       {/* <SpanBox
//         css={{
//           fontFamily: '$inter',
//           fontSize: '13px',
//           color: '$thTextSubtle4',
//         }}
//       >
//         {subscription ? <>{subscription.description}</> : <></>}
//       </SpanBox> */}
//       <FeedbackView sendFeedback={sendHomeFeedback} />
//     </VStack>
//   )
// }

// type FeedbackViewProps = {
//   sendFeedback: (type: SendHomeFeedbackType) => void
// }

// const FeedbackView = (props: FeedbackViewProps): JSX.Element => {
//   return (
//     <HStack css={{ ml: 'auto', mt: 'auto', gap: '5px' }}>
//       <Button
//         style="plainIcon"
//         onClick={(event) => {
//           props.sendFeedback('MORE')
//           event.preventDefault()
//           event.stopPropagation()
//         }}
//       >
//         <ThumbsUp weight="fill" />
//       </Button>
//       <Button
//         style="plainIcon"
//         onClick={(event) => {
//           props.sendFeedback('LESS')
//           event.preventDefault()
//           event.stopPropagation()
//         }}
//       >
//         <ThumbsDown weight="fill" />
//       </Button>
//     </HStack>
//   )
// }

type HeaderProps = {
  toggleMenu: () => void
}

const Header = (props: HeaderProps): JSX.Element => {
  const small = false

  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{
        zIndex: 5,
        position: 'fixed',
        left: '15px',
        top: '15px',
        height: small ? '60px' : DEFAULT_HEADER_HEIGHT,
        transition: 'height 0.5s',
        '@lgDown': { px: '20px' },
        '@mdDown': {
          px: '10px',
          left: '0px',
          right: '0',
        },
      }}
    >
      <VStack alignment="center" distribution="center">
        <Button
          style="plainIcon"
          onClick={(event) => {
            props.toggleMenu()
            event.preventDefault()
          }}
        >
          <List size="25" color={theme.colors.readerTextSubtle.toString()} />
        </Button>
      </VStack>
    </VStack>
  )
}
