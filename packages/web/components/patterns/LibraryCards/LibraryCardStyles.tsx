import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useMemo } from 'react'
import { LibraryItemNode } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { RecommendedFlairIcon } from '../../elements/icons/RecommendedFlairIcon'
import { PinnedFlairIcon } from '../../elements/icons/PinnedFlairIcon'
import { FavoriteFlairIcon } from '../../elements/icons/FavoriteFlairIcon'
import { NewsletterFlairIcon } from '../../elements/icons/NewsletterFlairIcon'
import { FeedFlairIcon } from '../../elements/icons/FeedFlairIcon'
import { Label } from '../../../lib/networking/fragments/labelFragment'

dayjs.extend(relativeTime)

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

export const timeAgo = (date: string | undefined): string => {
  if (!date) {
    return ''
  }
  return dayjs(date).fromNow()
}

const shouldHideUrl = (url: string): boolean => {
  try {
    const origin = new URL(url).origin
    const hideHosts = ['https://storage.googleapis.com', 'https://omnivore.app']
    if (hideHosts.indexOf(origin) != -1) {
      return true
    }
  } catch {
    console.log('invalid url item', url)
  }
  return false
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
        <SpanBox title="Favorite">
          <FavoriteFlairIcon />
        </SpanBox>
      )
    case 'pinned':
      return (
        <SpanBox title="Pinned">
          <PinnedFlairIcon />
        </SpanBox>
      )
    case 'recommended':
      return (
        <SpanBox title="Recommended">
          <RecommendedFlairIcon />
        </SpanBox>
      )
    case 'newsletter':
      return (
        <SpanBox title="Newsletter">
          <NewsletterFlairIcon />
        </SpanBox>
      )
    case 'rss':
    case 'feed':
      return (
        <SpanBox title="Feed">
          <FeedFlairIcon />
        </SpanBox>
      )
  }
  return undefined
}

export const siteName = (
  originalArticleUrl: string,
  itemUrl: string,
  siteName?: string
): string => {
  if (siteName) {
    return siteName
  }

  if (shouldHideUrl(originalArticleUrl)) {
    return ''
  }
  try {
    return new URL(originalArticleUrl).hostname.replace(/^www\./, '')
  } catch {}
  try {
    return new URL(itemUrl).hostname.replace(/^www\./, '')
  } catch {}
  return ''
}

type LibraryItemMetadataProps = {
  item: LibraryItemNode
  showProgress?: boolean
}

export function LibraryItemMetadata(
  props: LibraryItemMetadataProps
): JSX.Element {
  const highlightCount = useMemo(() => {
    return (
      props.item.highlights?.filter((h) => h.type == 'HIGHLIGHT').length ?? 0
    )
  }, [props.item.highlights])

  return (
    <HStack css={{ gap: '5px' }}>
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
