import { useState } from 'react'
import { theme } from '../../tokens/stitches.config'
import { Box, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { BulkAction } from '../../../lib/networking/mutations/bulkActionMutation'
import { ArchiveIcon } from '../../elements/icons/ArchiveIcon'
import { LabelIcon } from '../../elements/icons/LabelIcon'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { AddBulkLabelsModal } from '../article/AddBulkLabelsModal'
import { X } from '@phosphor-icons/react'
import { MultiSelectMode } from './LibraryHeader'
import { HeaderCheckboxIcon } from '../../elements/icons/HeaderCheckboxIcon'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { MarkAsReadIcon } from '../../elements/icons/MarkAsReadIcon'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'

export type MultiSelectProps = {
  viewer: UserBasicData | undefined

  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void

  numItemsSelected: number
  multiSelectMode: MultiSelectMode
  setMultiSelectMode: (mode: MultiSelectMode) => void

  performMultiSelectAction: (action: BulkAction, labelIds?: string[]) => void
}

export const MultiSelectControls = (props: MultiSelectProps): JSX.Element => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showLabelsModal, setShowLabelsModal] = useState(false)
  // Don't change on immediate hover, the button has to be blurred at least once
  const [hoveredOut, setHoveredOut] = useState(false)
  const [hoverColor, setHoverColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )

  return (
    <Box
      css={{
        height: '38px',
        width: '100%',
        maxWidth: '521px',
        bg: '$thLibrarySearchbox',
        borderRadius: '6px',
        boxShadow:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06);',
      }}
      onMouseLeave={(event) => {
        setHoveredOut(true)
        event.preventDefault()
      }}
    >
      <HStack
        alignment="center"
        distribution="end"
        css={{
          width: '100%',
          height: '100%',
          pr: '10px',
        }}
        onClick={(e) => {
          e.preventDefault()
        }}
      >
        <HStack
          alignment="center"
          distribution="center"
          css={{
            width: '53px',
            height: '100%',
            display: 'flex',
            bg: props.multiSelectMode !== 'off' ? '$ctaBlue' : 'transparent',
            borderTopLeftRadius: '6px',
            borderBottomLeftRadius: '6px',
            '--checkbox-color': 'white',
            '&:hover': {
              bg: hoveredOut ? '$thLibraryMultiselectHover' : '$ctaBlue',
              '--checkbox-color': hoveredOut
                ? 'var(--colors-thLibraryMultiselectCheckboxHover)'
                : 'white',
            },
          }}
        >
          <CheckBoxButton {...props} />
        </HStack>
        <HStack
          alignment="center"
          distribution="start"
          css={{
            gap: '15px',
            pl: '15px',
            border: '2px solid transparent',
            width: '100%',
            height: '100%',
            '@mdDown': {
              pl: '5px',
            },
          }}
        >
          <SpanBox
            css={{
              display: 'flex',
              fontSize: '14px',
              fontFamily: '$display',
              marginRight: 'auto',
              '@mdDown': {
                display: 'none',
              },
            }}
          >
            {props.numItemsSelected} items selected
          </SpanBox>
          <SpanBox
            css={{
              display: 'none',
              fontSize: '14px',
              fontFamily: '$display',
              marginRight: 'auto',
              '@mdDown': {
                display: 'flex',
              },
            }}
          >
            {props.numItemsSelected} items
          </SpanBox>
          <ArchiveButton {...props} />
          <AddLabelsButton setShowLabelsModal={setShowLabelsModal} />
          <RemoveItemsButton setShowConfirmDelete={setShowConfirmDelete} />
          <MarkAsReadButton {...props} />
          {showConfirmDelete && (
            <ConfirmationModal
              message={`You are about to delete ${props.numItemsSelected} items. All associated notes and highlights will be deleted.`}
              acceptButtonLabel={'Delete'}
              onAccept={() => {
                props.performMultiSelectAction(BulkAction.DELETE)
              }}
              onOpenChange={(open: boolean) => {
                setShowConfirmDelete(false)
              }}
            />
          )}
          {showLabelsModal && (
            <AddBulkLabelsModal
              bulkSetLabels={(labels: Label[]) => {
                const labelIds = labels.map((l) => l.id)
                props.performMultiSelectAction(BulkAction.ADD_LABELS, labelIds)
              }}
              onOpenChange={(open: boolean) => {
                setShowLabelsModal(false)
              }}
            />
          )}
          <CancelButton {...props} />
        </HStack>
      </HStack>
    </Box>
  )
}

