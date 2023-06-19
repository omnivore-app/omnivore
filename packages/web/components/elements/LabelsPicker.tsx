import AutosizeInput from 'react-input-autosize'
import { Box, SpanBox } from './LayoutPrimitives'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Label } from '../../lib/networking/fragments/labelFragment'
import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import { LabelChip } from './LabelChip'
import { isTouchScreenDevice } from '../../lib/deviceType'
import { EditLabelLabelChip } from './EditLabelChip'

type LabelsPickerProps = {
  selectedLabels: Label[]
  focused: boolean

  inputValue: string
  setInputValue: (value: string) => void
  clearInputState: () => void

  onFocus?: () => void
  setSelectedLabels: (labels: Label[]) => void

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

  useEffect(() => {
    if (!isTouchScreenDevice() && props.focused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [props.focused])

  const autoComplete = useCallback(() => {
    const lowerCasedValue = props.inputValue.toLowerCase()

    if (lowerCasedValue.length < 1) {
      return
    }

    let _tabCount = props.tabCount
    let _tabStartValue = props.tabStartValue.toLowerCase()

    if (_tabCount === -1) {
      _tabCount = 0
      _tabStartValue = lowerCasedValue

      props.setTabCount(0)
      props.setTabStartValue(lowerCasedValue)
    } else {
      _tabCount = props.tabCount + 1
      props.setTabCount(_tabCount)
    }

    const matches = availableLabels.labels.filter((l) =>
      l.name.toLowerCase().startsWith(_tabStartValue)
    )

    if (_tabCount < matches.length) {
      props.setInputValue(matches[_tabCount].name)
    } else if (matches.length > 0) {
      props.setTabCount(0)
      props.setInputValue(matches[0].name)
    }
  }, [props.inputValue, availableLabels, props.tabCount, props.tabStartValue])

  const clearTabState = useCallback(() => {
    props.setTabCount(-1)
    props.setTabStartValue('')
  }, [])

  const isEmpty = useMemo(() => {
    return props.selectedLabels.length === 0 && props.inputValue.length === 0
  }, [props.inputValue, props.selectedLabels])

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
      }}
      onMouseDown={(event) => {
        inputRef.current?.focus()
        inputRef.current?.setSelectionRange(
          inputRef.current?.value.length,
          inputRef.current?.value.length
        )
        event.preventDefault()
      }}
      onDoubleClick={(event) => {
        inputRef.current?.focus()
        inputRef.current?.setSelectionRange(0, inputRef.current?.value.length)
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
              props.setSelectedLabels([..._selectedLabels])
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
          placeholder={isEmpty ? 'Filter for label' : undefined}
          inputRef={(ref) => {
            inputRef.current = ref
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
