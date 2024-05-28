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
  HomeSection,
  stubHomeItems,
  useGetHomeItems,
} from '../../lib/networking/queries/useGetHome'
import { timeAgo } from '../../components/patterns/LibraryCards/LibraryCardStyles'
import { theme } from '../../components/tokens/stitches.config'

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
  return (
    <VStack
      css={{
        width: '100%',
        padding: '20px',
        borderRadius: '5px',
        '&:hover': {
          bg: '$thBackground',
        },
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
        <SiteIconSmall
          className="Image normal"
          src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
          alt={props.homeItem.source.name}
        />
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
            <SiteIconLarge
              className="Image normal"
              src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
              alt={props.homeItem.source.name}
            />
            <SpanBox
              css={{
                fontFamily: '$inter',
                fontWeight: '500',
                fontSize: '14px',
              }}
            >
              {props.homeItem.source.name}
            </SpanBox>
            <SpanBox css={{ ml: 'auto' }}>
              <Button style="ctaBlue">+ Follow</Button>
            </SpanBox>
          </HStack>
          <SpanBox
            css={{
              fontFamily: '$inter',
              fontSize: '13px',
              color: '$thTextSubtle4',
            }}
          >
            The description of the newsletter or RSS feed, this would lazy load.
          </SpanBox>
        </VStack>
        <HoverCard.Arrow fill={theme.colors.thBackground2.toString()} />
      </HoverCard.Content>
    </HoverCard.Portal>
  </HoverCard.Root>
)
