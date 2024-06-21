import { PrimaryLayout } from '../../../components/templates/PrimaryLayout'
import { LoadingView } from '../../../components/patterns/LoadingView'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import {
  removeItemFromCache,
  useGetArticleQuery,
} from '../../../lib/networking/queries/useGetArticleQuery'
import { useRouter } from 'next/router'
import { VStack } from './../../../components/elements/LayoutPrimitives'
import {
  ArticleContainer,
  UpdateTitleEvent,
} from './../../../components/templates/article/ArticleContainer'
import { PdfArticleContainerProps } from './../../../components/templates/article/PdfArticleContainer'
import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'
import { createHighlightMutation } from '../../../lib/networking/mutations/createHighlightMutation'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { mergeHighlightMutation } from '../../../lib/networking/mutations/mergeHighlightMutation'
import { articleReadingProgressMutation } from '../../../lib/networking/mutations/articleReadingProgressMutation'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import Script from 'next/script'
import { ArticleActionsMenu } from '../../../components/templates/article/ArticleActionsMenu'
import { setLinkArchivedMutation } from '../../../lib/networking/mutations/setLinkArchivedMutation'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { useSWRConfig } from 'swr'
import {
  showErrorToast,
  showSuccessToast,
  showSuccessToastWithUndo,
} from '../../../lib/toastHelpers'
import { SetLabelsModal } from '../../../components/templates/article/SetLabelsModal'
import { DisplaySettingsModal } from '../../../components/templates/article/DisplaySettingsModal'
import { useReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { SkeletonArticleContainer } from '../../../components/templates/article/SkeletonArticleContainer'
import { useRegisterActions } from 'kbar'
import { deleteLinkMutation } from '../../../lib/networking/mutations/deleteLinkMutation'
import { ReaderHeader } from '../../../components/templates/reader/ReaderHeader'
import { EditArticleModal } from '../../../components/templates/homeFeed/EditItemModals'
import { VerticalArticleActionsMenu } from '../../../components/templates/article/VerticalArticleActions'
import { PdfHeaderSpacer } from '../../../components/templates/article/PdfHeaderSpacer'
import { EpubContainerProps } from '../../../components/templates/article/EpubContainer'
import { useSetPageLabels } from '../../../lib/hooks/useSetPageLabels'
import { updatePageMutation } from '../../../lib/networking/mutations/updatePageMutation'
import { State } from '../../../lib/networking/fragments/articleFragment'
import { posthog } from 'posthog-js'
import { PDFDisplaySettingsModal } from '../../../components/templates/article/PDFDisplaySettingsModal'

const PdfArticleContainerNoSSR = dynamic<PdfArticleContainerProps>(
  () => import('./../../../components/templates/article/PdfArticleContainer'),
  { ssr: false }
)

const EpubContainerNoSSR = dynamic<EpubContainerProps>(
  () => import('./../../../components/templates/article/EpubContainer'),
  { ssr: false }
)

export default function Home(): JSX.Element {
  const router = useRouter()
  const { cache, mutate } = useSWRConfig()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHighlightsModal, setShowHighlightsModal] = useState(false)
  const { viewerData } = useGetViewerQuery()
  const readerSettings = useReaderSettings()

  const { articleData, articleFetchError } = useGetArticleQuery({
    username: router.query.username as string,
    slug: router.query.slug as string,
    includeFriendsHighlights: false,
  })
  const article = articleData?.article.article
  useEffect(() => {
    dispatchLabels({
      type: 'RESET',
      labels: article?.labels ?? [],
    })
  }, [articleData?.article.article])

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
  }, [router, viewerData, article])

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
  }, [router, viewerData, article])

  const actionHandler = useCallback(
    async (action: string, arg?: unknown) => {
      switch (action) {
        case 'unarchive':
          if (article) {
            removeItemFromCache(cache, mutate, article.id)

            setLinkArchivedMutation({
              linkId: article.id,
              archived: false,
            }).then((res) => {
              if (res) {
                showSuccessToast('Link unarchived', {
                  position: 'bottom-right',
                })
              } else {
                showErrorToast('Error unarchiving link', {
                  position: 'bottom-right',
                })
              }
            })
            goNextOrHome()
          }
          break
        case 'archive':
          if (article) {
            removeItemFromCache(cache, mutate, article.id)

            await setLinkArchivedMutation({
              linkId: article.id,
              archived: true,
            }).then((res) => {
              if (!res) {
                showErrorToast('Error archiving', {
                  position: 'bottom-right',
                })
              } else {
                goNextOrHome()
                showSuccessToast('Page archived', {
                  position: 'bottom-right',
                })
              }
            })
          }
          break
        case 'mark-read':
          if (article) {
            articleReadingProgressMutation({
              id: article.id,
              force: true,
              readingProgressPercent: 100,
              readingProgressTopPercent: 100,
              readingProgressAnchorIndex: 0,
            }).then((res) => {
              if (!res) {
                // todo: revalidate or put back in cache?
                showErrorToast('Error marking as read', {
                  position: 'bottom-right',
                })
              } else {
                goNextOrHome()
              }
            })
          }
          break
        case 'delete':
          await deleteCurrentItem()
          break
        case 'openOriginalArticle':
          const url = article?.url
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
    [article, viewerData, cache, mutate, router, readerSettings]
  )

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

    const showEditModal = () => {
      actionHandler('showEditModal')
    }

    document.addEventListener('archive', archive)
    document.addEventListener('delete', deletePage)
    document.addEventListener('mark-read', markRead)
    document.addEventListener('openOriginalArticle', openOriginalArticle)
    document.addEventListener('showEditModal', showEditModal)

    document.addEventListener('goNextOrHome', goNextOrHome)
    document.addEventListener('goPreviousOrHome', goPreviousOrHome)

    return () => {
      document.removeEventListener('archive', archive)
      document.removeEventListener('mark-read', markRead)
      document.removeEventListener('delete', deletePage)
      document.removeEventListener('openOriginalArticle', openOriginalArticle)
      document.removeEventListener('showEditModal', showEditModal)
      document.removeEventListener('goNextOrHome', goNextOrHome)
      document.removeEventListener('goPreviousOrHome', goPreviousOrHome)
    }
  }, [actionHandler, goNextOrHome, goPreviousOrHome])

  useEffect(() => {
    if (article && viewerData?.me) {
      posthog.capture('link_read', {
        link: article.id,
        slug: article.slug,
        reader: article.contentReader,
        url: article.originalArticleUrl,
      })
    }
  }, [article, viewerData])

  const deleteCurrentItem = useCallback(async () => {
    if (article) {
      const pageId = article.id
      removeItemFromCache(cache, mutate, pageId)
      await deleteLinkMutation(pageId).then((res) => {
        if (res) {
          showSuccessToastWithUndo('Page deleted', async () => {
            const result = await updatePageMutation({
              pageId: pageId,
              state: State.SUCCEEDED,
            })
            document.dispatchEvent(new Event('revalidateLibrary'))
            if (result) {
              showSuccessToast('Page recovered')
            } else {
              showErrorToast('Error recovering page, check your deleted items')
            }
          })
        } else {
          // todo: revalidate or put back in cache?
          showErrorToast('Error deleting page', { position: 'bottom-right' })
        }
      })
      goNextOrHome()
    }
  }, [article, cache, mutate, router])

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
            router.push(navReturn)
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
    articleData?.article.article?.id
  )

  if (articleFetchError && articleFetchError.indexOf('NOT_FOUND') > -1) {
    router.push('/404')
    return <LoadingView />
  }

  return (
    <PrimaryLayout
      pageTestId="home-page-tag"
      headerToolbarControl={
        <ArticleActionsMenu
          article={article}
          layout="top"
          showReaderDisplaySettings={article?.contentReader != 'PDF'}
          readerSettings={readerSettings}
          articleActionHandler={actionHandler}
        />
      }
      alwaysDisplayToolbar={article?.contentReader == 'PDF'}
      pageMetaDataProps={{
        title: article?.title ?? '',
        path: router.pathname,
        description: article?.description ?? '',
      }}
    >
      <Script async src="/static/mathjax/mathJaxConfiguration.js" />
      <Script
        async
        id="MathJax-script"
        src="/static/mathjax/tex-mml-chtml.js"
      />
      <Toaster />

      <ReaderHeader
        hideDisplaySettings={false}
        showDisplaySettingsModal={
          readerSettings.setShowEditDisplaySettingsModal
        }
        alwaysDisplayToolbar={article?.contentReader == 'PDF'}
      >
        <VerticalArticleActionsMenu
          article={article}
          layout="top"
          showReaderDisplaySettings={article?.contentReader != 'PDF'}
          articleActionHandler={actionHandler}
        />
      </ReaderHeader>

      {article?.contentReader == 'PDF' && <PdfHeaderSpacer />}

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
        {article?.contentReader !== 'PDF' ? (
          <ArticleActionsMenu
            article={article}
            layout="side"
            readerSettings={readerSettings}
            showReaderDisplaySettings={true}
            articleActionHandler={actionHandler}
          />
        ) : null}
      </VStack>
      {article && viewerData?.me && article.contentReader == 'PDF' && (
        <PdfArticleContainerNoSSR
          article={article}
          showHighlightsModal={showHighlightsModal}
          setShowHighlightsModal={setShowHighlightsModal}
          viewer={viewerData.me}
        />
      )}
      {article && viewerData?.me && article.contentReader == 'WEB' && (
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
          {article && viewerData?.me ? (
            <ArticleContainer
              viewer={viewerData.me}
              article={article}
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
                article.directionality ?? readerSettings.textDirection
              }
              articleMutations={{
                createHighlightMutation,
                deleteHighlightMutation,
                mergeHighlightMutation,
                updateHighlightMutation,
                articleReadingProgressMutation,
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

      {article && viewerData?.me && article.contentReader == 'EPUB' && (
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
          {article && viewerData?.me ? (
            <EpubContainerNoSSR
              article={article}
              showHighlightsModal={showHighlightsModal}
              setShowHighlightsModal={setShowHighlightsModal}
              viewer={viewerData.me}
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

      {article && readerSettings.showSetLabelsModal && (
        <SetLabelsModal
          provider={article}
          selectedLabels={labels.labels}
          dispatchLabels={dispatchLabels}
          onOpenChange={() => readerSettings.setShowSetLabelsModal(false)}
        />
      )}
      {article?.contentReader === 'PDF' &&
        readerSettings.showEditDisplaySettingsModal && (
          <PDFDisplaySettingsModal
            centerX={true}
            readerSettings={readerSettings}
            onOpenChange={() => {
              readerSettings.setShowEditDisplaySettingsModal(false)
            }}
          />
        )}
      {article?.contentReader !== 'PDF' &&
        readerSettings.showEditDisplaySettingsModal && (
          <DisplaySettingsModal
            centerX={true}
            readerSettings={readerSettings}
            onOpenChange={() => {
              readerSettings.setShowEditDisplaySettingsModal(false)
            }}
          />
        )}
      {article && showEditModal && (
        <EditArticleModal
          article={article}
          onOpenChange={() => setShowEditModal(false)}
          updateArticle={(title, author, description, savedAt, publishedAt) => {
            article.title = title
            article.author = author
            article.description = description
            article.savedAt = savedAt
            article.publishedAt = publishedAt

            const titleEvent = new Event('updateTitle') as UpdateTitleEvent
            titleEvent.title = title
            document.dispatchEvent(titleEvent)
          }}
        />
      )}
    </PrimaryLayout>
  )
}
