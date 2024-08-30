import { Article } from './../../../components/templates/article/Article'
import { Box, HStack, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import { StyledText } from './../../elements/StyledText'
import {
  ArticleSubtitle,
  ReaderSavedInfo,
} from './../../patterns/ArticleSubtitle'
import { theme, ThemeId } from './../../tokens/stitches.config'
import { HighlightsLayer } from '../../templates/article/HighlightsLayer'
import { Button } from '../../elements/Button'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { ReportIssuesModal } from './ReportIssuesModal'
import { reportIssueMutation } from '../../../lib/networking/mutations/reportIssueMutation'
import { updateTheme, updateThemeLocally } from '../../../lib/themeUpdater'
import { ArticleMutations } from '../../../lib/articleActions'
import { LabelChip } from '../../elements/LabelChip'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import {
  ArticleAttributes,
  Recommendation,
  TextDirection,
  useRestoreItem,
  useUpdateItemReadStatus,
} from '../../../lib/networking/library_items/useLibraryItems'
import { Avatar } from '../../elements/Avatar'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { State } from '../../../lib/networking/fragments/articleFragment'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'

type ArticleContainerProps = {
  viewer: UserBasicData
  article: ArticleAttributes
  labels: Label[]
  articleMutations: ArticleMutations
  isAppleAppEmbed: boolean
  highlightBarDisabled: boolean
  margin?: number
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
  maxWidthPercentage?: number
  highContrastText?: boolean
  showHighlightsModal: boolean
  highlightOnRelease?: boolean
  justifyText?: boolean
  textDirection?: TextDirection
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
}

type RecommendationCommentsProps = {
  recommendationsWithNotes: Recommendation[]
}

export interface UpdateTitleEvent extends Event {
  title?: string
}

const RecommendationComments = (
  props: RecommendationCommentsProps
): JSX.Element => {
  return (
    <VStack
      id="recommendations-container"
      css={{
        borderRadius: '6px',
        bg: '$grayBgSubtle',
        p: '16px',
        pt: '16px',
        pb: '2px',
        width: '100%',
        marginTop: '24px',
        color: '$grayText',
        lineHeight: '2.0',
      }}
    >
      <HStack css={{ pb: '0px', mb: '0px' }}>
        <StyledText
          style="recommendedByline"
          css={{ paddingTop: '0px', mb: '16px' }}
        >
          Comments{' '}
          <SpanBox css={{ color: 'grayText', fontWeight: '400' }}>
            &nbsp;{` ${props.recommendationsWithNotes.length}`}
          </SpanBox>
        </StyledText>
      </HStack>

      {props.recommendationsWithNotes.map((item) => (
        <VStack
          key={item.id}
          alignment="start"
          distribution="start"
          css={{ pt: '0px', pb: '8px' }}
        >
          <HStack>
            <SpanBox
              css={{
                verticalAlign: 'top',
                minWidth: '28px',
                display: 'flex',
              }}
            >
              <Avatar
                imageURL={item.user?.profileImageURL}
                height="28px"
                tooltip={item.user?.name}
                fallbackText={item.user?.username[0] ?? 'U'}
              />
            </SpanBox>
            <StyledText style="userNote" css={{ pl: '16px' }}>
              {item.note}
            </StyledText>
          </HStack>
        </VStack>
      ))}
    </VStack>
  )
}

export function ArticleContainer(props: ArticleContainerProps): JSX.Element {
  const [labels, setLabels] = useState(props.labels)
  const [title, setTitle] = useState<string | undefined>(undefined)
  const [showReportIssuesModal, setShowReportIssuesModal] = useState(false)
  const [fontSize, setFontSize] = useState(props.fontSize ?? 20)
  const [highlightOnRelease, setHighlightOnRelease] = useState(
    props.highlightOnRelease
  )
  // iOS app embed can overide the original margin and line height
  const [maxWidthPercentageOverride, setMaxWidthPercentageOverride] = useState<
    number | null
  >(null)
  const [lineHeightOverride, setLineHeightOverride] = useState<number | null>(
    null
  )
  const [fontFamilyOverride, setFontFamilyOverride] = useState<string | null>(
    null
  )
  const [highContrastTextOverride, setHighContrastTextOverride] = useState<
    boolean | undefined
  >(undefined)
  const [justifyTextOverride, setJustifyTextOverride] = useState<
    boolean | undefined
  >(undefined)
  const highlightHref = useRef(
    window.location.hash ? window.location.hash.split('#')[1] : null
  )
  const [textDirection, setTextDirection] = useState(
    props.textDirection ?? 'LTR'
  )

  const restoreItem = useRestoreItem()

  const updateFontSize = useCallback(
    (newFontSize: number) => {
      setFontSize(newFontSize)
    },
    [setFontSize]
  )

  useEffect(() => {
    setLabels(props.labels)
    updateFontSize(props.fontSize ?? 20)
  }, [props.labels, props.fontSize, updateFontSize])

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

    interface UpdateHighlightModeEvent extends Event {
      enableHighlightOnRelease?: string
    }

    const updateHighlightMode = (event: UpdateHighlightModeEvent) => {
      const isEnabled = event.enableHighlightOnRelease === 'on'
      setHighlightOnRelease(isEnabled)
    }

    interface UpdateTextDirectionEvent extends Event {
      textDirection: TextDirection
    }

    const handleUpdateTextDirection = (event: UpdateTextDirectionEvent) => {
      setTextDirection(event.textDirection)
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
      setFontFamilyOverride(newFontFamily)
    }

    interface UpdateFontContrastEvent extends Event {
      fontContrast?: 'high' | 'normal'
    }

    const handleFontContrastChange = async (event: UpdateFontContrastEvent) => {
      const highContrast = event.fontContrast == 'high'
      setHighContrastTextOverride(highContrast)
    }

    interface UpdateFontSizeEvent extends Event {
      fontSize?: number
    }

    const handleFontSizeChange = async (event: UpdateFontSizeEvent) => {
      const newFontSize = event.fontSize ?? 18
      if (newFontSize >= 10 && newFontSize <= 48) {
        updateFontSize(newFontSize)
      }
    }

    interface UpdateThemeEvent extends Event {
      themeName?: string
    }

    const handleThemeChange = async (event: UpdateThemeEvent) => {
      const newTheme = event.themeName
      if (newTheme) {
        updateTheme(newTheme)
      }
    }

    interface UpdateColorModeEvent extends Event {
      isDark?: string
    }

    const updateColorMode = (event: UpdateColorModeEvent) => {
      const isDark = event.isDark ?? 'false'
      updateThemeLocally(isDark === 'true' ? ThemeId.Dark : ThemeId.Light)
    }

    interface UpdateJustifyText extends Event {
      justifyText?: boolean
    }

    const updateJustifyText = (event: UpdateJustifyText) => {
      setJustifyTextOverride(event.justifyText ?? false)
    }

    interface UpdateLabelsEvent extends Event {
      labels?: Label[]
    }

    const handleUpdateLabels = (event: UpdateLabelsEvent) => {
      setLabels(event.labels ?? [])
    }

    const handleUpdateTitle = (event: UpdateTitleEvent) => {
      if (event.title) {
        setTitle(event.title)
      }
    }

    const share = () => {
      if (navigator.share) {
        navigator.share({
          title: (title ?? props.article.title) + '\n',
          text: (title ?? props.article.title) + '\n',
          url: props.article.originalArticleUrl,
        })
      }
    }

    const saveReadPosition = () => {
      console.log('saving read position')
    }

    document.addEventListener('saveReadPosition', saveReadPosition)

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
    document.addEventListener('updateJustifyText', updateJustifyText)

    document.addEventListener('updateTitle', handleUpdateTitle)
    document.addEventListener('updateLabels', handleUpdateLabels)

    document.addEventListener('share', share)
    document.addEventListener(
      'handleAutoHighlightModeChange',
      updateHighlightMode
    )

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
      document.removeEventListener('updateJustifyText', updateJustifyText)
      document.removeEventListener('updateTitle', handleUpdateTitle)
      document.removeEventListener('updateLabels', handleUpdateLabels)
      document.removeEventListener('share', share)
      document.removeEventListener(
        'handleAutoHighlightModeChange',
        updateHighlightMode
      )
      document.removeEventListener('saveReadPosition', saveReadPosition)
    }
  })

  const textColorValue = (isHighContrast: boolean) => {
    return isHighContrast
      ? theme.colors.readerFontHighContrast.toString()
      : theme.colors.readerFont.toString()
  }

  const justifyTextValue = (isJustified: boolean) => {
    return isJustified ? 'justify' : 'start'
  }

  const appliedFont = (name: string | undefined | null) => {
    if (name === 'System Default') {
      return 'unset'
    }
    return name
  }

  const styles = {
    fontSize,
    margin: props.margin ?? 360,
    maxWidthPercentage: maxWidthPercentageOverride ?? props.maxWidthPercentage,
    lineHeight: lineHeightOverride ?? props.lineHeight ?? 150,
    fontFamily:
      appliedFont(fontFamilyOverride) ??
      appliedFont(props.fontFamily) ??
      'inter',
    readerFontColor:
      highContrastTextOverride != undefined
        ? textColorValue(highContrastTextOverride)
        : textColorValue(props.highContrastText ?? false),
    readerTableHeaderColor: theme.colors.readerTableHeader.toString(),
    readerHeadersColor: theme.colors.readerFont.toString(),
  }

  const maxWidthStyles = {
    default: styles.maxWidthPercentage
      ? `${styles.maxWidthPercentage}%`
      : 1024 - styles.margin,
    small: styles.maxWidthPercentage
      ? `${styles.maxWidthPercentage}%`
      : `${120 - Math.round((styles.margin * 10) / 100)}%`,
  }

  const recommendationsWithNotes = useMemo(() => {
    return (
      props.article.recommendations?.filter((recommendation) => {
        return recommendation.note
      }) ?? []
    )
  }, [props.article.recommendations])

  console.log('props.article', props.article)

  return (
    <>
      <Box
        dir={textDirection}
        id="article-container"
        css={{
          padding: 30,
          minHeight: '100vh',
          maxWidth: maxWidthStyles.default,
          background: theme.colors.readerBg.toString(),
          '--text-align':
            justifyTextOverride != undefined
              ? justifyTextValue(justifyTextOverride)
              : justifyTextValue(props.justifyText ?? false),
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
          },
          '@mdDown': {
            maxWidth: maxWidthStyles.small,
            padding: 15,
          },
        }}
      >
        <VStack alignment="start" distribution="start">
          <ReaderSavedInfo
            rawDisplayDate={
              props.article.publishedAt ??
              props.article.savedAt ??
              props.article.createdAt
            }
            wordsCount={props.article.wordsCount}
          />
          <StyledText
            style="articleTitle"
            data-testid="article-headline"
            css={{
              color: styles.readerFontColor,
              fontFamily: styles.fontFamily,
              width: '100%',
              wordWrap: 'break-word',
              display: '-webkit-box',
              '-webkit-box-orient': 'vertical',
              '-webkit-line-clamp': '4',
              overflow: 'hidden',
              '@smDown': {
                '-webkit-line-clamp': '6',
              },
            }}
            title={title ?? props.article.title}
          >
            {title ?? props.article.title}
          </StyledText>
          <ArticleSubtitle
            author={props.article.author}
            href={props.article.url}
          />

          {labels ? (
            <SpanBox
              css={{
                pb: '16px',
                width: '100%',
                '&:empty': { display: 'none' },
              }}
            >
              {labels?.map((label) => (
                <LabelChip
                  key={label.id}
                  text={label.name}
                  color={label.color}
                />
              ))}
            </SpanBox>
          ) : null}
          {recommendationsWithNotes.length > 0 && (
            <RecommendationComments
              recommendationsWithNotes={recommendationsWithNotes}
            />
          )}
          {!props.isAppleAppEmbed &&
            props.article &&
            props.article.state == State.DELETED && (
              <VStack
                css={{
                  borderRadius: '6px',
                  m: '20px',
                  p: '20px',
                  gap: '10px',
                  width: '100%',
                  marginTop: '24px',
                  bg: 'color(display-p3 0.996 0.71 0 / 0.11)',
                  lineHeight: '2.0',
                }}
                alignment="start"
                distribution="start"
              >
                This item has been deleted. To access all the highlights and
                content you can restore it. If you do not restore this item it
                will be removed from your trash after two weeks or when you
                manually empty your trash.
                <Button
                  style="ctaBlue"
                  onClick={async (event) => {
                    try {
                      const item = await restoreItem.mutateAsync({
                        itemId: props.article.id,
                        slug: props.article.slug,
                      })
                      console.log('restored: ', item)
                      showSuccessToast('Item restored')
                    } catch (err) {
                      console.log('error restoring item: ', err)
                      showErrorToast('Error restoring item')
                    }
                  }}
                >
                  Restore item
                </Button>
              </VStack>
            )}
          {/* {userHasFeature(props.viewer, 'ai-summaries') && (
            <AISummary
              libraryItemId={props.article.id}
              idx="latest"
              fontFamily={styles.fontFamily}
              fontSize={styles.fontSize}
              lineHeight={styles.lineHeight}
              readerFontColor={styles.readerFontColor}
            />
          )} */}
        </VStack>
        <Article
          articleId={props.article.id}
          content={props.article.content}
          highlightHref={highlightHref}
          initialAnchorIndex={props.article.readingProgressAnchorIndex}
          initialReadingProgressTop={props.article.readingProgressTopPercent}
          articleMutations={props.articleMutations}
          isAppleAppEmbed={props.isAppleAppEmbed}
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
            '@media print': {
              display: 'none',
            },
          }}
          onClick={() => setShowReportIssuesModal(true)}
        >
          Report issues with this page -{'>'}
        </Button>
        <Box css={{ height: '100px' }} />
      </Box>
      <HighlightsLayer
        viewer={props.viewer}
        item={props.article}
        scrollToHighlight={highlightHref}
        highlights={props.article.highlights ?? []}
        isAppleAppEmbed={props.isAppleAppEmbed}
        highlightBarDisabled={props.highlightBarDisabled}
        showHighlightsModal={props.showHighlightsModal}
        setShowHighlightsModal={props.setShowHighlightsModal}
        highlightOnRelease={highlightOnRelease}
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
    </>
  )
}
