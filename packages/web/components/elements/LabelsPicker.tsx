import AutosizeInput from 'react-input-autosize'
import { Box, SpanBox } from './LayoutPrimitives'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Label } from '../../lib/networking/fragments/labelFragment'
import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import { isTouchScreenDevice } from '../../lib/deviceType'
import { EditLabelLabelChip } from './EditLabelChip'
import { LabelsDispatcher } from '../../lib/hooks/useSetPageLabels'

type LabelsPickerProps = {
  selectedLabels: Label[]
  focused: boolean

  inputValue: string
  setInputValue: (value: string) => void
  clearInputState: () => void

  onFocus?: () => void
  dispatchLabels: LabelsDispatcher

  deleteLastLabel: () => void
  selectOrCreateLabel: (value: string) => void

  tabCount: number
  setTabCount: (count: number) => void
  tabStartValue: string
  setTabStartValue: (value: string) => void

  highlightLastLabel: boolean
  setHighlightLastLabel: (set: boolean) => void
}

export const LabelsPicker = (props: LabelsPickerProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement | null>()
  const availableLabels = useGetLabelsQuery()
  const {
    focused,
    inputValue,
    tabCount,
    tabStartValue,
    selectedLabels,
    setInputValue,
    setTabCount,
    setTabStartValue,
  } = props

  useEffect(() => {
    if (!isTouchScreenDevice() && focused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [focused])

  const autoComplete = useCallback(() => {
    const lowerCasedValue = inputValue.toLowerCase()

    if (lowerCasedValue.length < 1) {
      return
    }

    let _tabCount = tabCount
    let _tabStartValue = tabStartValue.toLowerCase()

    if (_tabCount === -1) {
      _tabCount = 0
      _tabStartValue = lowerCasedValue

      setTabCount(0)
      setTabStartValue(lowerCasedValue)
    } else {
      _tabCount = tabCount + 1
      setTabCount(_tabCount)
    }

    const matches = availableLabels.labels.filter((l) =>
      l.name.toLowerCase().startsWith(_tabStartValue)
    )

    if (_tabCount < matches.length) {
      setInputValue(matches[_tabCount].name)
    } else if (matches.length > 0) {
      setTabCount(0)
      setInputValue(matches[0].name)
    }
  }, [
    inputValue,
    availableLabels,
    tabCount,
    tabStartValue,
    setInputValue,
    setTabCount,
    setTabStartValue,
  ])

  const clearTabState = useCallback(() => {
    setTabCount(-1)
    setTabStartValue('')
  }, [setTabCount, setTabStartValue])

  const isEmpty = useMemo(() => {
    return selectedLabels.length === 0 && inputValue.length === 0
  }, [inputValue, selectedLabels])

  return (
    <Box
      css={{
        display: 'inline-block',
        bg: '#3D3D3D',
        border: '1px transparent solid',
        borderRadius: '6px',
        verticalAlign: 'center',
        padding: '5px',
        lineHeight: '2',
        width: '100%',
        cursor: 'text',
        color: '#EBEBEB',
        fontSize: '12px',
        fontFamily: '$inter',
        input: {
          all: 'unset',
          left: '0px',
          outline: 'none',
          borderStyle: 'none',
          marginLeft: '2px',
        },
        '&:focus-within': {
          outline: 'none',
          border: '1px solid $thLibraryMenuUnselected',
        },
        '>span': {
          marginTop: '0px',
          marginBottom: '0px',
        },
        '>input': {
          fontSize: '16px',
        },
      }}
      onMouseDown={(event) => {
        inputRef.current?.focus()
        props.setHighlightLastLabel(false)
        inputRef.current?.setSelectionRange(
          inputRef.current?.value.length,
          inputRef.current?.value.length
        )
        event.preventDefault()
      }}
      onDoubleClick={(event) => {
        inputRef.current?.focus()
        props.setHighlightLastLabel(false)
        inputRef.current?.setSelectionRange(0, inputRef.current?.value.length)
        event.preventDefault()
      }}
    >
      {props.selectedLabels.map((label, idx) => (
        <EditLabelLabelChip
          key={label.id}
          text={label.name}
          color={label.color}
          isSelected={
            props.highlightLastLabel && idx == props.selectedLabels.length - 1
          }
          xAction={() => {
            const idx = props.selectedLabels.findIndex((l) => l.id == label.id)
            if (idx !== -1) {
              const _selectedLabels = props.selectedLabels
              _selectedLabels.splice(idx, 1)
              props.dispatchLabels({
                type: 'SAVE',
                labels: [..._selectedLabels],
              })
            }
          }}
        />
      ))}
      <SpanBox
        css={{
          display: 'inline-flex',
          height: '24px',
          paddingBottom: '20px',
          transform: `translateY(-2px)`,
        }}
      >
        <AutosizeInput
          placeholder={isEmpty ? 'Add Labels' : undefined}
          inputRef={(ref) => {
            inputRef.current = ref
          }}
          inputStyle={{
            fontSize: '16px',
            minWidth:
              props.inputValue.length == 0 && props.selectedLabels.length == 0
                ? '100px'
                : '2px',
          }}
          onFocus={() => {
            if (props.onFocus) {
              props.onFocus()
            }
          }}
          minWidth="2px"
          maxLength={48}
          value={props.inputValue}
          onClick={(event) => {
            event.stopPropagation()
          }}
          onKeyUp={(event) => {
            switch (event.key) {
              case 'Escape':
                props.clearInputState()
                break
              case 'Enter':
                props.selectOrCreateLabel(props.inputValue)
                event.preventDefault()
                break
            }
          }}
          onKeyDown={(event) => {
            switch (event.key) {
              case 'Tab':
                autoComplete()
                event.preventDefault()
                break
              case 'Delete':
              case 'Backspace':
                clearTabState()
                if (props.inputValue.length === 0) {
                  props.deleteLastLabel()
                  event.preventDefault()
                }
                break
            }
          }}
          onChange={function (event) {
            props.setInputValue(event.target.value)
          }}
        />
      </SpanBox>
    </Box>
  )
}
