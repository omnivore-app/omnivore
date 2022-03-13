import { Box, VStack, HStack, SpanBox } from './../elements/LayoutPrimitives'
import type { LibraryItemNode } from '../../lib/networking/queries/useGetLibraryItemsQuery'
import { CoverImage } from './../elements/CoverImage'
import { StyledText } from './../elements/StyledText'
import { authoredByText } from './../patterns/ArticleSubtitle'
import { MoreOptionsIcon } from './../elements/images/MoreOptionsIcon'
import { theme } from './../tokens/stitches.config'
import { CardMenu } from './../patterns/CardMenu'
import { LayoutType } from '../templates/homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'

export type LinkedItemCardAction =
  | 'showDetail'
  | 'showOriginal'
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'mark-read'
  | 'mark-unread'
  | 'share'
  | 'snooze'

type LinkedItemCardProps = {
  item: LibraryItemNode
  layout: LayoutType
  viewer: UserBasicData
  handleAction: (action: LinkedItemCardAction) => void
}

const siteName = (originalArticleUrl: string,  itemUrl: string): string => {
  try {
    return new URL(originalArticleUrl).hostname
  } catch { }
  try {
    return new URL(itemUrl).hostname
  } catch { }
  return ''
}

export function LinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  if (props.layout == 'LIST_LAYOUT') {
    return <ListLinkedItemCard {...props} />
  } else {
    return <GridLinkedItemCard {...props} />
  }
}

export function GridLinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  const originText = siteName(props.item.originalArticleUrl, props.item.url)

  return (
    // <Link href={`/${username}/${props.item.slug}`} passHref={true}>
      <VStack
        css={{
          p: '$2',
          pr: '8px',
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          borderRadius: '6px',
          cursor: 'pointer',
          wordBreak: 'break-word',
          overflow: 'clip',
          border: '1px solid $grayBorder',
          boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
        }}
        alignment='start'
        distribution='start'
        onClick={() => {
          props.handleAction('showDetail')
        }}
      >
        <VStack
          distribution="start"
          alignment="start"
          css={{
            px: '0px',
            width: '100%',
            pl: '$1',
          }}
        >
          <HStack alignment='start' distribution='between' css={{ width: '100%', p: '0px', mr: '-12px' }}>
            <StyledText style="caption" css={{ my: '$1' }}>
              {originText}
            </StyledText>
            <Box
              css={{ alignSelf: 'end', alignItems: 'start', height: '100%' }}
              onClick={(e) => {
                // This is here to prevent menu click events from bubbling
                // up and causing us to "click" on the link item.
                e.stopPropagation()
              }}
            >
              <CardMenu
                item={props.item}
                viewer={props.viewer}
                triggerElement={
                  <MoreOptionsIcon
                    size={24}
                    strokeColor={theme.colors.grayTextContrast.toString()}
                    orientation="vertical"
                  />
                }
                actionHandler={props.handleAction}
              />
            </Box>
          </HStack>
          <StyledText
            style="listTitle"
            css={{ mt: '0px', mb: '$1', textAlign: 'left', pr: '24px' }}
          >
            {props.item.title}
          </StyledText>
        </VStack>
        <HStack alignment='start' distribution='between' css={{
          width: '100%',
          pt: '$2',
          px: '$1',
          pr: '12px',
          flexGrow: '1',
        }}>
          <StyledText
            style="caption"
            css={{
              m: 0,
              py: '0px',
              flexGrow: '4',
            }}
          >
            {props.item.author && (
              <SpanBox css={{ my: '$1' }}>
                {authoredByText(props.item.author)}
                {props.item.description ? ' \u2013 ' : ''}
              </SpanBox>
            )}
            {props.item.description?.substring(0, 300)}
          </StyledText>
          {props.item.image && (
            <CoverImage
              src={props.item.image}
              alt="Link Preview Image"
              width={88}
              height={88}
              css={{ ml: '8px', mb: '8px', mt: '8px' }}
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          )}
        </HStack>
        <ProgressBar
          fillPercentage={props.item.readingProgressPercent}
          fillColor={theme.colors.highlight.toString()}
          backgroundColor={theme.colors.grayTextContrast.toString()}
        />
      </VStack>
    // </Link>
  )
}

export function ListLinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  const originText = siteName(props.item.originalArticleUrl, props.item.url)

  return (
    // <Link href={`/${username}/${props.item.slug}`} passHref={true}>
      <VStack
        css={{
          p: '$2',
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          borderRadius: 0,
          cursor: 'pointer',
          wordBreak: 'break-word',
          borderTop: '1px solid $grayBorder',
          boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
        }}
        onClick={() => {
          props.handleAction('showDetail')
        }}
      >
        <HStack
          distribution="start"
          alignment="start"
          css={{ width: '100%', justifySelf: 'start' }}
        >
          <VStack
            distribution="start"
            alignment="start"
            css={{
              px: '$2',
              flexGrow: 1,
              pl: '0px',
            }}
          >
            <StyledText
              style="listTitle"
              css={{ mt: '0px', mb: '$1', textAlign: 'left' }}
            >
              {props.item.title}
            </StyledText>
            {props.item.author && (
              <StyledText style="caption" css={{ my: '$1' }}>
                {authoredByText(props.item.author)}
              </StyledText>
            )}
            <StyledText style="caption" css={{ my: '$1' }}>
              {originText}
            </StyledText>
          </VStack>
          <Box
            css={{ alignSelf: 'end', alignItems: 'start', height: '100%' }}
            onClick={(e) => {
              // This is here to prevent menu click events from bubbling
              // up and causing us to "click" on the link item.
              e.stopPropagation()
            }}
          >
            <CardMenu
              item={props.item}
              viewer={props.viewer}
              triggerElement={
                <MoreOptionsIcon
                  size={24}
                  strokeColor={theme.colors.grayTextContrast.toString()}
                  orientation="vertical"
                />
              }
              actionHandler={props.handleAction}
            />
          </Box>
        </HStack>
        <ProgressBar
          fillPercentage={props.item.readingProgressPercent}
          fillColor={theme.colors.highlight.toString()}
          backgroundColor={theme.colors.grayTextContrast.toString()}
        />
      </VStack>
    // </Link>
  )
}

type ProgressBarProps = {
  fillPercentage: number
  fillColor: string
  backgroundColor: string
}

function ProgressBar(props: ProgressBarProps): JSX.Element {
  return (
    <Box
      css={{
        height: '4px',
        width: '100%',
        borderRadius: '$1',
        backgroundColor: props.backgroundColor,
        overflow: 'hidden',
        mt: '$1',
      }}
    >
      <Box
        css={{
          height: '100%',
          width: `${props.fillPercentage}%`,
          backgroundColor: props.fillColor,
        }}
      />
    </Box>
  )
}
