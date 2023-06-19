import { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { styled, theme } from '../../tokens/stitches.config'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { Check, Circle, PencilSimple, Plus } from 'phosphor-react'
import { createLabelMutation } from '../../../lib/networking/mutations/createLabelMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { randomLabelColorHex } from '../../../utils/settings-page/labels/labelColorObjects'
import { useRouter } from 'next/router'
import { LabelsPicker } from '../../elements/LabelsPicker'

export interface LabelsProvider {
  labels?: Label[]
}

type SetLabelsControlProps = {
  provider: LabelsProvider

  inputValue: string
  setInputValue: (value: string) => void
  clearInputState: () => void

  selectedLabels: Label[]
  setSelectedLabels: (labels: Label[]) => void

  onLabelsUpdated?: (labels: Label[]) => void

  tabCount: number
  setTabCount: (count: number) => void
  tabStartValue: string
  setTabStartValue: (value: string) => void

  highlightLastLabel: boolean
  setHighlightLastLabel: (set: boolean) => void

  deleteLastLabel: () => void
  selectOrCreateLabel: (value: string) => void
}

type HeaderProps = {
  focused: boolean
  resetFocusedIndex: () => void

  inputValue: string
  setInputValue: (value: string) => void
  clearInputState: () => void

  selectedLabels: Label[]
  setSelectedLabels: (labels: Label[]) => void

  tabCount: number
  setTabCount: (count: number) => void
  tabStartValue: string
  setTabStartValue: (value: string) => void

  highlightLastLabel: boolean
  setHighlightLastLabel: (set: boolean) => void

  deleteLastLabel: () => void
  selectOrCreateLabel: (value: string) => void
}

const StyledLabel = styled('label', {
  display: 'flex',
  justifyContent: 'flex-start',
})

function Header(props: HeaderProps): JSX.Element {
  return (
    <VStack css={{ width: '100%', my: '0px' }}>
      <Box
        css={{
          width: '100%',
          my: '14px',
          px: '14px',
        }}
      >
        <LabelsPicker
          focused={props.focused}
          inputValue={props.inputValue}
          setInputValue={props.setInputValue}
          selectedLabels={props.selectedLabels}
          setSelectedLabels={props.setSelectedLabels}
          tabCount={props.tabCount}
          setTabCount={props.setTabCount}
          tabStartValue={props.tabStartValue}
          setTabStartValue={props.setTabStartValue}
          highlightLastLabel={props.highlightLastLabel}
          setHighlightLastLabel={props.setHighlightLastLabel}
          onFocus={() => {
            props.resetFocusedIndex()
          }}
          clearInputState={props.clearInputState}
          deleteLastLabel={props.deleteLastLabel}
          selectOrCreateLabel={props.selectOrCreateLabel}
        />
      </Box>
    </VStack>
  )
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
        p: '15px',
        bg: props.focused ? '$grayBgActive' : 'unset',
        '&:focus-visible': {
          outline: 'none',
        },
      }}
      tabIndex={props.focused ? 0 : -1}
      onClick={(event) => {
        event.preventDefault()
        props.toggleLabel(label)
        ref.current?.blur()
      }}
    >
      <input
        autoFocus={focused}
        hidden={true}
        type="checkbox"
        checked={selected}
        readOnly
      />
      <Box
        css={{
          width: '30px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Circle width={22} height={22} color={label.color} weight="fill" />
      </Box>
      <Box
        css={{
          overflow: 'clip',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <StyledText style="caption">{label.name}</StyledText>
      </Box>
      <Box
        css={{
          pl: '10px',
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {selected && (
          <Check
            size={15}
            color={theme.colors.grayText.toString()}
            weight="bold"
          />
        )}
      </Box>
    </StyledLabel>
  )
}

type FooterProps = {
  focused: boolean
  filterText: string
}

function Footer(props: FooterProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (props.focused && ref.current) {
      ref.current.focus()
    }
  }, [props.focused])

  return (
    <HStack
      ref={ref}
      distribution="start"
      alignment="center"
      css={{
        width: '100%',
        height: '42px',
        bg: props.focused ? '$grayBgActive' : 'unset',
        color: theme.colors.grayText.toString(),
        'a:link': {
          textDecoration: 'none',
        },
        'a:visited': {
          color: theme.colors.grayText.toString(),
        },
      }}
    >
      {props.filterText.length > 0 ? (
        <Button
          style="modalOption"
          css={{
            pl: '26px',
            position: 'relative',
            color: theme.colors.grayText.toString(),
            height: '42px',
            borderBottom: '1px solid $grayBorder',
            bg: props.focused ? '$grayBgActive' : 'unset',
          }}
          // onClick={createLabelFromFilterText}
        >
          <HStack alignment="center" distribution="start" css={{ gap: '8px' }}>
            <Plus size={18} color={theme.colors.grayText.toString()} />
            <SpanBox
              css={{ fontSize: '12px' }}
            >{`Create new label "${props.filterText}"`}</SpanBox>
          </HStack>
        </Button>
      ) : (
        <SpanBox
          css={{
            display: 'flex',
            fontSize: '12px',
            padding: '33px',
            gap: '8px',
          }}
        >
          <PencilSimple size={18} color={theme.colors.grayText.toString()} />
          <Link href="/settings/labels">Edit labels</Link>
        </SpanBox>
      )}
    </HStack>
  )
}

export function SetLabelsControl(props: SetLabelsControlProps): JSX.Element {
  const router = useRouter()
  const { labels, revalidate } = useGetLabelsQuery()

  useEffect(() => {
    setFocusedIndex(undefined)
  }, [props.inputValue])

  const isSelected = useCallback(
    (label: Label): boolean => {
      return props.selectedLabels.some((other) => {
        return other.id === label.id
      })
    },
    [props.selectedLabels]
  )

  const toggleLabel = useCallback(
    async (label: Label) => {
      let newSelectedLabels = [...props.selectedLabels]
      if (isSelected(label)) {
        newSelectedLabels = props.selectedLabels.filter((other) => {
          return other.id !== label.id
        })
      } else {
        newSelectedLabels = [...props.selectedLabels, label]
      }
      props.setSelectedLabels(newSelectedLabels)
      props.provider.labels = newSelectedLabels

      if (props.onLabelsUpdated) {
        props.onLabelsUpdated(newSelectedLabels)
      }

      props.clearInputState()
      revalidate()
    },
    [isSelected, props, revalidate]
  )

  const filteredLabels = useMemo(() => {
    if (!labels) {
      return []
    }
    return labels
      .filter((label) => {
        return label.name.toLowerCase().includes(props.inputValue.toLowerCase())
      })
      .sort((left: Label, right: Label) => {
        return left.name.localeCompare(right.name)
      })
  }, [labels, props.inputValue])

  // Move focus through the labels list on tab or arrow up/down keys
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>(
    undefined
  )

  const createLabelFromFilterText = useCallback(
    async (text: string) => {
      const label = await createLabelMutation(text, randomLabelColorHex(), '')
      if (label) {
        showSuccessToast(`Created label ${label.name}`, {
          position: 'bottom-right',
        })
        toggleLabel(label)
      } else {
        showErrorToast('Failed to create label', { position: 'bottom-right' })
      }
    },
    [props.inputValue, toggleLabel]
  )

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      const maxIndex = filteredLabels.length + 1
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        let newIndex = focusedIndex
        if (focusedIndex) {
          newIndex = Math.max(0, focusedIndex - 1)
        } else {
          newIndex = undefined
        }
        // If the `Create New label` button isn't visible we skip it
        // when navigating with the arrow keys
        if (focusedIndex === maxIndex && !props.inputValue) {
          newIndex = maxIndex - 2
        }
        setFocusedIndex(newIndex)
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        let newIndex = focusedIndex
        if (focusedIndex === undefined) {
          newIndex = 0
        } else {
          newIndex = Math.min(maxIndex, focusedIndex + 1)
        }
        // If the `Create New label` button isn't visible we skip it
        // when navigating with the arrow keys
        if (focusedIndex === maxIndex - 2 && !props.inputValue) {
          newIndex = maxIndex
        }
        setFocusedIndex(newIndex)
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (focusedIndex === maxIndex) {
          router.push('/settings/labels')
          return
        }
        if (focusedIndex === maxIndex - 1) {
          const _filterText = props.inputValue
          props.setInputValue('')
          await createLabelFromFilterText(_filterText)
          return
        }
        if (focusedIndex !== undefined) {
          const label = filteredLabels[focusedIndex]
          if (label) {
            toggleLabel(label)
          }
        }
      }
    },
    [
      props.inputValue,
      filteredLabels,
      focusedIndex,
      createLabelFromFilterText,
      router,
      toggleLabel,
    ]
  )

  return (
    <VStack
      distribution="start"
      onKeyDown={handleKeyDown}
      css={{
        p: '0',
        width: '100%',
      }}
    >
      <Header
        focused={focusedIndex === undefined}
        resetFocusedIndex={() => setFocusedIndex(undefined)}
        inputValue={props.inputValue}
        setInputValue={props.setInputValue}
        selectedLabels={props.selectedLabels}
        setSelectedLabels={props.setSelectedLabels}
        tabCount={props.tabCount}
        setTabCount={props.setTabCount}
        tabStartValue={props.tabStartValue}
        setTabStartValue={props.setTabStartValue}
        highlightLastLabel={props.highlightLastLabel}
        setHighlightLastLabel={props.setHighlightLastLabel}
        deleteLastLabel={props.deleteLastLabel}
        selectOrCreateLabel={props.selectOrCreateLabel}
        clearInputState={props.clearInputState}
      />
      <VStack
        distribution="start"
        alignment="start"
        css={{
          mt: '10px',
          flexGrow: '1',
          width: '100%',
          height: '200px',
          overflowY: 'scroll',
        }}
      >
        {filteredLabels.map((label, idx) => (
          <LabelListItem
            key={label.id}
            label={label}
            focused={idx === focusedIndex}
            selected={isSelected(label)}
            toggleLabel={toggleLabel}
          />
        ))}
      </VStack>
      <Footer
        filterText={props.inputValue}
        focused={focusedIndex === filteredLabels.length + 1}
      />
    </VStack>
  )
}
