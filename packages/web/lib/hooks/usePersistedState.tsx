import { useState, useEffect } from 'react'

export function usePersistedState<T>({
  key,
  initialValue,
  isSessionStorage,
}: {
  key: string
  initialValue: T
  isSessionStorage?: boolean
}): [T, (x: T | ((prev: T) => T)) => void, boolean] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [isLoading, setIsLoading] = useState(true)
  const [storedValue, setStoredValue] = useState(initialValue)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      // Get from local storage by key
      const item =
        window[isSessionStorage ? 'sessionStorage' : 'localStorage'].getItem(
          key
        )
      // Parse stored json or if none return initialValue
      if (item) {
        setStoredValue(JSON.parse(item))
      }
      setIsLoading(false)
    } catch (error) {
      // If error also return initialValue
      console.log(error)
    }
  }, [isSessionStorage, key, setStoredValue])

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((prev: T) => T)): void => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      window[isSessionStorage ? 'sessionStorage' : 'localStorage'].setItem(
        key,
        JSON.stringify(valueToStore)
      )
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }

  return [storedValue, setValue, isLoading]
}
