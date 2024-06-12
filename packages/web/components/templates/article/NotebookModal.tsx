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
import { X } from '@phosphor-icons/react'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { diff_match_patch } from 'diff-match-patch'
import { MenuTrigger } from '../../elements/MenuTrigger'
import { highlightsAsMarkdown } from '../homeFeed/HighlightItem'
import 'react-markdown-editor-lite/lib/index.css'
import { NotebookContent } from './Notebook'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'

type NotebookModalProps = {
  viewer: UserBasicData

  item: ReadableItem

  viewHighlightInReader: (arg: string) => void
  onClose: (highlights: Highlight[], deletedHighlights: Highlight[]) => void
}

export const getHighlightLocation = (patch: string): number | undefined => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || undefined
}

export function NotebookModal(props: NotebookModalProps): JSX.Element {
  const [showConfirmDeleteNote, setShowConfirmDeleteNote] = useState(false)
  const [allAnnotations, setAllAnnotations] = useState<Highlight[] | undefined>(
    undefined
  )

  const [deletedHighlights, setDeletedAnnotations] = useState<
    Highlight[] | undefined
  >(undefined)

  const handleClose = useCallback(() => {
    props.onClose(allAnnotations ?? [], deletedHighlights ?? [])
  }, [props, allAnnotations, deletedHighlights])

  const handleAnnotationsChange = useCallback((allAnnotations: Highlight[]) => {
    setAllAnnotations(allAnnotations)
  }, [])

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

  const viewInReader = useCallback(
    (highlightId: string) => {
      props.viewHighlightInReader(highlightId)
      handleClose()
    },
    [props, handleClose]
  )

  return (
    <ModalRoot defaultOpen onOpenChange={handleClose}>
      <ModalOverlay />
      <ModalContent
        tabIndex={-1}
        onInteractOutside={(event) => {
          event.preventDefault()
        }}
        css={{
          overflow: 'auto',
          bg: '$thLibraryBackground',
          width: '100%',
          height: 'unset',
          maxWidth: '748px',
          minHeight: '525px',
          '@mdDown': {
            top: '20px',
            width: '100%',
            height: '100%',
            maxHeight: 'unset',
            transform: 'translate(-50%)',
          },
        }}
        onKeyUp={(event) => {
          switch (event.key) {
            case 'Escape':
              handleClose()
              event.preventDefault()
              event.stopPropagation()
              break
          }
        }}
      >
        <HStack
          distribution="center"
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
            <Dropdown triggerElement={<MenuTrigger />}>
              <DropdownOption
                onSelect={() => {
                  exportHighlights()
                }}
                title="Export notebook"
              />
              <DropdownOption
                onSelect={() => {
                  setShowConfirmDeleteNote(true)
                }}
                title="Delete article note"
              />
            </Dropdown>
            <CloseButton close={handleClose} />
          </HStack>
        </HStack>
        <NotebookContent
          {...props}
          viewInReader={viewInReader}
          onAnnotationsChanged={handleAnnotationsChange}
          showConfirmDeleteNote={showConfirmDeleteNote}
          setShowConfirmDeleteNote={setShowConfirmDeleteNote}
        />
      </ModalContent>
    </ModalRoot>
  )
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
