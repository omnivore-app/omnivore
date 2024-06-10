import { LayoutType } from './HomeFeedContainer'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { LibraryItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Toaster } from 'react-hot-toast'
import TopBarProgress from 'react-topbar-progress-indicator'
import { StyledText } from '../../elements/StyledText'
import { Button } from '../../elements/Button'
import { ArchiveIcon } from '../../elements/icons/ArchiveIcon'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { BrowserIcon } from '../../elements/icons/BrowserIcon'
import { styled } from '@stitches/react'
import { siteName } from '../../patterns/LibraryCards/LibraryCardStyles'
import { theme } from '../../tokens/stitches.config'
import { DotsThree } from '@phosphor-icons/react'
import { useState } from 'react'

type TLDRLayoutProps = {
  layout: LayoutType
  viewer?: UserBasicData

  items: LibraryItem[]
  isValidating: boolean

  hasMore: boolean
  totalItems: number

  loadMore: () => void
}

const SiteIcon = styled('img', {
  width: '22px',
  height: '22px',
  borderRadius: '100px',
})

export function TLDRLayout(props: TLDRLayoutProps): JSX.Element {
  return (
    <>
      <VStack
        alignment="start"
        distribution="start"
        css={{
          mt: '30px',
          gap: '50px',
          height: '100%',
          minHeight: '100vh',
          px: '0px',
          width: '100%',
          maxWidth: '800px',
          '@mdDown': {
            p: '10px',
          },
        }}
      >
        <Toaster />

        {props.isValidating && props.items.length == 0 && <TopBarProgress />}

        {props.items.map((item) => {
          const sourceName = siteName(
            item.node.originalArticleUrl,
            item.node.url,
            item.node.siteName
          )
          const source =
            sourceName == item.node.author ? undefined : item.node.author

          return (
            <VStack key={`tldr-${item.node.id}`} css={{ gap: '10px' }}>
              <HStack
                alignment="center"
                distribution="start"
                css={{
                  gap: '5px',
                  width: '100%',
                  height: '25px',
                  pb: 'red',
                }}
              >
                <VStack
                  distribution="center"
                  alignment="center"
                  css={{
                    mr: '5px',
                    display: 'flex',
                    w: '22px',
                    h: '22px',
                    borderRadius: '100px',
                    bg: '$ctaBlue',
                    color: '$thTextSubtle',
                  }}
                >
                  <SiteIcon src={item.node.siteIcon} />
                </VStack>
                {source && (
                  <SpanBox
                    css={{
                      display: 'flex',
                      fontFamily: '$inter',
                      fontSize: '16px',
                      maxWidth: '150px',
                      maxLines: '1',
                      textOverflow: 'ellipsis',
                      '@mdDown': {
                        fontSize: '12px',
                      },
                    }}
                  >
                    {item.node.siteName}
                  </SpanBox>
                )}
                {source && item.node.author && (
                  <SpanBox
                    css={{
                      maxLines: '1',
                      display: 'flex',
                      fontFamily: '$inter',
                      maxWidth: '150px',
                      textOverflow: 'ellipsis',
                      '@mdDown': {
                        fontSize: '12px',
                      },
                    }}
                  >
                    •
                  </SpanBox>
                )}
                {item.node.author && (
                  <SpanBox
                    css={{
                      display: 'flex',
                      fontFamily: '$inter',
                      fontSize: '16px',
                      maxWidth: '120px',
                      maxLines: '1',
                      textOverflow: 'ellipsis',
                      '@mdDown': {
                        fontSize: '12px',
                      },
                    }}
                  >
                    {item.node.author}
                  </SpanBox>
                )}
                <SpanBox css={{ ml: 'auto' }}>
                  <DotsThree
                    size={20}
                    color={theme.colors.thTextSubtle.toString()}
                  />
                </SpanBox>
              </HStack>
              <HStack
                css={{
                  gap: '10px',
                }}
              >
                <VStack
                  alignment="start"
                  distribution="start"
                  css={{ gap: '10px' }}
                >
                  <SpanBox
                    css={{
                      fontFamily: '$inter',
                      fontWeight: '700',
                      fontSize: '20px',
                      wordBreak: 'break-all',
                      textDecoration: 'underline',
                      a: {
                        color: '$thTLDRText',
                      },
                    }}
                  >
                    <a href={``}>{item.node.title}</a>
                  </SpanBox>
                  <SpanBox
                    css={{
                      fontFamily: '$inter',
                      fontWeight: '500',
                      fontSize: '14px',
                      lineHeight: '30px',
                      color: '$thTLDRText',
                    }}
                  >
                    {item.node.aiSummary}
                  </SpanBox>
                  <HStack css={{ gap: '15px', pt: '5px' }}>
                    <ArchiveButton />
                    <RemoveButton />
                    <OpenOriginalButton />
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
          )
        })}

        <HStack
          distribution="center"
          css={{ width: '100%', mt: '$2', mb: '$4' }}
        >
          {props.hasMore ? (
            <Button
              style="ctaGray"
              css={{
                cursor: props.isValidating ? 'not-allowed' : 'pointer',
              }}
              onClick={props.loadMore}
              disabled={props.isValidating}
            >
              {props.isValidating ? 'Loading' : 'Load More'}
            </Button>
          ) : (
            <StyledText style="caption"></StyledText>
          )}
        </HStack>
      </VStack>
    </>
  )
}

const ArchiveButton = (): JSX.Element => {
  const [foreground, setForegroundColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )
  return (
    <Button
      title="Archive"
      style="tldr"
      css={{
        '&:hover': {
          bg: '$ctaBlue',
          opacity: 1.0,
        },
      }}
      onMouseEnter={(event) => {
        setForegroundColor('white')
        event.preventDefault()
      }}
      onMouseLeave={(event) => {
        setForegroundColor(theme.colors.thTextContrast2.toString())
        event.preventDefault()
      }}
      onClick={(e) => {
        // props.setShowConfirmDelete(true)
        e.preventDefault()
      }}
    >
      <ArchiveIcon size={20} color={foreground} />
    </Button>
  )
}

const RemoveButton = (): JSX.Element => {
  const [foreground, setForegroundColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )
  return (
    <Button
      title="Remove"
      style="tldr"
      css={{
        '&:hover': {
          bg: '$ctaBlue',
          opacity: 1.0,
        },
      }}
      onMouseEnter={(event) => {
        setForegroundColor('white')
        event.preventDefault()
      }}
      onMouseLeave={(event) => {
        setForegroundColor(theme.colors.thTextContrast2.toString())
        event.preventDefault()
      }}
      onClick={(e) => {
        // props.setShowConfirmDelete(true)
        e.preventDefault()
      }}
    >
      <TrashIcon size={20} color={foreground} />
    </Button>
  )
}

const OpenOriginalButton = (): JSX.Element => {
  const [foreground, setForegroundColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )
  return (
    <Button
      title="Open original"
      style="tldr"
      css={{
        '&:hover': {
          bg: '$ctaBlue',
          opacity: 1.0,
        },
      }}
      onMouseEnter={(event) => {
        setForegroundColor('white')
        event.preventDefault()
      }}
      onMouseLeave={(event) => {
        setForegroundColor(theme.colors.thTextContrast2.toString())
        event.preventDefault()
      }}
      onClick={(e) => {
        // props.setShowConfirmDelete(true)
        e.preventDefault()
      }}
    >
      <BrowserIcon size={20} color={foreground} />
    </Button>
  )
}
