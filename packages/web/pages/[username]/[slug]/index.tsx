import { PrimaryLayout } from '../../../components/templates/PrimaryLayout'
import { LoadingView } from '../../../components/patterns/LoadingView'
import { useRouter } from 'next/router'
import { VStack } from './../../../components/elements/LayoutPrimitives'
import { ArticleContainer } from './../../../components/templates/article/ArticleContainer'
import { PdfArticleContainerProps } from './../../../components/templates/article/PdfArticleContainer'
import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { ArticleActionsMenu } from '../../../components/templates/article/ArticleActionsMenu'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { SetLabelsModal } from '../../../components/templates/article/SetLabelsModal'
import { DisplaySettingsModal } from '../../../components/templates/article/DisplaySettingsModal'
import { useReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { SkeletonArticleContainer } from '../../../components/templates/article/SkeletonArticleContainer'
import { useRegisterActions } from 'kbar'
import { ReaderHeader } from '../../../components/templates/reader/ReaderHeader'
import { EditArticleModal } from '../../../components/templates/homeFeed/EditItemModals'
import { VerticalArticleActionsMenu } from '../../../components/templates/article/VerticalArticleActions'
import { PdfHeaderSpacer } from '../../../components/templates/article/PdfHeaderSpacer'
import { EpubContainerProps } from '../../../components/templates/article/EpubContainer'
import { useSetPageLabels } from '../../../lib/hooks/useSetPageLabels'
import { PDFDisplaySettingsModal } from '../../../components/templates/article/PDFDisplaySettingsModal'
import {
  ArticleReadingProgressMutationInput,
  useArchiveItem,
  useDeleteItem,
  useGetLibraryItemContent,
  useUpdateItemReadStatus,
} from '../../../lib/networking/library_items/useLibraryItems'
import {
  CreateHighlightInput,
  useCreateHighlight,
  useDeleteHighlight,
  useMergeHighlight,
  useUpdateHighlight,
} from '../../../lib/networking/highlights/useItemHighlights'
import { useGetViewer } from '../../../lib/networking/viewer/useGetViewer'

const PdfArticleContainerNoSSR = dynamic<PdfArticleContainerProps>(
  () =>
    import(
      `./../../../components/templates/article/pdf.js/PdfArticleContainer`
    ),
  { ssr: false }
)

const NativePdfArticleContainer = dynamic<PdfArticleContainerProps>(
  () =>
    import(`./../../../components/templates/article/NativePdfArticleContainer`),
  { ssr: false }
)

const EpubContainerNoSSR = dynamic<EpubContainerProps>(
  () => import('./../../../components/templates/article/EpubContainer'),
  { ssr: false }
)

export default function Reader(): JSX.Element {
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHighlightsModal, setShowHighlightsModal] = useState(false)
  const [useNativePdfReader, setUseNativePdfReader] = useState(false)
  const { data: viewerData } = useGetViewer()
  const readerSettings = useReaderSettings()
  const archiveItem = useArchiveItem()
  const deleteItem = useDeleteItem()
  const updateItemReadStatus = useUpdateItemReadStatus()
  const createHighlight = useCreateHighlight()
  const deleteHighlight = useDeleteHighlight()
  const updateHighlight = useUpdateHighlight()
  const mergeHighlight = useMergeHighlight()

  const { data: libraryItem, error: articleFetchError } =
    useGetLibraryItemContent(
      router.query.username as string,
      router.query.slug as string
    )
  useEffect(() => {
    dispatchLabels({
      type: 'RESET',
      labels: libraryItem?.labels ?? [],
    })
  }, [libraryItem])

  const goNextOrHome = useCallback(() => {
    // const listStr = localStorage.getItem('library-slug-list')
    // if (article && listStr && viewerData?.me) {
    //   const libraryList = JSON.parse(listStr) as string[]
    //   const idx = libraryList.findIndex((slug) => slug == article.slug)
    //   if (idx != -1 && idx < libraryList.length - 1) {
    //     const nextSlug = libraryList[idx + 1] as string
    //     router.push(`/${viewerData?.me.profile.username}/${nextSlug}`)
    //     return
    //   }
    // }
    const navReturn = window.localStorage.getItem('nav-return')
    if (navReturn) {
      router.push(navReturn)
      return
    }

    const query = window.sessionStorage.getItem('q')
    router.push(`/home?${query}`)
  }, [router, viewerData, libraryItem])

  const goPreviousOrHome = useCallback(() => {
    // const listStr = localStorage.getItem('library-slug-list')
    // if (article && listStr && viewerData?.me) {
    //   const libraryList = JSON.parse(listStr) as string[]
    //   const idx = libraryList.findIndex((slug) => slug == article.slug)
    //   if (idx > 0) {
    //     const previousSlug = libraryList[idx - 1] as string
    //     router.push(`/${viewerData?.me.profile.username}/${previousSlug}`)
    //     return
    //   }
    // }
    const query = window.sessionStorage.getItem('q')
    router.push(`/home?${query}`)
    // router.push(`/home`)
  }, [router, viewerData, libraryItem])

  const actionHandler = useCallback(
    async (action: string, arg?: unknown) => {
      if (!libraryItem) {
        return
      }
      switch (action) {
        case 'archive':
        case 'unarchive':
          try {
            await archiveItem.mutateAsync({
              itemId: libraryItem.id,
              slug: libraryItem.slug,
              input: {
                linkId: libraryItem.id,
                archived: action == 'archive',
              },
            })
          } catch {
            showErrorToast(`Error ${action}ing item`, {
              position: 'bottom-right',
            })
            return
          }
          showSuccessToast(`Item ${action}d`, {
            position: 'bottom-right',
          })
          goNextOrHome()
          break
        case 'mark-read':
        case 'mark-unread':
          const desc = action == 'mark-read' ? 'read' : 'unread'
          const values =
            action == 'mark-read'
              ? {
                  readingProgressPercent: 100,
                  readingProgressTopPercent: 100,
                  readingProgressAnchorIndex: 0,
                }
              : {
                  readingProgressPercent: 0,
                  readingProgressTopPercent: 0,
                  readingProgressAnchorIndex: 0,
                }
          try {
            await updateItemReadStatus.mutateAsync({
              itemId: libraryItem.id,
              slug: libraryItem.slug,
              input: {
                id: libraryItem.id,
                force: true,
                ...values,
              },
            })
          } catch {
            showErrorToast(`Error marking as ${desc}`, {
              position: 'bottom-right',
            })
            return
          }
          goNextOrHome()
          break
        case 'delete':
          try {
            await deleteItem.mutateAsync({
              itemId: libraryItem.id,
              slug: libraryItem.slug,
            })
          } catch {
            showErrorToast(`Error deleting item`, {
              position: 'bottom-right',
            })
            return
          }
          showSuccessToast(`Item deleted`, {
            position: 'bottom-right',
          })
          goNextOrHome()
          break
        case 'openOriginalArticle':
          const url = libraryItem?.url
          if (url) {
            window.open(url, '_blank')
          }
          break
        case 'refreshLabels':
          dispatchLabels({
            type: 'RESET',
            labels: arg as Label[],
          })
          break
        case 'showHighlights':
          setShowHighlightsModal(true)
          break
        case 'showEditModal':
          setShowEditModal(true)
          break
        default:
          readerSettings.actionHandler(action, arg)
          break
      }
    },
    [
      libraryItem,
      viewerData,
      router,
      readerSettings,
      archiveItem,
      deleteItem,
      updateItemReadStatus,
    ]
  )

  useEffect(() => {
    const updateReaderSettings = () => {
      const native = localStorage.getItem('reader-use-native-reader')
      const nativeReader = native ? JSON.parse(native) == true : false
      setUseNativePdfReader(nativeReader)
    }

    if (window) {
      updateReaderSettings()
      document.addEventListener('pdfReaderUpdateSettings', updateReaderSettings)
    }

    return () => {
      if (window) {
        document.removeEventListener(
          'pdfReaderUpdateSettings',
          updateReaderSettings
        )
      }
    }
  }, [])

  useEffect(() => {
    const archive = () => {
      actionHandler('archive')
    }
    const openOriginalArticle = () => {
      actionHandler('openOriginalArticle')
    }
    const deletePage = () => {
      actionHandler('delete')
    }

    const markRead = () => {
      actionHandler('mark-read')
    }

    const markUnread = () => {
      actionHandler('mark-unread')
    }

    const showEditModal = () => {
      actionHandler('showEditModal')
    }

    document.addEventListener('archive', archive)
    document.addEventListener('delete', deletePage)
    document.addEventListener('mark-read', markRead)
    document.addEventListener('mark-unread', markUnread)
    document.addEventListener('openOriginalArticle', openOriginalArticle)
    document.addEventListener('showEditModal', showEditModal)

    document.addEventListener('goNextOrHome', goNextOrHome)
    document.addEventListener('goPreviousOrHome', goPreviousOrHome)

    return () => {
      document.removeEventListener('archive', archive)
      document.removeEventListener('mark-read', markRead)
      document.removeEventListener('mark-unread', markUnread)

      document.removeEventListener('delete', deletePage)
      document.removeEventListener('openOriginalArticle', openOriginalArticle)
      document.removeEventListener('showEditModal', showEditModal)
      document.removeEventListener('goNextOrHome', goNextOrHome)
      document.removeEventListener('goPreviousOrHome', goPreviousOrHome)
    }
  }, [actionHandler, goNextOrHome, goPreviousOrHome])

  useRegisterActions(
    [
      {
        id: 'open',
        section: 'Article',
        name: 'Open original article',
        shortcut: ['o'],
        perform: () => {
          document.dispatchEvent(new Event('openOriginalArticle'))
        },
      },
      {
        id: 'back_home',
        section: 'Article',
        name: 'Return to library',
        shortcut: ['u'],
        perform: () => {
          const navReturn = window.localStorage.getItem('nav-return')
          if (navReturn) {
            router.push(navReturn, navReturn, { scroll: false })
            return
          }
          const query = window.sessionStorage.getItem('q')
          if (query) {
            router.push(`/home?${query}`)
            return
          } else {
            router.push(`/home`)
          }
        },
      },
      {
        id: 'back_home_esc',
        section: 'Article',
        name: 'Back to library',
        shortcut: ['escape'],
        perform: () => {
          if (
            readerSettings.showSetLabelsModal ||
            readerSettings.showEditDisplaySettingsModal
          ) {
            return
          }
          if (showHighlightsModal) {
            setShowHighlightsModal(false)
            return
          }
          const query = window.sessionStorage.getItem('q')
          if (query) {
            router.push(`/home?${query}`)
            return
          } else {
            router.push(`/home`)
          }
        },
      },
      {
        id: 'archive',
        section: 'Article',
        name: 'Archive current item',
        shortcut: ['e'],
        perform: () => {
          document.dispatchEvent(new Event('archive'))
        },
      },
      {
        id: 'mark_read',
        section: 'Article',
        name: 'Mark current item as read',
        shortcut: ['-'],
        perform: () => {
          document.dispatchEvent(new Event('mark-read'))
        },
      },
      {
        id: 'mark_unread',
        section: 'Article',
        name: 'Mark current item as unread',
        shortcut: ['-'],
        perform: () => {
          document.dispatchEvent(new Event('mark-unread'))
        },
      },
      {
        id: 'full_screen',
        section: 'Article',
        name: 'Read fullscreen',
        shortcut: ['f'],
        perform: () => {
          const reader = document.getElementById('article-wrapper')
          if (!reader) {
            alert('Unable to enter fullscreen mode')
          }
          reader?.requestFullscreen()
        },
      },
      {
        id: 'delete',
        section: 'Article',
        name: 'Delete current item',
        shortcut: ['#'],
        perform: () => {
          document.dispatchEvent(new Event('delete'))
        },
      },
      {
        id: 'highlight',
        section: 'Article',
        name: 'Highlight selected text',
        shortcut: ['h'],
        perform: () => {
          document.dispatchEvent(new Event('highlight'))
        },
      },
      {
        id: 'highlight_next',
        section: 'Article',
        name: 'Scroll to next highlight',
        shortcut: ['j'],
        perform: () => {
          document.dispatchEvent(new Event('scrollToNextHighlight'))
        },
      },
      {
        id: 'highlight_previous',
        section: 'Article',
        name: 'Scroll to previous highlight',
        shortcut: ['k'],
        perform: () => {
          document.dispatchEvent(new Event('scrollToPrevHighlight'))
        },
      },
      {
        id: 'note',
        section: 'Article',
        name: 'Highlight selected text and add a note',
        shortcut: ['n'],
        perform: () => {
          document.dispatchEvent(new Event('annotate'))
        },
      },
      {
        id: 'notebook',
        section: 'Article',
        name: 'Notebook',
        shortcut: ['t'],
        perform: () => {
          setShowHighlightsModal(!showHighlightsModal)
        },
      },
      {
        id: 'edit_title',
        section: 'Article',
        name: 'Edit Info',
        shortcut: ['i'],
        perform: () => setShowEditModal(true),
      },
      // {
      //   id: 'go_previous',
      //   section: 'Article',
      //   name: 'Go to Previous',
      //   shortcut: ['g', 'p'],
      //   perform: () => {
      //     document.dispatchEvent(new Event('goPreviousOrHome'))
      //   },
      // },
      // {
      //   id: 'go_next',
      //   section: 'Article',
      //   name: 'Go to Next',
      //   shortcut: ['g', 'n'],
      //   perform: () => {
      //     document.dispatchEvent(new Event('goNextOrHome'))
      //   },
      // },
    ],
    [readerSettings, showHighlightsModal]
  )

  const [labels, dispatchLabels] = useSetPageLabels(
    libraryItem?.id,
    libraryItem?.slug
  )

  if (
    articleFetchError &&
    'message' in articleFetchError &&
    articleFetchError['message'] === 'NOT_FOUND'
  ) {
    router.push('/404')
    return <LoadingView />
  }

  console.log('library item: ', libraryItem)
  return (
    <PrimaryLayout
      pageTestId="home-page-tag"
      headerToolbarControl={
        <ArticleActionsMenu
          article={libraryItem}
          layout="top"
          showReaderDisplaySettings={libraryItem?.contentReader != 'PDF'}
          readerSettings={readerSettings}
          articleActionHandler={actionHandler}
        />
      }
      alwaysDisplayToolbar={libraryItem?.contentReader == 'PDF'}
      pageMetaDataProps={{
        title: libraryItem?.title ?? '',
        path: router.pathname,
        description: libraryItem?.description ?? '',
      }}
    >
      <Script async src="/static/mathjax/mathJaxConfiguration.js" />
      <Script
        async
        id="MathJax-script"
        src="/static/mathjax/tex-mml-chtml.js"
      />
      <ReaderHeader
        hideDisplaySettings={false}
        showDisplaySettingsModal={
          readerSettings.setShowEditDisplaySettingsModal
        }
        alwaysDisplayToolbar={libraryItem?.contentReader == 'PDF'}
      >
        <VerticalArticleActionsMenu
          article={libraryItem}
          layout="top"
          showReaderDisplaySettings={libraryItem?.contentReader != 'PDF'}
          articleActionHandler={actionHandler}
        />
      </ReaderHeader>

      {libraryItem?.contentReader == 'PDF' && <PdfHeaderSpacer />}

      <VStack
        distribution="between"
        alignment="center"
        css={{
          position: 'fixed',
          flexDirection: 'row-reverse',
          left: 8,
          height: '100%',
          width: '35px',
          '@lgDown': {
            display: 'none',
          },
        }}
      >
        {libraryItem?.contentReader !== 'PDF' ? (
          <ArticleActionsMenu
            article={libraryItem}
            layout="side"
            readerSettings={readerSettings}
            showReaderDisplaySettings={true}
            articleActionHandler={actionHandler}
          />
        ) : null}
      </VStack>
      {libraryItem &&
        viewerData &&
        libraryItem.contentReader == 'PDF' &&
        (useNativePdfReader ? (
          <NativePdfArticleContainer
            article={libraryItem}
            showHighlightsModal={showHighlightsModal}
            setShowHighlightsModal={setShowHighlightsModal}
            viewer={viewerData}
          />
        ) : (
          <PdfArticleContainerNoSSR
            article={libraryItem}
            showHighlightsModal={showHighlightsModal}
            setShowHighlightsModal={setShowHighlightsModal}
            viewer={viewerData}
          />
        ))}
      {libraryItem && viewerData && libraryItem.contentReader == 'WEB' && (
        <VStack
          id="article-wrapper"
          alignment="center"
          distribution="start"
          className="disable-webkit-callout"
          css={{
            width: '100%',
            height: '100%',
            background: '$readerBg',
            overflow: 'scroll',
            paddingTop: '80px',
            '@media print': {
              paddingTop: '0px',
            },
          }}
        >
          {libraryItem && viewerData ? (
            <ArticleContainer
              viewer={viewerData}
              article={libraryItem}
              isAppleAppEmbed={false}
              highlightBarDisabled={false}
              fontSize={readerSettings.fontSize}
              margin={readerSettings.marginWidth}
              lineHeight={readerSettings.lineHeight}
              fontFamily={readerSettings.fontFamily}
              labels={labels.labels}
              showHighlightsModal={showHighlightsModal}
              setShowHighlightsModal={setShowHighlightsModal}
              justifyText={readerSettings.justifyText ?? undefined}
              highContrastText={readerSettings.highContrastText ?? undefined}
              highlightOnRelease={
                readerSettings.highlightOnRelease ?? undefined
              }
              textDirection={
                libraryItem.directionality ?? readerSettings.textDirection
              }
              articleMutations={{
                createHighlightMutation: async (
                  input: CreateHighlightInput
                ) => {
                  try {
                    const result = await createHighlight.mutateAsync({
                      itemId: libraryItem.id,
                      slug: libraryItem.slug,
                      input,
                    })
                    return result
                  } catch (err) {
                    console.log('error creating highlight', err)
                    return undefined
                  }
                },
                deleteHighlightMutation: async (
                  libraryItemId,
                  highlightId: string
                ) => {
                  try {
                    await deleteHighlight.mutateAsync({
                      itemId: libraryItem.id,
                      slug: libraryItem.slug,
                      highlightId,
                    })
                    return true
                  } catch (err) {
                    console.log('error deleting highlight', err)
                    return false
                  }
                },
                mergeHighlightMutation: async (input) => {
                  try {
                    const result = await mergeHighlight.mutateAsync({
                      itemId: libraryItem.id,
                      slug: libraryItem.slug,
                      input,
                    })
                    return result?.highlight
                  } catch (err) {
                    console.log('error merging highlight', err)
                    return undefined
                  }
                },
                updateHighlightMutation: async (input) => {
                  try {
                    const result = await updateHighlight.mutateAsync({
                      itemId: libraryItem.id,
                      slug: libraryItem.slug,
                      input,
                    })
                    return result?.id
                  } catch (err) {
                    console.log('error updating highlight', err)
                    return undefined
                  }
                },
                articleReadingProgressMutation: async (
                  input: ArticleReadingProgressMutationInput
                ) => {
                  try {
                    await updateItemReadStatus.mutateAsync({
                      itemId: libraryItem.id,
                      slug: libraryItem.slug,
                      input,
                    })
                  } catch {
                    return false
                  }
                  return true
                },
              }}
            />
          ) : (
            <SkeletonArticleContainer
              margin={readerSettings.marginWidth}
              lineHeight={readerSettings.lineHeight}
              fontSize={readerSettings.fontSize}
            />
          )}
        </VStack>
      )}

      {libraryItem && viewerData && libraryItem.contentReader == 'EPUB' && (
        <VStack
          alignment="center"
          distribution="start"
          className="disable-webkit-callout"
          css={{
            width: '100%',
            height: '100%',
            background: '$readerBg',
            overflow: 'scroll',
            paddingTop: '80px',
          }}
        >
          {libraryItem && viewerData ? (
            <EpubContainerNoSSR
              article={libraryItem}
              showHighlightsModal={showHighlightsModal}
              setShowHighlightsModal={setShowHighlightsModal}
              viewer={viewerData}
            />
          ) : (
            <SkeletonArticleContainer
              margin={readerSettings.marginWidth}
              lineHeight={readerSettings.lineHeight}
              fontSize={readerSettings.fontSize}
            />
          )}
        </VStack>
      )}

      {libraryItem && readerSettings.showSetLabelsModal && (
        <SetLabelsModal
          provider={libraryItem}
          selectedLabels={labels.labels}
          dispatchLabels={dispatchLabels}
          onOpenChange={() => readerSettings.setShowSetLabelsModal(false)}
        />
      )}
      {libraryItem?.contentReader === 'PDF' &&
        readerSettings.showEditDisplaySettingsModal && (
          <PDFDisplaySettingsModal
            centerX={true}
            readerSettings={readerSettings}
            onOpenChange={() => {
              readerSettings.setShowEditDisplaySettingsModal(false)
            }}
          />
        )}
      {libraryItem?.contentReader !== 'PDF' &&
        readerSettings.showEditDisplaySettingsModal && (
          <DisplaySettingsModal
            centerX={true}
            readerSettings={readerSettings}
            onOpenChange={() => {
              readerSettings.setShowEditDisplaySettingsModal(false)
            }}
          />
        )}
      {libraryItem && showEditModal && (
        <EditArticleModal
          article={libraryItem}
          onOpenChange={() => setShowEditModal(false)}
          updateArticle={(title, author, description, savedAt, publishedAt) => {
            // libraryItem.title = title
            // libraryItem.author = author
            // libraryItem.description = description
            // libraryItem.savedAt = savedAt
            // libraryItem.publishedAt = publishedAt
            // const titleEvent = new Event('updateTitle') as UpdateTitleEvent
            // titleEvent.title = title
            // document.dispatchEvent(titleEvent)
          }}
        />
      )}
    </PrimaryLayout>
  )
}
