import {
  autoUpdate,
  offset,
  size,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react'
import { NextRouter, useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { TrashIcon } from '../components/elements/icons/TrashIcon'
import { LabelChip } from '../components/elements/LabelChip'
import { Box, HStack, VStack } from '../components/elements/LayoutPrimitives'
import { ConfirmationModal } from '../components/patterns/ConfirmationModal'
import { HighlightHoverActions } from '../components/patterns/HighlightHoverActions'
import { HighlightViewNote } from '../components/patterns/HighlightNotes'
import { timeAgo } from '../components/patterns/LibraryCards/LibraryCardStyles'
import { SetHighlightLabelsModalPresenter } from '../components/templates/article/SetLabelsModalPresenter'
import { EmptyHighlights } from '../components/templates/homeFeed/EmptyHighlights'
import { LibraryFilterMenu } from '../components/templates/navMenu/LibraryMenu'
import { theme } from '../components/tokens/stitches.config'
import { useApplyLocalTheme } from '../lib/hooks/useApplyLocalTheme'
import { useFetchMore } from '../lib/hooks/useFetchMoreScroll'
import { Highlight } from '../lib/networking/fragments/highlightFragment'
import { deleteHighlightMutation } from '../lib/networking/mutations/deleteHighlightMutation'
import { useGetHighlights } from '../lib/networking/queries/useGetHighlights'
import {
  useGetViewerQuery,
  UserBasicData,
} from '../lib/networking/queries/useGetViewerQuery'
import { highlightColor } from '../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../lib/toastHelpers'

const PAGE_SIZE = 10

export default function HighlightsPage(): JSX.Element {
  const router = useRouter()
  const viewer = useGetViewerQuery()
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [_, setShowAddLinkModal] = useState(false)

  useApplyLocalTheme()

  const { isLoading, setSize, size, data, mutate } = useGetHighlights({
    first: PAGE_SIZE,
  })

  const hasMore = useMemo(() => {
    if (!data) {
      return false
    }
    return data[data.length - 1].highlights.pageInfo.hasNextPage
  }, [data])

  const handleFetchMore = useCallback(() => {
    if (isLoading || !hasMore) {
      return
    }
    setSize(size + 1)
  }, [isLoading, hasMore, setSize, size])

  useFetchMore(handleFetchMore)

  const highlights = useMemo(() => {
    if (!data) {
      return []
    }
    return data.flatMap((res) => res.highlights.edges.map((edge) => edge.node))
  }, [data])

  if (!highlights.length) {
    return (
      <Box
        css={{
          width: '100%',
          height: `100vh`,
        }}
      >
        <EmptyHighlights />
      </Box>
    )
  }

  return (
    <HStack>
      <Toaster />

      <LibraryFilterMenu
        setShowAddLinkModal={setShowAddLinkModal}
        showFilterMenu={showFilterMenu}
        setShowFilterMenu={setShowFilterMenu}
        searchTerm={undefined}
        applySearchQuery={(searchQuery: string) => {
          router?.push(`/home?q=${searchQuery}`)
        }}
      />
      <VStack
        css={{
          maxWidth: '70%',
          padding: '20px',
          margin: '30px 50px 0 0',
        }}
      >
        {highlights.map((highlight) => {
          return (
            viewer.viewerData?.me && (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                viewer={viewer.viewerData.me}
                router={router}
                mutate={mutate}
              />
            )
          )
        })}
      </VStack>
    </HStack>
  )
}

type HighlightCardProps = {
  highlight: Highlight
  viewer: UserBasicData
  router: NextRouter
  mutate: () => void
}

type HighlightAnnotationProps = {
  highlight: Highlight
}

function HighlightAnnotation({
  highlight,
}: HighlightAnnotationProps): JSX.Element {
  const [noteMode, setNoteMode] = useState<'edit' | 'preview'>('preview')
  const [annotation, setAnnotation] = useState(highlight.annotation)

  return (
    <HighlightViewNote
      targetId={highlight.id}
      text={annotation}
      placeHolder="Add notes to this highlight..."
      highlight={highlight}
      mode={noteMode}
      setEditMode={setNoteMode}
      updateHighlight={(highlight) => {
        setAnnotation(highlight.annotation)
      }}
    />
  )
}

function HighlightCard(props: HighlightCardProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [showConfirmDeleteHighlightId, setShowConfirmDeleteHighlightId] =
    useState<undefined | string>(undefined)
  const [labelsTarget, setLabelsTarget] = useState<Highlight | undefined>(
    undefined
  )

  const viewInReader = useCallback(
    (highlightId: string) => {
      const router = props.router
      const viewer = props.viewer
      const item = props.highlight.libraryItem

      if (!router || !router.isReady || !viewer || !item) {
        showErrorToast('Error navigating to highlight')
        return
      }

      router.push(
        {
          pathname: '/[username]/[slug]',
          query: {
            username: viewer.profile.username,
            slug: item.slug,
          },
          hash: highlightId,
        },
        `${viewer.profile.username}/${item.slug}#${highlightId}`,
        {
          scroll: false,
        }
      )
    },
    [props.highlight.libraryItem, props.viewer, props.router]
  )

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset({
        mainAxis: -25,
      }),
      size(),
    ],
    placement: 'top-end',
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([hover])

  return (
    <VStack
      ref={refs.setReference}
      {...getReferenceProps()}
      css={{
        width: '100%',
        fontFamily: '$inter',
        padding: '20px',
        marginBottom: '20px',
        bg: '$thBackground2',
        borderRadius: '8px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '$thBackground3',
        },
      }}
    >
      <Box
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
      >
        <HighlightHoverActions
          viewer={props.viewer}
          highlight={props.highlight}
          isHovered={isOpen ?? false}
          viewInReader={viewInReader}
          setLabelsTarget={setLabelsTarget}
          setShowConfirmDeleteHighlightId={setShowConfirmDeleteHighlightId}
        />
      </Box>
      <Box
        css={{
          width: '30px',
          height: '5px',
          backgroundColor: highlightColor(props.highlight.color),
          borderRadius: '2px',
        }}
      />
      <Box
        css={{
          color: '$thText',
          fontSize: '11px',
          marginTop: '10px',
          fontWeight: 300,
        }}
      >
        {timeAgo(props.highlight.updatedAt)}
      </Box>
      {props.highlight.quote && (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {props.highlight.quote}
        </ReactMarkdown>
      )}
      <HighlightAnnotation highlight={props.highlight} />
      {props.highlight.labels && (
        <HStack
          css={{
            marginBottom: '10px',
          }}
        >
          {props.highlight.labels.map((label) => {
            return (
              <LabelChip key={label.id} color={label.color} text={label.name} />
            )
          })}
        </HStack>
      )}
      <Box
        css={{
          color: '$thText',
          fontSize: '12px',
          lineHeight: '20px',
          fontWeight: 300,
          marginBottom: '10px',
        }}
      >
        {props.highlight.libraryItem?.title}
      </Box>
      <Box
        css={{
          color: '$grayText',
          fontSize: '12px',
          lineHeight: '20px',
          fontWeight: 300,
        }}
      >
        {props.highlight.libraryItem?.author}
      </Box>
      {showConfirmDeleteHighlightId && (
        <ConfirmationModal
          message={'Are you sure you want to delete this highlight?'}
          onAccept={() => {
            ;(async () => {
              const highlightId = showConfirmDeleteHighlightId
              const success = await deleteHighlightMutation(
                props.highlight.libraryItem?.id || '',
                showConfirmDeleteHighlightId
              )
              props.mutate()
              if (success) {
                showSuccessToast('Highlight deleted.', {
                  position: 'bottom-right',
                })
                const event = new CustomEvent('deleteHighlightbyId', {
                  detail: highlightId,
                })
                document.dispatchEvent(event)
              } else {
                showErrorToast('Error deleting highlight', {
                  position: 'bottom-right',
                })
              }
            })()
            setShowConfirmDeleteHighlightId(undefined)
          }}
          onOpenChange={() => setShowConfirmDeleteHighlightId(undefined)}
          icon={
            <TrashIcon
              size={40}
              color={theme.colors.grayTextContrast.toString()}
            />
          }
        />
      )}
      {labelsTarget && (
        <SetHighlightLabelsModalPresenter
          highlight={labelsTarget}
          highlightId={labelsTarget.id}
          onUpdate={(highlight) => {
            // Don't actually need to do something here
            console.log('update highlight: ', highlight)
          }}
          onOpenChange={() => {
            props.mutate()
            setLabelsTarget(undefined)
          }}
        />
      )}
    </VStack>
  )
}
