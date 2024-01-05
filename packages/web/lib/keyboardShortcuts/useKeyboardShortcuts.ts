import { useEffect, useCallback, useReducer, useMemo } from 'react'

const disabledTargets = ['INPUT', 'TEXTAREA']

/* Usage:
     commands: KeyboardCommand[] = [{
        shortcutKeys: ['shift|alt', 'r'],
        callback: () => {}
      }
    ]
*/

const KBAR_KEYS = ['control', 'meta', 'v', 'i', 's', 'n', '[', ']']

type KeyPressed = {
  [name: string]: boolean
}

export type KeyboardCommand = {
  shortcutKeys: string[]
  callback: () => void
  actionDescription: string
  shortcutKeyDescription: string
  ignoreDisabledTargets?: boolean
}

enum ActionType {
  SET_KEY_DOWN,
  SET_KEY_UP,
}

const keysReducer = (
  state: KeyPressed,
  action: { type: ActionType; key: string }
): KeyPressed => {
  switch (action.type) {
    case ActionType.SET_KEY_DOWN:
      return { ...state, [action.key]: true }
    case ActionType.SET_KEY_UP:
      return { ...state, [action.key]: false }
    default:
      return state
  }
}

export const useKeyboardShortcuts = (commands: KeyboardCommand[]): void => {
  const initalKeyMapping = useMemo(() => {
    const currentKeys: KeyPressed = {}
    commands.forEach((command) => {
      command.shortcutKeys.forEach((key) => {
        const aliases = key.split('|')
        aliases.forEach((k) => {
          currentKeys[k.toLowerCase()] = false
        })
      })
    })

    KBAR_KEYS.map((key) => (currentKeys[key.toLowerCase()] = false))
    return currentKeys
  }, [commands])

  const [keys, setKeys] = useReducer(keysReducer, initalKeyMapping)

  const metaPressed = useCallback(() => {
    return keys['meta'] === true
  }, [keys])

  const applyCommands = useCallback(
    (updatedKeys: KeyPressed, disabled?: boolean) => {
      let commandApplied = false
      commands.forEach((command) => {
        if (disabled && !command.ignoreDisabledTargets) {
          return
        }
        const tempState = { ...updatedKeys }

        const arePressed = command.shortcutKeys.every((key) => {
          const aliases = key.split('|')
          for (const k of aliases) {
            if (tempState[k]) {
              delete tempState[k]
              return true
            }
          }
          return false
        })
        // apply callback if 1)corresponding buttons are pressed 2) no other buttons are pressed
        if (arePressed && !Object.values(tempState).some((k) => k)) {
          command.callback()
          commandApplied = true
          // remove applied keys from state to prevent Key Lifetime smashes
          command.shortcutKeys.forEach((key, index) => {
            // don't remove a base key to allow non-stop actions
            if (index === 0 && command.shortcutKeys.length > 1) return
            const aliases = key.split('|')
            for (const l of aliases) {
              setKeys({ type: ActionType.SET_KEY_UP, key: l })
            }
          })
        }
      })
      return commandApplied
    },
    [commands]
  )

  const keydownListener = useCallback(
    (keydownEvent: any) => {
      const { target } = keydownEvent
      if (!keydownEvent.key) return
      const key = keydownEvent.key.toLowerCase()
      if (keys[key] === undefined) return
      if (keys[key] === false) {
        if (key === 'k' && metaPressed()) {
          // not setting the K value because meta is already pressed
          return
        }
        setKeys({ type: ActionType.SET_KEY_DOWN, key })
      }
      const commandApplied = applyCommands(
        { ...keys, [key]: true },
        disabledTargets.includes(target.tagName)
      )
      if (commandApplied) {
        keydownEvent.preventDefault()
      }
    },
    [applyCommands, keys, metaPressed]
  )

  const keyupListener = useCallback(
    (keyupEvent: any) => {
      if (!keyupEvent.key) return
      const key = keyupEvent.key.toLowerCase()
      if (keys[key] === undefined) return

      if (keys[key] === true) {
        setTimeout(() => setKeys({ type: ActionType.SET_KEY_UP, key }), 800)
      }
    },
    [keys]
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.addEventListener('keydown', keydownListener, true)
    return () => window.removeEventListener('keydown', keydownListener, true)
  }, [keydownListener])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.addEventListener('keyup', keyupListener, true)
    return () => window.removeEventListener('keyup', keyupListener, true)
  }, [keyupListener])
}

export const useConfirmListener = (
  onConfirm?: () => void,
  onCancel?: () => void,
  ctrlOnConfirm = true
): void => {
  const keyHandleConfirm = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (onConfirm && key === 'enter') {
        // if control key is required we make sure CTRL on
        // meta is pressed when pressing enter.
        if (ctrlOnConfirm && !e.metaKey && !e.ctrlKey) {
          return
        }
        onConfirm()
      } else if (onCancel && key === 'escape') {
        onCancel()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCancel, onConfirm]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('keydown', keyHandleConfirm)
    return () => {
      window.removeEventListener('keydown', keyHandleConfirm)
    }
  }, [keyHandleConfirm])
}
