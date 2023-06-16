import AutosizeInput from 'react-input-autosize'
import { Box, SpanBox } from './LayoutPrimitives'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Label } from '../../lib/networking/fragments/labelFragment'
import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import { LabelChip } from './LabelChip'
import { randomLabelColorHex } from '../../utils/settings-page/labels/labelColorObjects'
import { v4 as uuidv4 } from 'uuid'
import { createLabelMutation } from '../../lib/networking/mutations/createLabelMutation'
import { showSuccessToast } from '../../lib/toastHelpers'
import { isTouchScreenDevice } from '../../lib/deviceType'

type LabelsPickerProps = {
  selectedLabels: Label[]
  focused: boolean

  onFocus?: () => void
  onFilterTextChange?: (filterText: string) => void

  setSelectedLabels: (labels: Label[]) => void
}

export const LabelsPicker = (props: LabelsPickerProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement | null>()
  const availableLabels = useGetLabelsQuery()
  const [inputValue, setInputValue] = useState('')
  const [tabCount, setTabCount] = useState(-1)
  const [tabStartValue, setTabStartValue] = useState('')
  const [highlightLastLabel, setHighlightLastLabel] = useState(false)

  useEffect(() => {
    if (!isTouchScreenDevice() && props.focused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [props.focused])

  useEffect(() => {
    if (props.onFilterTextChange) {
      props.onFilterTextChange(inputValue)
    }
  }, [inputValue])

  const showMessage = useCallback((msg: string) => {
    console.log('showMessage: ', msg)
  }, [])

  const clearInputState = useCallback(() => {
    setTabCount(-1)
    setInputValue('')
    setTabStartValue('')
    setHighlightLastLabel(false)
  }, [tabCount, inputValue, tabStartValue])

  const createLabelAsync = useCallback(
    (tempLabel: Label) => {
      ;(async () => {
        const currentLabels = props.selectedLabels
        const newLabel = await createLabelMutation(
          tempLabel.name,
          tempLabel.color
        )
        if (newLabel) {
          const idx = currentLabels.findIndex((l) => l.id === tempLabel.id)
          showSuccessToast(`Created label ${newLabel.name}`, {
            position: 'bottom-right',
          })
          if (idx !== -1) {
            currentLabels[idx] = newLabel
            props.setSelectedLabels([...currentLabels])
          }
        } else {
          showMessage(`Error creating label ${tempLabel.name}`)
        }
      })()
    },
    [props.selectedLabels]
  )

  const selectOrCreateLabel = useCallback(
    (value: string) => {
      const current = props.selectedLabels ?? []
      const lowerCasedValue = value.toLowerCase()
      const existing = availableLabels.labels.find(
        (l) => l.name.toLowerCase() == lowerCasedValue
      )

      if (lowerCasedValue.length < 1) {
        return
      }

      if (existing) {
        const isAdded = props.selectedLabels.find(
          (l) => l.name.toLowerCase() == lowerCasedValue
        )
        if (!isAdded) {
          props.setSelectedLabels([...current, existing])
          clearInputState()
        } else {
          showMessage(`label ${value} already added.`)
        }
      } else {
        const tempLabel = {
          id: uuidv4(),
          name: value,
          color: randomLabelColorHex(),
          description: '',
          createdAt: new Date(),
        }
        props.setSelectedLabels([...current, tempLabel])
        clearInputState()

        createLabelAsync(tempLabel)
      }
    },
    [
      availableLabels,
      props.selectedLabels,
      clearInputState,
      createLabelAsync,
      showMessage,
    ]
  )

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

    console.log(
      `'${_tabStartValue}' matches: `,
      matches,
      availableLabels.labels.map((l) => l.name.toLowerCase())
    )
    if (_tabCount < matches.length) {
      setInputValue(matches[_tabCount].name)
    } else if (matches.length > 0) {
      setTabCount(0)
      setInputValue(matches[0].name)
    }
  }, [inputValue, availableLabels, tabCount, tabStartValue])

  const deleteLastLabel = useCallback(() => {
    if (highlightLastLabel) {
      const current = props.selectedLabels
      current.pop()
      props.setSelectedLabels([...current])
      setHighlightLastLabel(false)
    } else {
      setHighlightLastLabel(true)
    }
  }, [highlightLastLabel, props.selectedLabels])

  const clearTabState = useCallback(() => {
    setTabCount(-1)
    setTabStartValue('')
  }, [])

  const isEmpty = useMemo(() => {
    return props.selectedLabels.length === 0 && inputValue.length === 0
  }, [inputValue, props.selectedLabels])

  return (
    <Box
      css={{
        display: 'inline-block',
        bg: '#3D3D3D',
        border: '1px transparent solid',
        borderRadius: '6px',
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
          borderColor: 'transparent',
          padding: '1px 10px',
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
        <LabelChip
          key={label.id}
          text={label.name}
          color={label.color}
          isSelected={
            highlightLastLabel && idx == props.selectedLabels.length - 1
          }
          useAppAppearance={true}
        />
      ))}
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
        value={inputValue}
        onClick={(event) => {
          event.stopPropagation()
        }}
        onKeyUp={(event) => {
          switch (event.key) {
            case 'Escape':
              clearInputState()
              break
            case 'Enter':
              selectOrCreateLabel(inputValue)
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
              if (inputValue.length === 0) {
                deleteLastLabel()
                event.preventDefault()
              }
              break
          }
        }}
        onKeyPress={(event) => {
          // switch (event.key) {
          //   case 'Enter':
          //     selectOrCreateLabel(inputValue)
          //     event.preventDefault()
          //     break
          // }
        }}
        onChange={function (event) {
          setInputValue(event.target.value)
        }}
      />
    </Box>
  )
}

