import { Box } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'

type SkeletonArticleContainerProps = {
  margin?: number
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
  children?: React.ReactNode
}

export function SkeletonArticleContainer(
  props: SkeletonArticleContainerProps
): JSX.Element {
  const styles = {
    margin: props.margin ?? 360,
    fontSize: props.fontSize ?? 20,
    lineHeight: props.lineHeight ?? 150,
    fontFamily: props.fontFamily ?? 'inter',
    readerFontColor: theme.colors.readerFont.toString(),
    readerFontColorTransparent: theme.colors.readerFontTransparent.toString(),
    readerTableHeaderColor: theme.colors.readerTableHeader.toString(),
    readerHeadersColor: theme.colors.readerHeader.toString(),
  }

  return (
    <>
      <Box
        id="article-container"
        css={{
          width: '100%',
          height: '100vh',
          padding: '16px',
          maxWidth: '100%',
          background: theme.colors.grayBg.toString(),
          '--text-font-family': styles.fontFamily,
          '--text-font-size': `${styles.fontSize}px`,
          '--line-height': `${styles.lineHeight}%`,
          '--blockquote-padding': '0.5em 1em',
          '--blockquote-icon-font-size': '1.3rem',
          '--figure-margin': '1.6rem auto',
          '--hr-margin': '1em',
          '--font-color': styles.readerFontColor,
          '--font-color-transparent': styles.readerFontColorTransparent,
          '--table-header-color': styles.readerTableHeaderColor,
          '--headers-color': styles.readerHeadersColor,
          '@sm': {
            '--blockquote-padding': '1em 2em',
            '--blockquote-icon-font-size': '1.7rem',
            '--figure-margin': '2.6875rem auto',
            '--hr-margin': '2em',
            margin: `30px 0px`,
          },
          '@md': {
            maxWidth: 1024 - styles.margin,
          },
          '@lg': {
            margin: `30px 0`,
            maxWidth: 1024 - styles.margin,
          },
        }}
      >
        {props.children}
        {/* <Box css={{ width: '100%', height: '100%', textAlign: 'center', verticalAlign: 'middle' }}>
          Saving Page
        </Box> */}
      </Box>
    </>
  )
}
