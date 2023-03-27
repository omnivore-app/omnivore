import { DotsThreeVertical } from 'phosphor-react'
import { useCallback } from 'react'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { Box } from '../../elements/LayoutPrimitives'

import { theme } from '../../tokens/stitches.config'

type HighlightsMenuProps = {
  highlight: Highlight

  setLabelsTarget: (target: Highlight) => void
  setShowConfirmDeleteHighlightId: (set: string) => void
}

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
    <Dropdown
      triggerElement={
        <Box
          css={{
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
    </Dropdown>
  )
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

  const highlightMD = highlights
    .filter((h) => h.type == 'HIGHLIGHT')
    .map((highlight) => {
      return highlightAsMarkdown(highlight)
    })
    .join('\n\n')

  if (noteMD) {
    return `${noteMD.annotation}\n\n${highlightMD}`
  }
  return highlightMD
}
