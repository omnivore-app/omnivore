import { Box, StyledLink } from './../elements/LayoutPrimitives'
import { StyledText } from './../../components/elements/StyledText'
import { formattedLongDate } from './../../lib/dateFormatting'
import { shouldHideUrl } from '../../lib/textFormatting'

type SubtitleStyle = 'footnote' | 'shareSubtitle'

type ArticleSubtitleProps = {
  href: string
  author?: string
  style?: SubtitleStyle
  hideButton?: boolean
}

export function ArticleSubtitle(props: ArticleSubtitleProps): JSX.Element {
  const textStyle = props.style || 'footnote'
  const subtitle = articleSubtitle(props.href, props.author)

  return (
    <Box>
      <StyledText style={textStyle} css={{ wordBreak: 'break-word' }}>
        {subtitle}{' '}
        {subtitle && !shouldHideUrl(props.href) && (
          <span style={{ bottom: 1 }}>• </span>
        )}{' '}
        {!props.hideButton && !shouldHideUrl(props.href) && (
          <>
            <StyledLink
              href={props.href}
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

function articleSubtitle(url: string, author?: string): string | undefined {
  const origin = new URL(url).origin
  const hideUrl = shouldHideUrl(url)
  if (author) {
    const auth = `${authoredByText(author)}`
    return hideUrl ? auth : `${auth}, ${new URL(url).hostname}`
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