// import { styled } from '@stitches/react'
// import { Label } from '../../lib/networking/fragments/labelFragment'
// import { LabelChip } from './LabelChip'
// import { Box } from './LayoutPrimitives'
// import { useCallback, useMemo, useState } from 'react'
// import { useCombobox, useMultipleSelection } from 'downshift'

// type LabelsPickerProps = {
//   //  selectedLabels: Label[]
// }

// const InputLabel = styled('input', {
//   outline: 'none',
//   boxSizing: 'content-box',
//   maxWidth: '237px',
//   background: 'red',
//   borderStyle: 'none',
//   width: '100%',
// })

// const StyledInput = styled('input', {
//   outline: 'none',
//   boxSizing: 'content-box',
//   maxWidth: '237px',
//   background: 'red',
//   borderStyle: 'none',
//   width: '100%',
// })

// type Suggestion = {
//   name: string
//   year: number
// }

// const languages = [
//   {
//     name: 'C',
//     year: 1972,
//   },
//   {
//     name: 'Elm',
//     year: 2012,
//   },
// ]

// export function LabelsPicker(props: LabelsPickerProps): JSX.Element {
//   const labels: Label[] = [
//     { id: '123', name: 'Label 01', color: '#000000', createdAt: new Date(0) },
//     { id: '124', name: 'Label 02', color: '#000000', createdAt: new Date(0) },
//     { id: '125', name: 'Label 03', color: '#000000', createdAt: new Date(0) },
//   ]
//   const initialSelectedItems: Label[] = []

//   function getFilteredBooks(selectedItems: Label[], inputValue: string) {
//     const lowerCasedInputValue = inputValue.toLowerCase()

//     return labels.filter(function filterBook(book) {
//       return (
//         !selectedItems.includes(book) &&
//         book.name.toLowerCase().includes(lowerCasedInputValue)
//       )
//     })
//   }

