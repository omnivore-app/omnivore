import { useRegisterActions } from 'kbar'
import { useCallback, useState } from 'react'
import { applyStoredTheme } from '../themeUpdater'
import { usePersistedState } from './usePersistedState'
import { TextDirection } from '../networking/library_items/useLibraryItems'

const DEFAULT_FONT = 'Inter'

export type ReaderSettings = {
  fontSize: number
  lineHeight: number
  marginWidth: number

  setFontSize: (newFontSize: number) => void
  setLineHeight: (newLineHeight: number) => void
  setMarginWidth: (newMarginWidth: number) => void

  showSetLabelsModal: boolean
  showEditDisplaySettingsModal: boolean

  setShowSetLabelsModal: (showSetLabelsModal: boolean) => void
  setShowEditDisplaySettingsModal: (
    showEditDisplaySettingsModal: boolean
  ) => void

  actionHandler: (action: string, arg?: unknown) => void

  fontFamily: string
  setFontFamily: (newStyle: string) => void

  justifyText: boolean | undefined
  setJustifyText: (set: boolean) => void
  highContrastText: boolean | undefined
  setHighContrastText: (set: boolean) => void

  highlightOnRelease: boolean | undefined
  setHighlightOnRelease: (set: boolean) => void

  textDirection: TextDirection | undefined
  setTextDirection: (textDirection: TextDirection) => void
}

export const useReaderSettings = (): ReaderSettings => {
  applyStoredTheme()

  const [fontSize, setFontSize] = usePersistedState({
    key: 'fontSize',
    initialValue: 20,
  })
  const [lineHeight, setLineHeight] = usePersistedState({
    key: 'lineHeight',
    initialValue: 150,
  })
  const [marginWidth, setMarginWidth] = usePersistedState({
    key: 'marginWidth',
    initialValue: 200,
  })
  const [fontFamily, setFontFamily] = usePersistedState({
    key: 'fontFamily',
    initialValue: DEFAULT_FONT,
  })
  const [highContrastText, setHighContrastText] = usePersistedState<
    boolean | undefined
  >({
    key: `--display-high-contrast-text`,
    initialValue: false,
  })

  const [highlightOnRelease, setHighlightOnRelease] = usePersistedState<
    boolean | undefined
  >({
    key: `--display-highlight-on-release`,
    initialValue: false,
  })

  const [justifyText, setJustifyText] = usePersistedState<boolean | undefined>({
    key: `--display-justify-text`,
    initialValue: false,
  })
  const [textDirection, setTextDirection] = usePersistedState<
    TextDirection | undefined
  >({
    key: `--display-text-direction`,
    initialValue: 'LTR',
  })
  const [showSetLabelsModal, setShowSetLabelsModal] = useState(false)
  const [showEditDisplaySettingsModal, setShowEditDisplaySettingsModal] =
    useState(false)

  const updateFontSize = useCallback(
    (newFontSize: number) => {
      setFontSize(newFontSize)
    },
    [setFontSize]
  )

  // const [hideMargins, setHideMargins] = usePersistedState<boolean | undefined>({
  //   key: `--display-hide-margins`,
  //   initialValue: false,
  //   isSessionStorage: false,
  // })

  const actionHandler = useCallback(
    (action: string, arg?: unknown) => {
      switch (action) {
        case 'setFontSize':
          const value = Number(arg)
          if (value >= 10 && value <= 48) {
            updateFontSize(value)
          }
          break
        case 'incrementFontSize':
          updateFontSize(Math.min(fontSize + 2, 48))
          break
        case 'decrementFontSize':
          updateFontSize(Math.max(fontSize - 2, 10))
          break
        case 'setMarginWidth': {
          const value = Number(arg)
          if (value >= 200 && value <= 560) {
            setMarginWidth(value)
          }
          break
        }
        case 'incrementMarginWidth':
          setMarginWidth(Math.min(marginWidth + 45, 560))
          break
        case 'decrementMarginWidth':
          setMarginWidth(Math.max(marginWidth - 45, 200))
          break
        case 'setLineHeight': {
          const value = Number(arg)
          if (value >= 100 && value <= 300) {
            setLineHeight(arg as number)
          }
          break
        }
        case 'editDisplaySettings': {
          setShowEditDisplaySettingsModal(true)
          break
        }
        case 'setFontFamily': {
          setFontFamily(arg as unknown as string)
          break
        }
        case 'setLabels': {
          setShowSetLabelsModal(true)
          break
        }
        case 'resetReaderSettings': {
          updateFontSize(20)
          setMarginWidth(290)
          setLineHeight(150)
          setFontFamily(DEFAULT_FONT)
          break
        }
      }
    },
    [
      fontSize,
      setFontSize,
      lineHeight,
      fontFamily,
      setLineHeight,
      marginWidth,
      setMarginWidth,
      setFontFamily,
    ]
  )

  useRegisterActions(
    [
      {
        id: 'increaseFont',
        section: 'Article',
        name: 'Increase font size',
        shortcut: ['+'],
        perform: () => actionHandler('incrementFontSize'),
      },
      {
        id: 'decreaseFont',
        section: 'Article',
        name: 'Decrease font size',
        shortcut: ['-'],
        perform: () => actionHandler('decrementFontSize'),
      },
      {
        id: 'increaseMargin',
        section: 'Article',
        name: 'Increase margin width',
        shortcut: [']'],
        perform: () => actionHandler('incrementMarginWidth'),
      },
      {
        id: 'decreaseMargin',
        section: 'Article',
        name: 'Decrease margin width',
        shortcut: ['['],
        perform: () => actionHandler('decrementMarginWidth'),
      },
      {
        id: 'edit_labels',
        section: 'Article',
        name: 'Edit labels',
        shortcut: ['l'],
        perform: () => setShowSetLabelsModal(true),
      },
      {
        id: 'display_settings',
        section: 'Article',
        name: 'Reader Preferences',
        shortcut: ['d'],
        perform: () => setShowEditDisplaySettingsModal(true),
      },
    ],
    [actionHandler]
  )

  return {
    fontSize,
    lineHeight,
    marginWidth,
    setFontSize,
    setLineHeight,
    setMarginWidth,
    showSetLabelsModal,
    showEditDisplaySettingsModal,
    setShowSetLabelsModal,
    setShowEditDisplaySettingsModal,
    actionHandler,
    setFontFamily,
    fontFamily,
    justifyText,
    setJustifyText,
    highContrastText,
    setHighContrastText,
    highlightOnRelease,
    setHighlightOnRelease,
    textDirection,
    setTextDirection,
  }
}
