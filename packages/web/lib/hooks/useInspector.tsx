import { useCallback, useEffect, useMemo, useState } from 'react'
import { InspectorView } from '../../components/templates/Inspector'
import { usePersistedState } from './usePersistedState'
import { useWindowSize } from './useWindowSize'

export const useInspector = () => {
  const windowSize = useWindowSize()
  const [currentInspectorView, setCurrentInspectorView] =
    usePersistedState<InspectorView>({
      key: '--inspector-currentView',
      isSessionStorage: false,
      initialValue: 'notebook',
    })
  const [inspectorVisible, setInspectorVisible] = usePersistedState({
    key: '--reader-inspector-visible',
    initialValue: false,
    isSessionStorage: false,
  })

  const mainAreaVisible = useMemo(() => {
    // on small screens we have to hide the main area when
    // the inspector is visible.
    if (windowSize.width < 440 && inspectorVisible) {
      return false
    }
    return true
  }, [windowSize, inspectorVisible])

  const openInspector = useCallback(
    (initial: InspectorView | undefined) => {
      if (initial) {
        setCurrentInspectorView(initial)
      }
      setInspectorVisible(true)
    },
    [setCurrentInspectorView, setInspectorVisible]
  )

  const closeInspector = useCallback(() => {
    setInspectorVisible(false)
  }, [setInspectorVisible])

  const toggleInspector = useCallback(() => {
    setInspectorVisible(!inspectorVisible)
  }, [setInspectorVisible])

  const inspectorMinSize = useMemo(() => {
    return 300
  }, [])

  const inspectorMaxSize = useMemo(() => {
    return 580
  }, [])

  const inspectorPreferredSize = useMemo(() => {
    return '440px'
  }, [])

  return {
    inspectorMinSize,
    inspectorMaxSize,
    inspectorPreferredSize,

    mainAreaVisible,
    inspectorVisible,
    openInspector,
    closeInspector,
    toggleInspector,
    currentInspectorView,
    setCurrentInspectorView,
  }
}
