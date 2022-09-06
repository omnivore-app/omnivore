import { Box, StyledLink } from './../elements/LayoutPrimitives'
import { StyledText } from './../../components/elements/StyledText'
import { formattedLongDate } from './../../lib/dateFormatting'

type SubtitleStyle = 'footnote' | 'shareSubtitle'

type ArticleSubtitleProps = {
  rawDisplayDate: string
  href: string
  author?: string
  style?: SubtitleStyle
  hideButton?: boolean
}

export function ArticleSubtitle(props: ArticleSubtitleProps): JSX.Element {
  const textStyle = props.style || 'footnote'

  return (
    <Box>
      <StyledText style={textStyle} css={{ wordBreak: 'break-word' }}>
        {articleSubtitle(props.href, props.author)}{' '}
        <span style={{ position: 'relative', bottom: 1 }}>• </span>{' '}
        {formattedLongDate(props.rawDisplayDate)}{' '}
        {!props.hideButton && (
          <>
            <span style={{ position: 'relative', bottom: 1 }}>• </span>{' '}
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

function articleSubtitle(url: string, author?: string): string {
  if (author) {
    return `${authoredByText(author)}, ${new URL(url).hostname}`
  } else {
    return new URL(url).origin
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
