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
import { LabelChip } from './../elements/LabelChip'

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

const siteName = (originalArticleUrl: string, itemUrl: string): string => {
  try {
    return new URL(originalArticleUrl).hostname
  } catch {}
  try {
    return new URL(itemUrl).hostname
  } catch {}
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
        position: 'relative',
      }}
      alignment="start"
      distribution="start"
      onClick={() => {
        props.handleAction('showDetail')
      }}
    >
      <Box
        css={{
          position: 'absolute',
          top: '1px',
          left: '1px',
          width: 'calc(100% - 2px)',
          '& > div': {
            borderRadius: '100vmax 100vmax 0 0',
          },
        }}
      >
        <ProgressBar
          fillPercentage={props.item.readingProgressPercent}
          fillColor={theme.colors.highlight.toString()}
          backgroundColor={theme.colors.grayTextContrast.toString()}
          borderRadius={
            props.item.readingProgressPercent === 100 ? '0' : '0px 8px 8px 0px'
          }
        />
      </Box>
      <VStack
        distribution="start"
        alignment="start"
        css={{
          px: '0px',
          width: '100%',
          pl: '$1',
        }}
      >
        <HStack
          alignment="start"
          distribution="between"
          css={{
            width: '100%',
            p: '0px',
            mr: '-12px',
            mt: '15px',
            display: 'grid',
            gridTemplateColumns: '1fr 24px',
            gridTemplateRows: '1fr',
          }}
        >
          <StyledText
            style="listTitle"
            css={{
              mt: '0',
              mb: '0',
              fontWeight: '700',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {props.item.title}
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
                  orientation="horizontal"
                />
              }
              actionHandler={props.handleAction}
            />
          </Box>
        </HStack>
        <HStack alignment="start" distribution="between">
          <StyledText style="caption" css={{ my: '0', mt: '-$2' }}>
            {props.item.author && (
              <SpanBox css={{ mr: '8px' }}>
                {authoredByText(props.item.author)}
              </SpanBox>
            )}
            <SpanBox css={{ textDecorationLine: 'underline' }}>
              {originText}
            </SpanBox>
          </StyledText>
        </HStack>
      </VStack>
      <HStack
        alignment="start"
        distribution="between"
        css={{
          width: '100%',
          pt: '$2',
          px: '$1',
          pr: '12px',
          mt: '7px',
          flexGrow: '1',
        }}
      >
        <StyledText
          css={{
            m: 0,
            py: '0px',
            mr: '$2',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '14px',
            lineHeight: '125%',
            color: '$grayTextContrast',
            flexGrow: '4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {props.item.description}
        </StyledText>
        {props.item.image && (
          <CoverImage
            src={props.item.image}
            alt="Link Preview Image"
            width={135}
            height={90}
            css={{ ml: '10px', mb: '8px', borderRadius: '3px' }}
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        )}
      </HStack>
      <HStack css={{ mt: '8px' }}>
        {props.item.labels?.map(({ description, color }, index) => (
          <LabelChip key={index} text={description || ''} color={color} />
        ))}
      </HStack>
    </VStack>
    // </Link>
  )
}

export function ListLinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  const originText = siteName(props.item.originalArticleUrl, props.item.url)

  return (
    // <Link href={`/${username}/${props.item.slug}`} passHref={true}>
    <HStack
      css={{
        p: '$3',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        borderRadius: 0,
        cursor: 'pointer',
        wordBreak: 'break-word',
        border: '1px solid $grayBorder',
        borderBottom: 'none',
        alignItems: 'center',
      }}
      onClick={() => {
        props.handleAction('showDetail')
      }}
    >
      <HStack
        distribution="start"
        alignment="end"
        css={{
          px: '$2',
          flexGrow: 1,
          pl: '0px',
        }}
      >
        <StyledText
          style="listTitle"
          css={{ mt: '0px', mb: '$1', textAlign: 'left', lineHeight: 'normal' }}
        >
          {props.item.title}
        </StyledText>
        {props.item.author && (
          <StyledText style="caption" css={{ my: '$1', ml: '8px' }}>
            {authoredByText(props.item.author)}
          </StyledText>
        )}
        <StyledText
          style="caption"
          css={{ my: '$1', ml: '8px', textDecorationLine: 'underline' }}
        >
          {originText}
        </StyledText>
      </HStack>
      <Box
        css={{
          width: '40px',
          height: '8px',
          mr: '$2',
          backgroundColor: '$grayBase',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '6px',
          border: '1px solid $grayBorder',
          px: '1px',
        }}
      >
        <ProgressBar
          fillPercentage={props.item.readingProgressPercent}
          fillColor={theme.colors.highlight.toString()}
          backgroundColor={theme.colors.grayTextContrast.toString()}
          borderRadius={'8px'}
        />
      </Box>
      <Box
        css={{
          alignSelf: 'end',
          alignItems: 'center',
          display: 'grid',
          placeItems: 'center',
        }}
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
              orientation="horizontal"
            />
          }
          actionHandler={props.handleAction}
        />
      </Box>
    </HStack>
    // </Link>
  )
}

type ProgressBarProps = {
  fillPercentage: number
  fillColor: string
  backgroundColor: string
  borderRadius: string
}

function ProgressBar(props: ProgressBarProps): JSX.Element {
  return (
    <Box
      css={{
        height: '4px',
        width: '100%',
        borderRadius: '$1',
        overflow: 'hidden',
      }}
    >
      <Box
        css={{
          height: '100%',
          width: `${props.fillPercentage}%`,
          backgroundColor: props.fillColor,
          borderRadius: props.borderRadius,
        }}
      />
    </Box>
  )
}
