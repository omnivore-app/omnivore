import { useState } from 'react'
import { Box } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { theme } from '../tokens/stitches.config'
import { BookOpen, Copy } from '@phosphor-icons/react'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { TrashIcon } from '../elements/icons/TrashIcon'
import { LabelIcon } from '../elements/icons/LabelIcon'

type HighlightHoverActionsProps = {
  viewer: UserBasicData
  highlight: Highlight

  isHovered: boolean

  viewInReader: (highlightId: string) => void

  setLabelsTarget: (target: Highlight) => void
  setShowConfirmDeleteHighlightId: (set: string) => void
}

export const HighlightHoverActions = (props: HighlightHoverActionsProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Box
      css={{
        height: '33px',
        minWidth: '150px',
        bg: '$thBackground',
        display: 'flex',

        pt: '0px',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid $thBackground5',
        borderRadius: '5px',

        gap: '5px',
        px: '5px',
        visibility: props.isHovered || menuOpen ? 'visible' : 'hidden',
        '&:hover': {
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06);',
        },
      }}
    >
      <Button
        style="hoverActionIcon"
        onClick={(event) => {
          const quote = props.highlight.quote
          if (quote && navigator.clipboard) {
            ;(async () => {
              const text = props.highlight.annotation
                ? `> ${quote}\n${props.highlight.annotation}`
                : quote
              await navigator.clipboard.writeText(text)
              showSuccessToast('Highlight copied', {
                position: 'bottom-right',
              })
            })()
          } else {
            showErrorToast('No highlight text.', {
              position: 'bottom-right',
            })
          }
          event.preventDefault()
        }}
      >
        <Copy size={19} color={theme.colors.thNotebookSubtle.toString()} />
      </Button>
      <Button
        style="hoverActionIcon"
        onClick={(event) => {
          props.setLabelsTarget(props.highlight)
          event.preventDefault()
        }}
      >
        <LabelIcon size={18} color={theme.colors.thNotebookSubtle.toString()} />
      </Button>
      <Button
        style="hoverActionIcon"
        onClick={(event) => {
          props.viewInReader(props.highlight.id)
          event.preventDefault()
        }}
      >
        <BookOpen size={18} color={theme.colors.thNotebookSubtle.toString()} />
      </Button>
      <Button
        style="hoverActionIcon"
        onClick={(event) => {
          props.setShowConfirmDeleteHighlightId(props.highlight.id)
          event.preventDefault()
        }}
      >
        <TrashIcon size={18} color={theme.colors.thNotebookSubtle.toString()} />
      </Button>
    </Box>
  )
}
