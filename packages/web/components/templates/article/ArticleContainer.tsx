import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Article } from './../../../components/templates/article/Article'
import { Box, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import { StyledText } from './../../elements/StyledText'
import { ArticleSubtitle } from './../../patterns/ArticleSubtitle'
import { theme, ThemeId } from './../../tokens/stitches.config'
import { HighlightsLayer } from '../../templates/article/HighlightsLayer'
import { Button } from '../../elements/Button'
import { MutableRefObject, useEffect, useState, useRef } from 'react'
import { ReportIssuesModal } from './ReportIssuesModal'
import { reportIssueMutation } from '../../../lib/networking/mutations/reportIssueMutation'
import { ArticleHeaderToolbar } from './ArticleHeaderToolbar'
import { userPersonalizationMutation } from '../../../lib/networking/mutations/userPersonalizationMutation'
import { currentThemeName, updateTheme, updateThemeLocally } from '../../../lib/themeUpdater'
import { ArticleMutations } from '../../../lib/articleActions'
import { LabelChip } from '../../elements/LabelChip'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import {
  HighlightLocation,
  makeHighlightStartEndOffset,
} from '../../../lib/highlights/highlightGenerator'

type ArticleContainerProps = {
  article: ArticleAttributes
  labels: Label[]
  articleMutations: ArticleMutations
  isAppleAppEmbed: boolean
  highlightBarDisabled: boolean
  highlightsBaseURL: string
  margin?: number
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
  maxWidthPercentage?: number
  highContrastFont?: boolean
  showHighlightsModal: boolean
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
}

export function ArticleContainer(props: ArticleContainerProps): JSX.Element {
  const [showReportIssuesModal, setShowReportIssuesModal] = useState(false)
  const [fontSize, setFontSize] = useState(props.fontSize ?? 20)
  // iOS app embed can overide the original margin and line height
  const [maxWidthPercentageOverride, setMaxWidthPercentageOverride] =
    useState<number | null>(null)
  const [lineHeightOverride, setLineHeightOverride] =
    useState<number | null>(null)
  const [fontFamilyOverride, setFontFamilyOverride] =
    useState<string | null>(null)
  const [highContrastFont, setHighContrastFont] = useState(
    props.highContrastFont ?? false
  )
  const highlightHref = useRef(
    window.location.hash ? window.location.hash.split('#')[1] : null
  )

  const updateFontSize = async (newFontSize: number) => {
    if (fontSize !== newFontSize) {
      setFontSize(newFontSize)
      await userPersonalizationMutation({ fontSize: newFontSize })
    }
  }

  useEffect(() => {
    updateFontSize(props.fontSize ?? 20)
  }, [props.fontSize])

  // Listen for preference change events sent from host apps (ios, macos...)
  useEffect(() => {
    interface UpdateLineHeightEvent extends Event {
      lineHeight?: number
    }

    const updateLineHeight = (event: UpdateLineHeightEvent) => {
      const newLineHeight = event.lineHeight ?? lineHeightOverride ?? 150
      if (newLineHeight >= 100 && newLineHeight <= 300) {
        setLineHeightOverride(newLineHeight)
      }
    }

    interface UpdateMaxWidthPercentageEvent extends Event {
      maxWidthPercentage?: number
    }

    const updateMaxWidthPercentage = (event: UpdateMaxWidthPercentageEvent) => {
      const newMaxWidthPercentage =
        event.maxWidthPercentage ?? maxWidthPercentageOverride ?? 100
      if (newMaxWidthPercentage >= 40 && newMaxWidthPercentage <= 100) {
        setMaxWidthPercentageOverride(newMaxWidthPercentage)
      }
    }

    interface UpdateFontFamilyEvent extends Event {
      fontFamily?: string
    }

    const updateFontFamily = (event: UpdateFontFamilyEvent) => {
      const newFontFamily =
        event.fontFamily ?? fontFamilyOverride ?? props.fontFamily ?? 'inter'
      console.log('setting font fam to', event.fontFamily)
      setFontFamilyOverride(newFontFamily)
    }

    interface UpdateFontContrastEvent extends Event {
      fontContrast?: 'high' | 'normal'
    }

    const handleFontContrastChange = async (event: UpdateFontContrastEvent) => {
      const highContrast = event.fontContrast == 'high'
      setHighContrastFont(highContrast)
    }

    interface UpdateFontSizeEvent extends Event {
      fontSize?: number
    }

    const handleFontSizeChange = async (event: UpdateFontSizeEvent) => {
      const newFontSize = event.fontSize ?? 18
      if (newFontSize >= 10 && newFontSize <= 28) {
        updateFontSize(newFontSize)
      }
    }

    interface UpdateThemeEvent extends Event {
      themeName?: string
    }

    const handleThemeChange = async (event: UpdateThemeEvent) => {
      const newTheme = event.themeName
      if (newTheme) {
        updateThemeLocally(newTheme)
      }
    }

    interface UpdateColorModeEvent extends Event {
      isDark?: string
    }

    const updateColorMode = (event: UpdateColorModeEvent) => {
      const isDark = event.isDark ?? 'false'
      updateThemeLocally(isDark === 'true' ? ThemeId.Dark : ThemeId.Light)
    }

    const share = () => {
      if (navigator.share) {
        navigator.share({
          title: props.article.title,
          url: props.article.originalArticleUrl,
        })
      }
    }

    document.addEventListener('updateFontFamily', updateFontFamily)
    document.addEventListener('updateLineHeight', updateLineHeight)
    document.addEventListener(
      'updateMaxWidthPercentage',
      updateMaxWidthPercentage
    )
    document.addEventListener('updateTheme', handleThemeChange)
    document.addEventListener('updateFontSize', handleFontSizeChange)
    document.addEventListener('updateColorMode', updateColorMode)
    document.addEventListener(
      'handleFontContrastChange',
      handleFontContrastChange
    )
    document.addEventListener('share', share)

    return () => {
      document.removeEventListener('updateFontFamily', updateFontFamily)
      document.removeEventListener('updateLineHeight', updateLineHeight)
      document.removeEventListener(
        'updateMaxWidthPercentage',
        updateMaxWidthPercentage
      )
      document.removeEventListener('updateTheme', handleThemeChange)
      document.removeEventListener('updateFontSize', handleFontSizeChange)
      document.removeEventListener('updateColorMode', updateColorMode)
      document.removeEventListener(
        'handleFontContrastChange',
        handleFontContrastChange
      )
      document.removeEventListener('share', share)
    }
  })

  const styles = {
    fontSize,
    margin: props.margin ?? 360,
    maxWidthPercentage: maxWidthPercentageOverride ?? props.maxWidthPercentage,
    lineHeight: lineHeightOverride ?? props.lineHeight ?? 150,
    fontFamily: fontFamilyOverride ?? props.fontFamily ?? 'inter',
    readerFontColor: highContrastFont
      ? theme.colors.readerFontHighContrast.toString()
      : theme.colors.readerFont.toString(),
    readerTableHeaderColor: theme.colors.readerTableHeader.toString(),
  }
  console.log("current theme info: ", currentThemeName())
  console.log(" -- ", theme.colors)

  return (
    <>
      <Box
        id="article-container"
        css={{
          padding: '16px',
          maxWidth: `${styles.maxWidthPercentage ?? 100}%`,
          background: theme.colors.readerBg.toString(),
          '--text-font-family': styles.fontFamily,
          '--text-font-size': `${styles.fontSize}px`,
          '--line-height': `${styles.lineHeight}%`,
          '--blockquote-padding': '0.5em 1em',
          '--blockquote-icon-font-size': '1.3rem',
          '--figure-margin': '1.6rem auto',
          '--hr-margin': '1em',
          '--font-color': styles.readerFontColor,
          '--table-header-color': styles.readerTableHeaderColor,
          '@sm': {
            '--blockquote-padding': '1em 2em',
            '--blockquote-icon-font-size': '1.7rem',
            '--figure-margin': '2.6875rem auto',
            '--hr-margin': '2em',
            margin: `30px 0px`,
          },
          '@md': {
            maxWidth: styles.maxWidthPercentage
              ? `${styles.maxWidthPercentage}%`
              : 1024 - styles.margin,
          },
        }}
      >
        <VStack alignment="start" distribution="start">
          <StyledText
            style="boldHeadline"
            data-testid="article-headline"
            css={{
              fontFamily: styles.fontFamily,
              width: '100%',
              wordWrap: 'break-word',
            }}
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
            <SpanBox
              css={{
                pb: '16px',
                width: '100%',
                '&:empty': { display: 'none' },
              }}
            >
              {props.labels?.map((label) => (
                <LabelChip
                  key={label.id}
                  text={label.name}
                  color={label.color}
                />
              ))}
            </SpanBox>
          ) : null}
        </VStack>
        <Article
          articleId={props.article.id}
          content={props.article.content}
          highlightHref={highlightHref}
          initialAnchorIndex={props.article.readingProgressAnchorIndex}
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
        scrollToHighlight={highlightHref}
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
