import { useRegisterActions } from "kbar"
import { useCallback, useState } from "react"
import { userPersonalizationMutation } from "../networking/mutations/userPersonalizationMutation"
import { useGetUserPreferences, UserPreferences } from "../networking/queries/useGetUserPreferences"
import { usePersistedState } from "./usePersistedState"

const DEFAULT_FONT = 'Inter'

export type ReaderSettings = {
  preferencesData: UserPreferences | undefined
  fontSize: number
  lineHeight: number
  marginWidth: number

  setFontSize: (newFontSize: number) => void
  setLineHeight: (newLineHeight: number) => void
  setMarginWidth: (newMarginWidth: number) => void 

  showSetLabelsModal: boolean
  showEditDisplaySettingsModal: boolean

  setShowSetLabelsModal: (showSetLabelsModal: boolean) => void
  setShowEditDisplaySettingsModal: (showEditDisplaySettingsModal: boolean) => void

  actionHandler: (action: string, arg?: unknown) => void
  
  fontFamily: string,
  setFontFamily: (newStyle: string) => void
}

export const useReaderSettings = (): ReaderSettings => {
  const { preferencesData } = useGetUserPreferences()
  const [fontSize, setFontSize] = useState(preferencesData?.fontSize ?? 20)
  const [lineHeight, setLineHeight] = usePersistedState({ key: 'lineHeight', initialValue: 150 })
  const [marginWidth, setMarginWidth] = usePersistedState({ key: 'marginWidth', initialValue: 200 })
  const [fontFamily, setFontFamily] = usePersistedState({ key: 'fontFamily', initialValue: DEFAULT_FONT })
  const [showSetLabelsModal, setShowSetLabelsModal] = useState(false)
  const [showEditDisplaySettingsModal, setShowEditDisplaySettingsModal] = useState(false)

  const updateFontSize = async (newFontSize: number) => {
    setFontSize(newFontSize)
    await userPersonalizationMutation({ fontSize: newFontSize })
  }

  const actionHandler = useCallback(async(action: string, arg?: unknown) => {
    switch (action) {
      case 'incrementFontSize':
        await updateFontSize(Math.min(fontSize + 2, 28))
        break
      case 'decrementFontSize':
        await updateFontSize(Math.max(fontSize - 2, 10))
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
  }, [fontSize, setFontSize, lineHeight, fontFamily,
      setLineHeight, marginWidth, setMarginWidth, setFontFamily])
  
  
  useRegisterActions([
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
      id: 'edit_a',
      section: 'Article',
      name: 'Edit labels',
      shortcut: ['l'],
      perform: () => setShowSetLabelsModal(true),
    },
  ], [fontSize, marginWidth, setFontSize, setMarginWidth])

  return {
    preferencesData,
    fontSize, lineHeight, marginWidth,
    setFontSize,  setLineHeight, setMarginWidth,
    showSetLabelsModal, showEditDisplaySettingsModal,
    setShowSetLabelsModal, setShowEditDisplaySettingsModal,
    actionHandler, setFontFamily, fontFamily,
  }
}
