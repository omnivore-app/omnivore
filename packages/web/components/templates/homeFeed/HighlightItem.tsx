import Link from 'next/link'
import { DotsThreeVertical } from '@phosphor-icons/react'
import { useCallback } from 'react'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import {
  Dropdown,
  DropdownOption,
  DropdownSeparator,
} from '../../elements/DropdownElements'
import { Box, VStack } from '../../elements/LayoutPrimitives'

import { styled, theme } from '../../tokens/stitches.config'
import { getHighlightLocation } from '../article/Notebook'

type HighlightsMenuProps = {
  viewer: UserBasicData

  item: ReadableItem
  highlight: Highlight

  viewInReader: (highlightId: string) => void

  setLabelsTarget: (target: Highlight) => void
  setShowConfirmDeleteHighlightId: (set: string) => void
}

const StyledLinkItem = styled('a', {
  display: 'flex',
  fontSize: '14px',
  fontWeight: '400',
  py: '10px',
  px: '15px',
  borderRadius: 3,
  cursor: 'pointer',
  color: '$utilityTextDefault',
  textDecoration: 'none',

  '&:hover': {
    outline: 'none',
    backgroundColor: '$grayBgHover',
  },
})

export function HighlightsMenu(props: HighlightsMenuProps): JSX.Element {
  const copyHighlight = useCallback(() => {
    const quote = props.highlight.quote
    if (quote) {
      ;(async () => {
        await navigator.clipboard.writeText(quote)
        showSuccessToast('Highlight copied')
      })()
    } else {
      showErrorToast('No highlight text.')
    }
  }, [props.highlight])

  return (
    <VStack
      distribution="center"
      alignment="center"
      css={{ height: '100%', pl: '5px', pt: '5px' }}
    >
      <Dropdown
        triggerElement={
          <Box
            css={{
              marginLeft: 'auto',
              display: 'flex',
              height: '20px',
              width: '20px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '1000px',
              '&:hover': {
                bg: '#898989',
              },
            }}
          >
            <DotsThreeVertical
              size={20}
              color={theme.colors.thTextContrast2.toString()}
              weight="bold"
            />
          </Box>
        }
      >
        <DropdownOption
          onSelect={async () => {
            copyHighlight()
          }}
          title="Copy"
        />
        <DropdownOption
          onSelect={() => {
            props.setLabelsTarget(props.highlight)
          }}
          title="Labels"
        />
        <DropdownOption
          onSelect={() => {
            props.setShowConfirmDeleteHighlightId(props.highlight.id)
          }}
          title="Delete"
        />
        <DropdownSeparator />
        <Link
          href={`/${props.viewer.profile.username}/${props.item.slug}#${props.highlight.id}`}
          legacyBehavior
        >
          <StyledLinkItem
            onClick={(event) => {
              console.log('event.ctrlKey: ', event.ctrlKey, event.metaKey)
              if (event.ctrlKey || event.metaKey) {
                window.open(
                  `/${props.viewer.profile.username}/${props.item.slug}#${props.highlight.id}`,
                  '_blank'
                )
                return
              }
              props.viewInReader(props.highlight.id)
              event.preventDefault()
              event.stopPropagation()
            }}
          >
            View In Reader
          </StyledLinkItem>
        </Link>
      </Dropdown>
    </VStack>
  )
}

const sortHighlights = (highlights: Highlight[]) => {
  const sorted = (a: number, b: number) => {
    if (a < b) {
      return -1
    }
    if (a > b) {
      return 1
    }
    return 0
  }

  return (highlights ?? [])
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
}

export function highlightAsMarkdown(highlight: Highlight) {
  let buffer = `> ${highlight.quote}`
  if (highlight.annotation) {
    buffer += `\n\n${highlight.annotation}`
  }
  buffer += '\n'
  return buffer
}

export function highlightsAsMarkdown(highlights: Highlight[]) {
  const noteMD = highlights.find((h) => h.type == 'NOTE')

  const highlightMD = sortHighlights(highlights)
    .filter((h) => h.type == 'HIGHLIGHT')
    .map((highlight) => {
      return highlightAsMarkdown(highlight)
    })
    .join('\n\n')

  if (noteMD?.annotation) {
    return `${noteMD.annotation}\n\n${highlightMD}`
  }
  return highlightMD
}
