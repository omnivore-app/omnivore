import { Box, StyledLink } from './../elements/LayoutPrimitives'
import { StyledText } from './../../components/elements/StyledText'
import { formattedLongDate } from './../../lib/dateFormatting'
import { ReadableItem } from '../../lib/networking/queries/useGetLibraryItemsQuery'
import { siteName } from './LibraryCards/LibraryCardStyles'

type SubtitleStyle = 'footnote' | 'shareSubtitle'

type ArticleSubtitleProps = {
  item: ReadableItem
  author?: string
  style?: SubtitleStyle
}

export function ArticleSubtitle(props: ArticleSubtitleProps): JSX.Element {
  const textStyle = props.style || 'footnote'
  const subtitle = articleSubtitle(props.item, props.author)

  return (
    <Box>
      <StyledText style={textStyle} css={{ wordBreak: 'break-word' }}>
        {subtitle} {subtitle && <span style={{ bottom: 1 }}>• </span>}{' '}
        {props.item.originalArticleUrl &&
          !shouldHideUrl(props.item.originalArticleUrl) && (
            <>
              <StyledLink
                href={props.item.originalArticleUrl}
                target="_blank"
                rel="noreferrer"
                css={{
                  textDecoration: 'underline',
                  color: '$grayTextContrast',
                }}
              >
                See original
              </StyledLink>
            </>
          )}
      </StyledText>
    </Box>
  )
}

type ReaderSavedInfoProps = {
  wordsCount?: number
  rawDisplayDate: string
}

export function ReaderSavedInfo(props: ReaderSavedInfoProps): JSX.Element {
  return (
    <Box>
      <StyledText
        css={{
          wordBreak: 'break-word',
          fontSize: '15',
          color: '$thTextSubtle2',
          fontFamily: '$inter',
        }}
      >
        {formattedLongDate(props.rawDisplayDate)}{' '}
        {props.wordsCount ?? 0 > 0
          ? `  • ${Math.max(
              1,
              Math.round((props.wordsCount ?? 0) / 235)
            )} min read`
          : null}
      </StyledText>
    </Box>
  )
}

function shouldHideUrl(url: string): boolean {
  const origin = new URL(url).origin
  const hideHosts = ['https://storage.googleapis.com', 'https://omnivore.app']
  if (hideHosts.indexOf(origin) != -1) {
    return true
  }
  return false
}

function articleSubtitle(
  item: ReadableItem,
  author?: string
): string | undefined {
  const origin = new URL(item.originalArticleUrl).origin
  const hideUrl = shouldHideUrl(item.originalArticleUrl)
  if (author) {
    const auth = `${authoredByText(author)}`
    return hideUrl ? auth : `${auth}, ${siteName(item)}`
  } else {
    if (hideUrl) {
      return undefined
    }
    return origin
  }
}

export function authoredByText(author: string): string {
  return `by ${removeHTMLTags(author)}`
}

export function removeHTMLTags(str: string | null | undefined): string {
  if (typeof str === 'string') {
    return str.replace(/(<([^>]+)>)/gi, '')
  } else {
    return ''
  }
}
