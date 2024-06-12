import { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { styled, theme } from '../../tokens/stitches.config'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { Check, Circle, Plus, WarningCircle } from '@phosphor-icons/react'
import { createLabelMutation } from '../../../lib/networking/mutations/createLabelMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { randomLabelColorHex } from '../../../utils/settings-page/labels/labelColorObjects'
import { useRouter } from 'next/router'
import { LabelsPicker } from '../../elements/LabelsPicker'
import { LabelsDispatcher } from '../../../lib/hooks/useSetPageLabels'

export interface LabelsProvider {
  labels?: Label[]
}

type SetLabelsControlProps = {
  inputValue: string
  setInputValue: (value: string) => void
  clearInputState: () => void

  selectedLabels: Label[]
  dispatchLabels: LabelsDispatcher

  tabCount: number
  setTabCount: (count: number) => void
  tabStartValue: string
  setTabStartValue: (value: string) => void

  highlightLastLabel: boolean
  setHighlightLastLabel: (set: boolean) => void

  deleteLastLabel: () => void
  selectOrCreateLabel: (value: string) => void

  errorMessage?: string

  footer?: React.ReactNode
}

type HeaderProps = SetLabelsControlProps & {
  focused: boolean
  resetFocusedIndex: () => void
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
          mt: '10px',
          mb: '5px',
          px: '14px',
        }}
      >
        <LabelsPicker
          focused={props.focused}
          inputValue={props.inputValue}
          setInputValue={props.setInputValue}
          selectedLabels={props.selectedLabels}
          dispatchLabels={props.dispatchLabels}
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
  selectedLabels: Label[]
  availableLabels: Label[]

  createEnteredLabel: () => Promise<void>
  selectEnteredLabel: () => Promise<void>
}

function Footer(props: FooterProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (props.focused && ref.current) {
      ref.current.focus()
    }
  }, [props.focused])

  const textMatch: 'selected' | 'available' | 'none' = useMemo(() => {
    const findLabel = (l: Label) =>
      l.name.toLowerCase() == props.filterText.toLowerCase()
    const available = props.availableLabels.find(findLabel)
    const selected = props.selectedLabels.find(findLabel)
    if (available && !selected) {
      return 'available'
    }
    if (selected) {
      return 'selected'
    }
    return 'none'
  }, [props])

  const trimmedLabelName = useMemo(() => {
    return props.filterText.trim()
  }, [props])

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
      {trimmedLabelName.length > 0 ? (
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
          <HStack
            alignment="center"
            distribution="start"
            css={{ gap: '8px', fontSize: '12px', pointer: 'cursor' }}
            onClick={async () => {
              switch (textMatch) {
                case 'available':
                  await props.selectEnteredLabel()
                  return
                case 'none':
                  await props.createEnteredLabel()
                  return
              }
            }}
          >
            {textMatch === 'available' && (
              <>
                <Check size={18} color={theme.colors.grayText.toString()} />
                Use Enter to add label &quot;{trimmedLabelName}&quot;
              </>
            )}

            {textMatch === 'none' && (
              <>
                <Plus size={18} color={theme.colors.grayText.toString()} />
                Use Enter to create new label &quot;{trimmedLabelName}&quot;
              </>
            )}
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
        ></SpanBox>
      )}
    </HStack>
  )
}

export function SetLabelsControl(props: SetLabelsControlProps): JSX.Element {
  const router = useRouter()
  const { inputValue, setInputValue, selectedLabels, setHighlightLastLabel } =
    props
  const { labels, revalidate } = useGetLabelsQuery()
  // Move focus through the labels list on tab or arrow up/down keys
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>(0)

  useEffect(() => {
    setFocusedIndex(undefined)
  }, [inputValue])

  const isSelected = useCallback(
    (label: Label): boolean => {
      return selectedLabels.some((other) => {
        return other.id === label.id
      })
    },
    [selectedLabels]
  )

  useEffect(() => {
    if (focusedIndex === 0) {
      setHighlightLastLabel(false)
    }
  }, [setHighlightLastLabel, focusedIndex])

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
      props.dispatchLabels({ type: 'SAVE', labels: newSelectedLabels })

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
        return label.name.toLowerCase().includes(inputValue.toLowerCase())
      })
      .sort((left: Label, right: Label) => {
        return left.name.localeCompare(right.name)
      })
  }, [labels, inputValue])

  const createLabelFromFilterText = useCallback(
    async (text: string) => {
      const trimmedLabelName = text.trim()
      const label = await createLabelMutation(
        trimmedLabelName,
        randomLabelColorHex(),
        ''
      )
      if (label) {
        showSuccessToast(`Created label ${label.name}`, {
          position: 'bottom-right',
        })
        toggleLabel(label)
      } else {
        showErrorToast('Failed to create label', { position: 'bottom-right' })
      }
    },
    [toggleLabel]
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
        if (focusedIndex === maxIndex && !inputValue) {
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
        if (focusedIndex === maxIndex - 2 && !inputValue) {
          newIndex = maxIndex
        }
        setFocusedIndex(newIndex)
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (focusedIndex === maxIndex) {
          const _filterText = inputValue
          setInputValue('')
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
      inputValue,
      setInputValue,
      filteredLabels,
      focusedIndex,
      createLabelFromFilterText,
      toggleLabel,
    ]
  )

  const createEnteredLabel = useCallback(() => {
    const _filterText = inputValue
    setInputValue('')
    return createLabelFromFilterText(_filterText)
  }, [inputValue, setInputValue, createLabelFromFilterText])

  const selectEnteredLabel = useCallback(() => {
    const label = labels.find(
      (l: Label) => l.name.toLowerCase() == inputValue.toLowerCase()
    )
    if (!label) {
      return Promise.resolve()
    }
    return toggleLabel(label)
  }, [labels, inputValue, toggleLabel])

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
        inputValue={inputValue}
        setInputValue={setInputValue}
        selectedLabels={props.selectedLabels}
        dispatchLabels={props.dispatchLabels}
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
      <Box
        css={{
          width: '100%',
          height: '15px',
          color: '#FF3B30',
          fontSize: '12px',
          fontFamily: '$inter',
          gap: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          paddingRight: '15px',
          m: '0px',
        }}
      >
        {props.errorMessage && (
          <>
            {props.errorMessage}
            <WarningCircle color="#FF3B30" size={15} />
          </>
        )}
      </Box>
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
      {props.footer ? (
        props.footer
      ) : (
        <Footer
          filterText={inputValue}
          selectedLabels={props.selectedLabels}
          availableLabels={labels}
          focused={focusedIndex === filteredLabels.length + 1}
          createEnteredLabel={createEnteredLabel}
          selectEnteredLabel={selectEnteredLabel}
        />
      )}
    </VStack>
  )
}
