import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Article } from './../../../components/templates/article/Article'
import { Box, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import { StyledText } from './../../elements/StyledText'
import { ArticleSubtitle } from './../../patterns/ArticleSubtitle'
import { theme, ThemeId } from './../../tokens/stitches.config'
import { HighlightsLayer } from '../../templates/article/HighlightsLayer'
import { Button } from '../../elements/Button'
import { MutableRefObject, useEffect, useState } from 'react'
import { ReportIssuesModal } from './ReportIssuesModal'
import { reportIssueMutation } from '../../../lib/networking/mutations/reportIssueMutation'
import { ArticleHeaderToolbar } from './ArticleHeaderToolbar'
import { userPersonalizationMutation } from '../../../lib/networking/mutations/userPersonalizationMutation'
import { updateThemeLocally } from '../../../lib/themeUpdater'
import { ArticleMutations } from '../../../lib/articleActions'
import { LabelChip } from '../../elements/LabelChip'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { HighlightsModal } from './HighlightsModal'

type ArticleContainerProps = {
  article: ArticleAttributes
  labels: Label[]
  articleMutations: ArticleMutations
  scrollElementRef: MutableRefObject<HTMLDivElement | null>
  isAppleAppEmbed: boolean
  highlightBarDisabled: boolean
  highlightsBaseURL: string
  margin?: number
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
  showHighlightsModal: boolean
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
}

export function ArticleContainer(props: ArticleContainerProps): JSX.Element {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportIssuesModal, setShowReportIssuesModal] = useState(false)
  const [showHighlightsModal, setShowHighlightsModal] = useState(props.showHighlightsModal)
  const [fontSize, setFontSize] = useState(props.fontSize ?? 20)

  const updateFontSize = async (newFontSize: number) => {
    if (fontSize !== newFontSize) {
      setFontSize(newFontSize)
      await userPersonalizationMutation({ fontSize: newFontSize })
    }
  }

  useEffect(() => {
    updateFontSize(props.fontSize ?? 20)
  }, [props.fontSize])

  // Listen for font size and color mode change events sent from host apps (ios, macos...)
  useEffect(() => {
    const increaseFontSize = async () => {
      await updateFontSize(Math.min(fontSize + 2, 28))
    }

    const decreaseFontSize = async () => {
      await updateFontSize(Math.max(fontSize - 2, 10))
    }

    const switchToDarkMode = () => {
      updateThemeLocally(ThemeId.Dark)
    }

    const switchToLightMode = () => {
      updateThemeLocally(ThemeId.Light)
    }

    document.addEventListener('increaseFontSize', increaseFontSize)
    document.addEventListener('decreaseFontSize', decreaseFontSize)
    document.addEventListener('switchToDarkMode', switchToDarkMode)
    document.addEventListener('switchToLightMode', switchToLightMode)

    return () => {
      document.removeEventListener('increaseFontSize', increaseFontSize)
      document.removeEventListener('decreaseFontSize', decreaseFontSize)
      document.removeEventListener('switchToDarkMode', switchToDarkMode)
      document.removeEventListener('switchToLightMode', switchToLightMode)
    }
  })

  useEffect(() => {
    window.analytics?.track('link_read', {
      link: props.article.id,
      slug: props.article.slug,
      url: props.article.originalArticleUrl,
    })
  }, [props.article])

  const styles = {
    fontSize,
    margin: props.margin ?? 360,
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
          padding: '16px',
          maxWidth: '100%',
          background: props.isAppleAppEmbed ? 'unset' : theme.colors.grayBg.toString(),
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
            maxWidth: 1024 - (styles.margin),
          },
          '@lg': {
            margin: `30px 0`,
            width: 'auto',
            maxWidth: 1024 - (styles.margin),
          },
        }}
      >
        <VStack alignment="start" distribution="start">
          <StyledText
            style="boldHeadline"
            css={{ fontFamily: styles.fontFamily }}
          >
            {props.article.title}
          </StyledText>
          <ArticleSubtitle
            rawDisplayDate={
              props.article.publishedAt ?? props.article.createdAt
            }
            author={props.article.author}
            href={props.article.url}
          />
          {props.labels ? (
            <SpanBox css={{ pb: '16px', width: '100%', '&:empty': { display: 'none' } }}>
              {props.labels?.map((label) =>
                <LabelChip key={label.id} text={label.name} color={label.color} />
              )}
            </SpanBox>
          ) : null}
          {props.isAppleAppEmbed && (
            <ArticleHeaderToolbar
              articleTitle={props.article.title}
              articleShareURL={props.highlightsBaseURL}
              setShowShareArticleModal={setShowShareModal}
              setShowHighlightsModal={props.setShowHighlightsModal}
              hasHighlights={props.article.highlights?.length > 0}
            />
          )}
        </VStack>
        <Article
          articleId={props.article.id}
          content={props.article.content}
          initialAnchorIndex={props.article.readingProgressAnchorIndex}
          scrollElementRef={props.scrollElementRef}
          articleMutations={props.articleMutations}
        />
        <Button
          style="ghost"
          css={{
            p: 0,
            my: '$4',
            color: '$error',
            fontSize: '$1',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          onClick={() => setShowReportIssuesModal(true)}
        >
          Report issues with this page -{'>'}
        </Button>
        <Box css={{ height: '100px' }} />
      </Box>
      <HighlightsLayer
        highlights={props.article.highlights}
        articleTitle={props.article.title}
        articleAuthor={props.article.author ?? ''}
        articleId={props.article.id}
        isAppleAppEmbed={props.isAppleAppEmbed}
        highlightsBaseURL={props.highlightsBaseURL}
        highlightBarDisabled={props.highlightBarDisabled}
        showHighlightsModal={props.showHighlightsModal}
        setShowHighlightsModal={props.setShowHighlightsModal}
        articleMutations={props.articleMutations}
      />
      {showReportIssuesModal ? (
        <ReportIssuesModal
          onCommit={(comment: string) => {
            reportIssueMutation({
              pageId: props.article.id,
              itemUrl: props.article.url,
              reportTypes: ['CONTENT_DISPLAY'],
              reportComment: comment,
            })
          }}
          onOpenChange={(open: boolean) => setShowReportIssuesModal(open)}
        />
      ) : null}
      {/* {showShareModal && (
        <ShareArticleModal
          url={`${webBaseURL}/${props.viewerUsername}/${props.article.slug}/highlights?r=true`}
          title={props.article.title}
          imageURL={props.article.image}
          author={props.article.author}
          publishedAt={props.article.publishedAt ?? props.article.createdAt}
          description={props.article.description}
          originalArticleUrl={props.article.originalArticleUrl}
          onOpenChange={(open: boolean) => setShowShareModal(open)}
        />
      )} */}
    </>
  )
}
