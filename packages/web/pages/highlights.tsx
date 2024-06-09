import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LabelChip } from '../components/elements/LabelChip'
import { Box, HStack, VStack } from '../components/elements/LayoutPrimitives'
import { HighlightViewNote } from '../components/patterns/HighlightNotes'
import { EmptyHighlights } from '../components/templates/homeFeed/EmptyHighlights'
import { LibraryFilterMenu } from '../components/templates/navMenu/LibraryMenu'
import { useApplyLocalTheme } from '../lib/hooks/useApplyLocalTheme'
import { useFetchMore } from '../lib/hooks/useFetchMoreScroll'
import { Highlight } from '../lib/networking/fragments/highlightFragment'
import { useGetHighlights } from '../lib/networking/queries/useGetHighlights'
import { highlightColor } from '../lib/themeUpdater'

const PAGE_SIZE = 10

export default function HighlightsPage(): JSX.Element {
  const router = useRouter()
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [_, setShowAddLinkModal] = useState(false)

  useApplyLocalTheme()

  const { isLoading, isValidating, mutate, setSize, size, data, error } =
    useGetHighlights({
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
          return <HighlightCard key={highlight.id} highlight={highlight} />
        })}
      </VStack>
    </HStack>
  )
}

type HighlightCardProps = {
  highlight: Highlight
}

type HighlightAnnotationProps = HighlightCardProps

function HighlightAnnotation({ highlight }: HighlightAnnotationProps): JSX.Element {
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
  return (
    <Box
      css={{
        width: '100%',
        fontFamily: '$inter',
        padding: '20px',
        marginBottom: '20px',
        bg: '$thBackground2',
        borderRadius: '8px',
      }}
    >
      <VStack
        css={{
          width: '100%',
        }}
      >
        <Box
          css={{
            width: '30px',
            height: '5px',
            backgroundColor: highlightColor(props.highlight.color),
            borderRadius: '2px',
          }}
        />
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
                <LabelChip
                  key={label.id}
                  color={label.color}
                  text={label.name}
                />
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
      </VStack>
    </Box>
  )
}
