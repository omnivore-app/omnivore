import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../../elements/ModalPrimitives'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { styled, theme } from '../../tokens/stitches.config'
import { Label, useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { ChangeEvent, useCallback, useRef, useState, useMemo, useEffect, MouseEventHandler } from 'react'
import { setLabelsMutation } from '../../../lib/networking/mutations/setLabelsMutation'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { LabelChip } from '../../elements/LabelChip'
import { Check, Circle, Pen, PencilSimple, PencilSimpleLine, Plus, TagSimple } from 'phosphor-react'
import Link from 'next/link'
import { isTouchScreenDevice } from '../../../lib/deviceType'

type EditLabelsControlProps = {
  // labels: Label[]
  // article: ArticleAttributes
  // onOpenChange: (open: boolean) => void
  // setLabels: (labels: Label[]) => void
}

type HeaderProps = {
  filterText: string
  focused: boolean
  parentRef: React.RefObject<HTMLDivElement>
  setFilterText: (text: string) => void
}

const FormInput = styled('input', {
  width: '100%',
  fontSize: '16px',
  fontFamily: 'inter',
  fontWeight: 'normal',
  lineHeight: '1.8',
  color: '$grayTextContrast',
  '&:focus': {
    outline: 'none',
  },
})

const StyledLabel = styled('label', {
  display: 'flex',
  justifyContent: 'flex-start',
  '&:focus': {
    bg: '$grayBgActive',
  },
})

const useToggleLabels = () => {
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])

  const isSelected = useCallback((label: Label): boolean => {
    return selectedLabels.some((other) => {
      return other.id === label.id
    })
  }, [selectedLabels])

  const toggleLabel = useCallback((label: Label) => {
    if (isSelected(label)) {
      setSelectedLabels(selectedLabels.filter((other) => {
        return other.id !== label.id
      }))
    } else {
      setSelectedLabels([...selectedLabels, label])
    }
  }, [isSelected, selectedLabels])

  return [isSelected, toggleLabel]
}

function Header(props: HeaderProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (props.focused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [props.focused])

  return (
    <VStack css={{ width: '100%', my: '0px', borderBottom: '1px solid $grayBorder'}}>
      <Box css={{ 
        width: '100%',
        my: '14px',
        px: '14px',
      }}>
        <FormInput
          ref={inputRef}
          type="text"
          tabIndex={props.focused ? 0 : -1}
          autoFocus={!isTouchScreenDevice()}
          value={props.filterText}
          placeholder="Filter for label"
          onChange={(event) => {
            props.setFilterText(event.target.value)
          }}
          css={{
            border: '1px solid $grayBorder',
            borderRadius: '8px',
            width: '100%',
            bg: 'transparent',
            fontSize: '16px',
            textIndent: '8px',
            marginBottom: '2px',
            color: '$grayTextContrast',
            '&:focus': {
              outline: 'none',
              boxShadow: '0px 0px 2px 2px rgba(255, 234, 159, 0.56)',
            },
          }}
        />
    </Box>
  </VStack>)
}

type LabelListItemProps = {
  label: Label
  focused: boolean
  selected: boolean
  toggleLabel: (label: Label) => void
}

function LabelListItem(props: LabelListItemProps): JSX.Element {
  const ref = useRef<HTMLLabelElement>(null)
  const { label, focused, selected } = props

  useEffect(() => {
    if (props.focused && ref.current) {
      ref.current.focus()
    }
  }, [props.focused])

  return (
    <StyledLabel
      ref={ref}
      css={{
        width: '100%',
        height: '42px',
        borderBottom: '1px solid $grayBorder',
        bg: props.focused ? '$grayBgActive' : 'unset',
      }}
      tabIndex={props.focused ? 0 : -1}
      onClick={(event) => {
        event.preventDefault()
        props.toggleLabel(label)
        ref.current?.blur()
      }}
    >
      <input autoFocus={focused} hidden={true} type="checkbox" checked={selected} readOnly />
      <Box css={{ pl: '10px', width: '32px', display: 'flex', alignItems: 'center' }}>
        {selected && <Check size={15} color={theme.colors.grayText.toString()} weight='bold' />}
      </Box>
      <Box css={{ width: '30px', height: '100%', display: 'flex', alignItems: 'center' }}>
        <Circle width={22} height={22} color={label.color} weight='fill' />
      </Box>
      <Box css={{ overflow: 'clip', height: '100%', display: 'flex', alignItems: 'center' }}>
        <StyledText style="caption">{label.name}</StyledText>
      </Box>
      <Box css={{ pl: '10px', width: '40px', marginLeft: 'auto', display: 'flex', alignItems: 'center'  }}>
        {selected && <CrossIcon
          size={14}
          strokeColor={theme.colors.grayText.toString()}
        />}
      </Box>
    </StyledLabel>
  )
}

