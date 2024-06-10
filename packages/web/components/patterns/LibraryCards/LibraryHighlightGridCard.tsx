import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { useCallback, useMemo, useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { MetaStyle, timeAgo, TitleStyle } from './LibraryCardStyles'
import { styled } from '@stitches/react'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { LibraryItemNode } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { Button } from '../../elements/Button'
import { theme } from '../../tokens/stitches.config'
import { getHighlightLocation } from '../../templates/article/NotebookModal'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../HighlightView'
import { useRouter } from 'next/router'
import { showErrorToast } from '../../../lib/toastHelpers'

export const GridSeparator = styled(Box, {
  height: '1px',
  marginTop: '15px',
  backgroundColor: '$thBorderColor',
})

type LibraryHighlightGridCardProps = {
  viewer: UserBasicData
  item: LibraryItemNode

  deleteHighlight: (item: LibraryItemNode, highlight: Highlight) => void
}

export function LibraryHighlightGridCard(
  props: LibraryHighlightGridCardProps
): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const highlightCount = props.item.highlights?.length ?? 0
  const router = useRouter()
  const viewInReader = useCallback(
    (highlightId: string) => {
      if (!router || !router.isReady || !props.viewer) {
        showErrorToast('Error navigating to highlight')
        return
      }
      router.push(
        {
          pathname: '/[username]/[slug]',
          query: {
            username: props.viewer.profile.username,
            slug: props.item.slug,
          },
          hash: highlightId,
        },
        `${props.viewer.profile.username}/${props.item.slug}#${highlightId}`,
        {
          scroll: false,
        }
      )
    },
    [router, props]
  )

  const sortedHighlights = useMemo(() => {
    const sorted = (a: number, b: number) => {
      if (a < b) {
        return -1
      }
      if (a > b) {
        return 1
      }
      return 0
    }

    if (!props.item.highlights) {
      return []
    }

    return props.item.highlights
      .filter((h) => h.type === 'HIGHLIGHT')
      .sort((a: Highlight, b: Highlight) => {
        if (a.highlightPositionPercent && b.highlightPositionPercent) {
          return sorted(a.highlightPositionPercent, b.highlightPositionPercent)
        }
        // We do this in a try/catch because it might be an invalid diff
        // With PDF it will definitely be an invalid diff.
        try {
          const aPos = getHighlightLocation(a.patch)
          const bPos = getHighlightLocation(b.patch)
          if (aPos && bPos) {
            return sorted(aPos, bPos)
          }
        } catch {}
        return a.createdAt.localeCompare(b.createdAt)
      })
  }, [props.item.highlights])

  return (
    <VStack
      css={{
        pl: '15px',
        padding: '15px',
        width: '100%',
        height: '100%',
        marginTop: '20px',
        background: 'white',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '$thBorderColor',
        cursor: 'pointer',
        bg: '$thBackground3',
      }}
      alignment="start"
      distribution="start"
    >
      {!expanded && (
        <HStack
          css={{
            ...MetaStyle,
            minHeight: '35px',
          }}
          distribution="start"
        >
          <Box>
            {timeAgo(props.item.savedAt)}
            {` `}
            {props.item.wordsCount ?? 0 > 0
              ? `  • ${Math.max(
                  1,
                  Math.round((props.item.wordsCount ?? 0) / 235)
                )} min read`
              : null}
            {props.item.highlights?.length ?? 0 > 0
              ? `  • ${props.item.highlights?.length} highlights`
              : null}
          </Box>
        </HStack>
      )}
      <VStack
        alignment="start"
        distribution="start"
        css={{ height: '100%', width: '100%' }}
      >
        <Box
          css={{
            ...TitleStyle,
          }}
        >
          {props.item.title}
        </Box>
        {expanded && (
          <>
            <GridSeparator css={{ width: '100%' }} />
            <VStack
              css={{ height: '100%', width: '100%', mt: '20px', gap: '20px' }}
              distribution="start"
            >
              {sortedHighlights.map((highlight) => (
                <SpanBox key={`hv-${highlight.id}`} css={{ width: '100%' }}>
                  <HighlightView
                    key={highlight.id}
                    viewer={props.viewer}
                    item={props.item}
                    highlight={highlight}
                    viewInReader={viewInReader}
                    setLabelsTarget={() => {
                      console.log('TODO: set labels')
                    }}
                    setShowConfirmDeleteHighlightId={() => {
                      console.log('TODO: confirm delete')
                    }}
                    updateHighlight={(highlight) => {
                      console.log('updated highlight: ', highlight)
                    }}
                  />
                  <SpanBox css={{ height: '35px' }} />
                </SpanBox>
              ))}
            </VStack>
          </>
        )}
        <Box css={{ width: '100%' }}>
          {!expanded ? (
            <Button
              css={{
                mt: '30px',
                display: 'flex',
                gap: '5px',
                px: '10px',
                py: '6px',
                fontSize: '11px',
                fontFamily: '$inter',
                fontWeight: '500',
                bg: '$thBackground2',
                color: '$thTextSubtle2',
                alignItems: 'center',
                border: '1px solid transparent',
              }}
              onClick={(event) => {
                setExpanded(true)
                event.preventDefault()
              }}
            >
              {`View ${highlightCount} highlight${
                highlightCount > 1 ? 's' : ''
              }`}
              <CaretDown
                size={10}
                weight="bold"
                color={theme.colors.thHighContrast.toString()}
              />
            </Button>
          ) : (
            <Button
              style="plainIcon"
              css={{
                width: '25px',
                height: '25px',
                bg: '$thBackground2',
                pt: '2px',
                borderRadius: '1000px',
              }}
              onClick={(event) => {
                setExpanded(false)
                event.preventDefault()
              }}
            >
              <CaretUp size={15} weight="bold" color="#EC6A5E" />
            </Button>
          )}
        </Box>
      </VStack>
    </VStack>
  )
}
