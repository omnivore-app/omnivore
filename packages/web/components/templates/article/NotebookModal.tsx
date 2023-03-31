import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
} from '../../elements/ModalPrimitives'
import { HStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { useCallback, useState } from 'react'
import { ArrowsIn, ArrowsOut, X } from 'phosphor-react'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { diff_match_patch } from 'diff-match-patch'
import { MenuTrigger } from '../../elements/MenuTrigger'
import { highlightsAsMarkdown } from '../homeFeed/HighlightItem'
import 'react-markdown-editor-lite/lib/index.css'
import { Notebook } from './Notebook'

type NotebookModalProps = {
  pageId: string
  highlights: Highlight[]
  scrollToHighlight?: (arg: string) => void
  onClose: (highlights: Highlight[], deletedAnnotations: Highlight[]) => void
}

export const getHighlightLocation = (patch: string): number | undefined => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || undefined
}

type AnnotationInfo = {
  loaded: boolean

  note: Highlight | undefined
  noteId: string

  allAnnotations: Highlight[]
  deletedAnnotations: Highlight[]
}

export function NotebookModal(props: NotebookModalProps): JSX.Element {
  const [sizeMode, setSizeMode] = useState<'normal' | 'maximized'>('normal')
  const [showConfirmDeleteNote, setShowConfirmDeleteNote] = useState(false)
  const [allAnnotations, setAllAnnotations] =
    useState<Highlight[] | undefined>(undefined)
  const [deletedAnnotations, setDeletedAnnotations] =
    useState<Highlight[] | undefined>(undefined)

  const handleClose = useCallback(() => {
    props.onClose(allAnnotations ?? [], deletedAnnotations ?? [])
  }, [allAnnotations, deletedAnnotations])

  const handleAnnotationsChange = useCallback(
    (allAnnotations, deletedAnnotations) => {
      setAllAnnotations(allAnnotations)
      setDeletedAnnotations(deletedAnnotations)
    },
    []
  )

  const exportHighlights = useCallback(() => {
    ;(async () => {
      if (!allAnnotations) {
        showErrorToast('No highlights to export')
        return
      }
      const markdown = highlightsAsMarkdown(allAnnotations)
      await navigator.clipboard.writeText(markdown)
      showSuccessToast('Highlight copied')
    })()
  }, [allAnnotations])

  return (
    <ModalRoot defaultOpen onOpenChange={handleClose}>
      <ModalOverlay />
      <ModalContent
        onInteractOutside={(event) => {
          event.preventDefault()
        }}
        css={{
          overflow: 'auto',
          height: sizeMode === 'normal' ? 'unset' : '100%',
          maxWidth: sizeMode === 'normal' ? '640px' : '100%',
          minHeight: sizeMode === 'normal' ? '525px' : 'unset',
          '@mdDown': {
            top: '20px',
            width: '100%',
            height: '100%',
            maxHeight: 'unset',
            transform: 'translate(-50%)',
          },
        }}
      >
        <HStack
          distribution="between"
          alignment="center"
          css={{
            width: '100%',
            position: 'sticky',
            top: '0px',
            height: '50px',
            p: '20px',
            bg: '$grayBg',
            zIndex: 10,
          }}
        >
          <StyledText style="modalHeadline" css={{ color: '$thTextSubtle2' }}>
            Notebook
          </StyledText>
          <HStack
            css={{
              ml: 'auto',
              cursor: 'pointer',
              gap: '15px',
              mr: '-5px',
            }}
            distribution="center"
            alignment="center"
          >
            <SizeToggle mode={sizeMode} setMode={setSizeMode} />
            <Dropdown triggerElement={<MenuTrigger />}>
              <DropdownOption
                onSelect={() => {
                  exportHighlights()
                }}
                title="Export Notebook"
              />
              <DropdownOption
                onSelect={() => {
                  setShowConfirmDeleteNote(true)
                }}
                title="Delete Document Note"
              />
            </Dropdown>
            <CloseButton close={handleClose} />
          </HStack>
        </HStack>
        <Notebook
          {...props}
          sizeMode={sizeMode}
          onAnnotationsChanged={handleAnnotationsChange}
        />
      </ModalContent>
    </ModalRoot>
  )
}

type SizeToggleProps = {
  mode: 'normal' | 'maximized'
  setMode: (mode: 'normal' | 'maximized') => void
}

function CloseButton(props: { close: () => void }): JSX.Element {
  return (
    <Button
      style="plainIcon"
      css={{
        display: 'flex',
        padding: '3px',
        alignItems: 'center',
        borderRadius: '9999px',
        '&:hover': {
          bg: '#898989',
        },
      }}
      onClick={(event) => {
        props.close()
        event.preventDefault()
      }}
    >
      <X
        width={17}
        height={17}
        color={theme.colors.thTextContrast2.toString()}
      />
    </Button>
  )
}
function SizeToggle(props: SizeToggleProps): JSX.Element {
  return (
    <Button
      style="plainIcon"
      css={{
        display: 'flex',
        padding: '2px',
        alignItems: 'center',
        borderRadius: '9999px',
        '&:hover': {
          bg: '#898989',
        },
        '@mdDown': {
          display: 'none',
        },
      }}
      onClick={(event) => {
        props.setMode(props.mode == 'normal' ? 'maximized' : 'normal')
        event.preventDefault()
      }}
    >
      {props.mode == 'normal' ? (
        <ArrowsOut size="15" color={theme.colors.thTextContrast2.toString()} />
      ) : (
        <ArrowsIn size="15" color={theme.colors.thTextContrast2.toString()} />
      )}
    </Button>
  )
}
