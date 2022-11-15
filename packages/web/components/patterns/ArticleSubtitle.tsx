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
  const subtitle = articleSubtitle(props.href, props.author)

  return (
    <Box>
      <StyledText style={textStyle} css={{ wordBreak: 'break-word' }}>
        {subtitle}{' '}
        {subtitle && (<span style={{ position: 'relative', bottom: 1 }}>• </span>)}{' '}
        {formattedLongDate(props.rawDisplayDate)}{' '}
        {!props.hideButton && !shouldHideUrl(props.href) && (
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

function shouldHideUrl(url: string): boolean {
  const origin = new URL(url).origin
  const hideHosts = ['https://storage.googleapis.com', 'https://omnivore.app']
  if (hideHosts.indexOf(origin) != -1) {
    return true
  }
  return false
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