//   function MultipleComboBox() {
//     const [inputValue, setInputValue] = useState('')
//     const [selectedItems, setSelectedItems] = useState(initialSelectedItems)
//     const items = useMemo(
//       () => getFilteredBooks(selectedItems, inputValue),
//       [selectedItems, inputValue]
//     )
//     const { getSelectedItemProps, getDropdownProps, removeSelectedItem } =
//       useMultipleSelection({
//         selectedItems,
//         onStateChange({ selectedItems: newSelectedItems, type }) {
//           switch (type) {
//             case useMultipleSelection.stateChangeTypes
//               .SelectedItemKeyDownBackspace:
//             case useMultipleSelection.stateChangeTypes
//               .SelectedItemKeyDownDelete:
//             case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
//             case useMultipleSelection.stateChangeTypes
//               .FunctionRemoveSelectedItem:
//               setSelectedItems(newSelectedItems as Label[])
//               break
//             default:
//               break
//           }
//         },
//       })
//     const {
//       isOpen,
//       getToggleButtonProps,
//       getLabelProps,
//       getMenuProps,
//       getInputProps,
//       highlightedIndex,
//       getItemProps,
//       selectedItem,
//     } = useCombobox({
//       items,
//       itemToString(item: Label | null) {
//         return item ? item.name : ''
//       },
//       defaultHighlightedIndex: 0, // after selection, highlight the first item.
//       selectedItem: null,
//       stateReducer(state, actionAndChanges) {
//         const { changes, type } = actionAndChanges

//         switch (type) {
//           case useCombobox.stateChangeTypes.InputKeyDownEnter:
//           case useCombobox.stateChangeTypes.ItemClick:
//             return {
//               ...changes,
//               isOpen: true, // keep the menu open after selection.
//               highlightedIndex: 0, // with the first option highlighted.
//             }
//           default:
//             return changes
//         }
//       },
//       onStateChange({
//         inputValue: newInputValue,
//         type,
//         selectedItem: newSelectedItem,
//       }) {
//         switch (type) {
//           case useCombobox.stateChangeTypes.InputKeyDownEnter:
//           case useCombobox.stateChangeTypes.ItemClick:
//           case useCombobox.stateChangeTypes.InputBlur:
//             if (newSelectedItem) {
//               setSelectedItems([...selectedItems, newSelectedItem])
//             }
//             break

//           case useCombobox.stateChangeTypes.InputChange:
//             setInputValue(newInputValue || '')

//             break
//           default:
//             break
//         }
//       },
//     })

//     return (
//       <div className="w-[592px]">
//         <div className="flex flex-col gap-1">
//           <label className="w-fit" {...getLabelProps()}>
//             Pick some books:
//           </label>
//           <div className="shadow-sm bg-white inline-flex gap-2 items-center flex-wrap p-1.5">
//             {selectedItems.map(function renderSelectedItem(
//               selectedItemForRender,
//               index
//             ) {
//               return (
//                 <span
//                   className="bg-gray-100 rounded-md px-1 focus:bg-red-400"
//                   key={`selected-item-${index}`}
//                   {...getSelectedItemProps({
//                     selectedItem: selectedItemForRender,
//                     index,
//                   })}
//                 >
//                   {selectedItemForRender.name}
//                   <span
//                     className="px-1 cursor-pointer"
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       removeSelectedItem(selectedItemForRender)
//                     }}
//                   >
//                     &#10005;
//                   </span>
//                 </span>
//               )
//             })}
//             <div className="flex gap-0.5 grow">
//               <input
//                 placeholder="Best book ever"
//                 className="w-full"
//                 {...getInputProps(
//                   getDropdownProps({ preventKeyAction: isOpen })
//                 )}
//               />
//               <button
//                 aria-label="toggle menu"
//                 className="px-2"
//                 type="button"
//                 {...getToggleButtonProps()}
//               >
//                 &#8595;
//               </button>
//             </div>
//           </div>
//         </div>
//         <ul
//           className={`absolute w-inherit bg-white mt-1 shadow-md max-h-80 overflow-scroll p-0 ${
//             !(isOpen && items.length) && 'hidden'
//           }`}
//           {...getMenuProps()}
//         >
//           {isOpen &&
//             items.map((item, index) => (
//               <li
//                 // className={
//                 //   (highlightedIndex === index && 'bg-blue-300',
//                 //   selectedItem === item && 'font-bold',
//                 //   'py-2 px-3 shadow-sm flex flex-col')
//                 // }
//                 key={`${item.id}${index}`}
//                 {...getItemProps({ item, index })}
//               >
//                 <span>{item.name}</span>
//                 <span className="text-sm text-gray-700">{item.name}</span>
//               </li>
//             ))}
//         </ul>
//       </div>
//     )
//   }
//   return <MultipleComboBox />
// }