export function EditLabelsControl(props: EditLabelsControlProps): JSX.Element {
  const parentRef = useRef<HTMLDivElement>(null)
  const [filterText, setFilterText] = useState('')
  const { labels } = useGetLabelsQuery()

  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])

  const isSelected = useCallback((label: Label): boolean => {
    return selectedLabels.some((other) => {
      return other.id === label.id
    })
  }, [selectedLabels])

  const toggleLabel = useCallback((label: Label) => {
    if (isSelected(label)) {
      setSelectedLabels(selectedLabels.filter((other) => {
        return other.id !== label.id
      }))
    } else {
      setSelectedLabels([...selectedLabels, label])
    }
  }, [isSelected, selectedLabels])

  const filteredLabels = useMemo(() => {
    if (!labels) {
      return []
    }
    return labels.filter((label) => {
      return label.name.toLowerCase().includes(filterText.toLowerCase())
    })
  }, [labels, filterText])

  useEffect(() => {
    setFocusedIndex(undefined)
  }, [filterText])

  // Move focus through the labels list on tab or arrow up/down keys
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>(undefined)
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (focusedIndex) {
        setFocusedIndex(Math.max(0, focusedIndex - 1))
      } else {
        setFocusedIndex(undefined)
      }
    }
    if (event.key === 'ArrowDown' || event.key === 'Tab') {
      event.preventDefault()
      if (focusedIndex === undefined) {
        setFocusedIndex(0)
      } else {
        setFocusedIndex(Math.min(filteredLabels.length - 1, focusedIndex + 1))
      }
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (focusedIndex !== undefined) {
        const label = filteredLabels[focusedIndex]
        if (label) {
          toggleLabel(label)
        }
      }
    }
  }, [filteredLabels, focusedIndex])

  return (
    <VStack
      ref={parentRef}
      distribution="start"
      onKeyDown={handleKeyDown}
      css={{ 
        p: '0',
        maxHeight: '92%',
        maxWidth: '265px',
        '@mdDown': {
          maxWidth: '100%',
          maxHeight: '92%',
        },
    }}>
      <Header
        parentRef={parentRef}
        focused={focusedIndex === undefined}
        setFilterText={setFilterText} filterText={filterText}
      />
      <VStack css={{ flexGrow: '1', overflow: 'scroll', width: '100%', height: '100%', maxHeight: '400px',  }}>
        {filteredLabels &&
          filteredLabels.map((label, idx) => (
            <LabelListItem
              key={label.id}
              label={label}
              focused={idx === focusedIndex}
              selected={isSelected(label)}
              toggleLabel={toggleLabel}
            />
          ))}
      </VStack>
      {filterText && (
        <Button style='modalOption' css={{
          pl: '26px', color: theme.colors.grayText.toString(), height: '42px', borderBottom: '1px solid $grayBorder'
        }} 
          onClick={() => {
            // props.createLabel(filterText)
            // setFilterText('')
          }}
        >
          <HStack alignment='center' distribution='start' css={{ gap: '8px' }}>
            <Plus size={18} color={theme.colors.grayText.toString()} />
            <SpanBox css={{ fontSize: '12px' }}>{`Create new label "${filterText}"`}</SpanBox>
            </HStack>
        </Button>)}
        {/* Footer */}
      <HStack  distribution="start"  alignment="center" css={{
          ml: '20px', gap: '8px', width: '100%', fontSize: '12px', p: '8px', height: '42px',
          'a:link': {
            textDecoration: 'none',
          },
          'a:visited': {
            color: theme.colors.grayText.toString(),
          },
        }}
      >
        <PencilSimple size={18} color={theme.colors.grayText.toString()} /> 
        <Link href="/settings/labels">Edit labels</Link>
      </HStack>
    </VStack>
  )
}