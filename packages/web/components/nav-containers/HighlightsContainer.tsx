import { NavigationLayout } from '../templates/NavigationLayout'
import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { useFetchMore } from '../../lib/hooks/useFetchMoreScroll'
import { useCallback, useMemo, useState } from 'react'
import { useGetHighlights } from '../../lib/networking/queries/useGetHighlights'
import { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { NextRouter, useRouter } from 'next/router'
import {
  UserBasicData,
  useGetViewerQuery,
} from '../../lib/networking/queries/useGetViewerQuery'
import { SetHighlightLabelsModalPresenter } from '../templates/article/SetLabelsModalPresenter'
import { TrashIcon } from '../elements/icons/TrashIcon'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { ConfirmationModal } from '../patterns/ConfirmationModal'
import { deleteHighlightMutation } from '../../lib/networking/mutations/deleteHighlightMutation'
import { LabelChip } from '../elements/LabelChip'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { timeAgo } from '../patterns/LibraryCards/LibraryCardStyles'
import { HighlightHoverActions } from '../patterns/HighlightHoverActions'
import {
  autoUpdate,
  offset,
  size,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react'
import { highlightColor } from '../../lib/themeUpdater'

import { HighlightViewNote } from '../patterns/HighlightNotes'
import { theme } from '../tokens/stitches.config'

const PAGE_SIZE = 10

export function HighlightsContainer(): JSX.Element {
  const router = useRouter()
  const viewer = useGetViewerQuery()
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [_, setShowAddLinkModal] = useState(false)

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

  return (
    <VStack
      css={{
        padding: '20px',
        margin: '30px',
        '@mdDown': {
          margin: '0px',
          marginTop: '50px',
        },
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
  const [labelsTarget, setLabelsTarget] =
    useState<Highlight | undefined>(undefined)

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
        bg: '$readerBg',
        borderRadius: '8px',
        cursor: 'pointer',
        border: '1px solid $thLeftMenuBackground',
        '&:focus': {
          outline: 'none',
          '> div': {
            outline: 'none',
            bg: '$thBackgroundActive',
          },
        },
        '&:hover': {
          bg: '$thBackgroundActive',
          boxShadow: '$cardBoxShadow',
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