export const CheckBoxButton = (props: MultiSelectProps): JSX.Element => {
  return (
    <Button
      title="Select multiple"
      style="plainIcon"
      css={{ display: 'flex', '&:hover': { opacity: '1.0' } }}
      onClick={(e) => {
        switch (props.multiSelectMode) {
          case 'off':
          case 'none':
          case 'some':
            props.setMultiSelectMode('visible')
            break
          default:
            props.setMultiSelectMode('off')
            break
        }
        e.preventDefault()
      }}
    >
      <HeaderCheckboxIcon multiSelectMode={props.multiSelectMode} />
    </Button>
  )
}

export const ArchiveButton = (props: MultiSelectProps): JSX.Element => {
  const [color, setColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )
  return (
    <Button
      title="Archive"
      css={{
        p: '5px',
        display: 'flex',
        '&:hover': {
          bg: '$ctaBlue',
          borderRadius: '100px',
          opacity: 1.0,
        },
      }}
      onMouseEnter={(event) => {
        setColor('white')
        event.preventDefault()
      }}
      onMouseLeave={(event) => {
        setColor(theme.colors.thTextContrast2.toString())
        event.preventDefault()
      }}
      style="plainIcon"
      onClick={(e) => {
        props.performMultiSelectAction(BulkAction.ARCHIVE)
        e.preventDefault()
      }}
    >
      <ArchiveIcon size={20} color={color} />
    </Button>
  )
}

export const MarkAsReadButton = (props: MultiSelectProps): JSX.Element => {
  const [color, setColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )
  return (
    <Button
      title="Mark As Read"
      css={{
        p: '5px',
        display: 'flex',
        '&:hover': {
          bg: '$ctaBlue',
          borderRadius: '100px',
          opacity: 1.0,
        },
      }}
      onMouseEnter={(event) => {
        setColor('white')
        event.preventDefault()
      }}
      onMouseLeave={(event) => {
        setColor(theme.colors.thTextContrast2.toString())
        event.preventDefault()
      }}
      style="plainIcon"
      onClick={(e) => {
        props.performMultiSelectAction(BulkAction.MARK_AS_READ)
        e.preventDefault()
      }}
    >
      <MarkAsReadIcon size={20} color={color} />
    </Button>
  )
}

type AddLabelsButtonProps = {
  setShowLabelsModal: (set: boolean) => void
}

export const AddLabelsButton = (props: AddLabelsButtonProps): JSX.Element => {
  const [color, setColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )
  return (
    <Button
      title="Add labels"
      css={{
        p: '5px',
        display: 'flex',
        '&:hover': {
          bg: '$ctaBlue',
          borderRadius: '100px',
          opacity: 1.0,
        },
      }}
      onMouseEnter={(event) => {
        setColor('white')
        event.preventDefault()
      }}
      onMouseLeave={(event) => {
        setColor(theme.colors.thTextContrast2.toString())
        event.preventDefault()
      }}
      style="plainIcon"
      onClick={(e) => {
        props.setShowLabelsModal(true)
        e.preventDefault()
      }}
    >
      <LabelIcon size={20} color={color} />
    </Button>
  )
}

type RemoveItemsButtonProps = {
  setShowConfirmDelete: (set: boolean) => void
}

export const RemoveItemsButton = (
  props: RemoveItemsButtonProps
): JSX.Element => {
  const [color, setColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )
  return (
    <Button
      title="Remove"
      css={{
        p: '5px',
        display: 'flex',
        '&:hover': {
          bg: '$ctaBlue',
          borderRadius: '100px',
          opacity: 1.0,
        },
      }}
      onMouseEnter={(event) => {
        setColor('white')
        event.preventDefault()
      }}
      onMouseLeave={(event) => {
        setColor(theme.colors.thTextContrast2.toString())
        event.preventDefault()
      }}
      style="plainIcon"
      onClick={(e) => {
        props.setShowConfirmDelete(true)
        e.preventDefault()
      }}
    >
      <TrashIcon size={20} color={color} />
    </Button>
  )
}

export const CancelButton = (props: MultiSelectProps): JSX.Element => {
  const [color, setColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )
  return (
    <Button
      title="Cancel"
      css={{
        p: '5px',
        display: 'flex',
        '&:hover': {
          bg: '$ctaBlue',
          borderRadius: '100px',
          opacity: 1.0,
        },
      }}
      onMouseEnter={(event) => {
        setColor('white')
        event.preventDefault()
      }}
      onMouseLeave={(event) => {
        setColor(theme.colors.thTextContrast2.toString())
        event.preventDefault()
      }}
      style="plainIcon"
      onClick={(e) => {
        props.setMultiSelectMode('off')
        e.preventDefault()
      }}
    >
      <X width={19} height={19} color={color} />
    </Button>
  )
}
