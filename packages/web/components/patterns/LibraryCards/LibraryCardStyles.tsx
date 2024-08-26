import { LibraryItemNode } from '../../../lib/networking/library_items/useLibraryItems'
import { HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { RecommendedFlairIcon } from '../../elements/icons/RecommendedFlairIcon'
import { PinnedFlairIcon } from '../../elements/icons/PinnedFlairIcon'
import { FavoriteFlairIcon } from '../../elements/icons/FavoriteFlairIcon'
import { NewsletterFlairIcon } from '../../elements/icons/NewsletterFlairIcon'
import { FeedFlairIcon } from '../../elements/icons/FeedFlairIcon'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { timeAgo } from '../../../lib/textFormatting'

export const MenuStyle = {
  display: 'flex',
  marginLeft: 'auto',
  height: '30px',
  width: '30px',
  mt: '-5px',
  mr: '-5px',
  pt: '2px',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '1000px',
  '&:hover': {
    bg: '$thBackground4',
  },
}

export const MetaStyle = {
  width: '100%',
  color: '$thTextSubtle2',
  fontSize: '12px',
  fontWeight: '500',
  fontFamily: '$display',
  maxLines: 1,
  textOverflow: 'ellipsis',
  wordBreak: 'break-word',
  lineHeight: 1.25,
}

export const TitleStyle = {
  color: '$thTextContrast2',
  fontSize: '16px',
  fontWeight: '700',
  maxLines: 2,
  lineHeight: 1.5,
  fontFamily: '$display',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-word',
  display: '-webkit-box',
  '-webkit-line-clamp': '2',
  '-webkit-box-orient': 'vertical',
}

export const AuthorInfoStyle = {
  maxLines: '1',
  maxWidth: '240px',
  color: '$thNotebookSubtle',
  fontSize: '12px',
  fontWeight: '400',
  fontFamily: '$display',
  lineHeight: 1.25,
  wordWrap: 'break-word',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

export const FLAIR_ICON_NAMES = [
  'favorite',
  'pinned',
  'recommended',
  'newsletter',
  'feed',
  'rss',
]

const flairIconForLabel = (label: Label): JSX.Element | undefined => {
  switch (label.name.toLocaleLowerCase()) {
    case 'favorite':
      return (
        <FlairIcon title="Favorite">
          <FavoriteFlairIcon />
        </FlairIcon>
      )
    case 'pinned':
      return (
        <FlairIcon title="Pinned">
          <PinnedFlairIcon />
        </FlairIcon>
      )
    case 'recommended':
      return (
        <FlairIcon title="Recommended">
          <RecommendedFlairIcon />
        </FlairIcon>
      )
    case 'newsletter':
      return (
        <FlairIcon title="Newsletter">
          <NewsletterFlairIcon />
        </FlairIcon>
      )
    case 'rss':
    case 'feed':
      return (
        <FlairIcon title="Feed">
          <FeedFlairIcon />
        </FlairIcon>
      )
  }
  return undefined
}

type FlairIconProps = {
  title: string
  children: React.ReactNode
}

export function FlairIcon(props: FlairIconProps): JSX.Element {
  return (
    <SpanBox title={props.title} css={{ lineHeight: '1' }}>
      {props.children}
    </SpanBox>
  )
}

type LibraryItemMetadataProps = {
  item: LibraryItemNode
  showProgress?: boolean
}

export function LibraryItemMetadata(
  props: LibraryItemMetadataProps
): JSX.Element {
  const highlightCount = props.item.highlightsCount ?? 0

  return (
    <HStack css={{ gap: '5px', alignItems: 'center' }}>
      {props.item.labels?.map((label) => {
        return flairIconForLabel(label)
      })}
      {timeAgo(props.item.savedAt)}
      {` `}
      {props.item.wordsCount ?? 0 > 0
        ? `  • ${Math.max(
            1,
            Math.round((props.item.wordsCount ?? 0) / 235)
          )} min read`
        : null}
      {highlightCount > 0
        ? `  • ${highlightCount} highlight${highlightCount > 1 ? 's' : ''}`
        : null}
    </HStack>
  )
}

type CardCheckBoxProps = {
  isChecked: boolean
  handleChanged: () => void
}

export function CardCheckbox(props: CardCheckBoxProps): JSX.Element {
  return (
    <form
      // This prevents us from propogating up the the <a element on cards
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <input
        type="checkbox"
        checked={props.isChecked}
        onChange={(event) => {
          props.handleChanged()
          event.stopPropagation()
        }}
      ></input>
    </form>
  )
}
