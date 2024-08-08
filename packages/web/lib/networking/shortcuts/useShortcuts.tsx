import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requestHeaders } from '../networkHelpers'
import { fetchEndpoint } from '../../appConfig'
import { Label } from '../fragments/labelFragment'

export type ShortcutType = 'search' | 'label' | 'newsletter' | 'feed' | 'folder'

export type Shortcut = {
  type: ShortcutType

  id: string
  name: string
  section: string
  filter: string

  icon?: string
  label?: Label

  join?: string

  children?: Shortcut[]
}

export function useGetShortcuts() {
  return useQuery({
    queryKey: ['shortcuts'],
    queryFn: async () => {
      return await getShortcuts()
    },
  })
}

export const useSetShortcuts = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { shortcuts: Shortcut[] }) => {
      return await setShortcuts(variables)
    },
    onMutate: async (variables: { shortcuts: Shortcut[] }) => {
      await queryClient.cancelQueries({ queryKey: ['shortcuts'] })
      queryClient.setQueryData(['shortcuts'], variables.shortcuts)
      const previousState = {
        previousItems: queryClient.getQueryData(['shortcuts']),
      }
      return previousState
    },
    onError: (error, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['shortcuts'], context.previousItems)
      }
    },
  })
}

export const useResetShortcuts = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      return await resetShortcuts()
    },
    onMutate: async () => {
      const previousState = {
        previousItems: queryClient.getQueryData(['shortcuts']),
      }
      return previousState
    },
    onError: (error, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['shortcuts'], context.previousItems)
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['shortcuts'], data)
    },
  })
}

async function getShortcuts(): Promise<Shortcut[]> {
  const url = new URL(`/api/shortcuts`, fetchEndpoint)
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: requestHeaders(),
      credentials: 'include',
      mode: 'cors',
    })
    const payload = await response.json()
    if ('shortcuts' in payload) {
      return payload['shortcuts'] as Shortcut[]
    }
    return []
  } catch (err) {
    console.log('error getting shortcuts: ', err)
    throw err
  }
}

async function setShortcuts(variables: {
  shortcuts: Shortcut[]
}): Promise<Shortcut[]> {
  const url = new URL(`/api/shortcuts`, fetchEndpoint)
  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...requestHeaders(),
    },
    credentials: 'include',
    mode: 'cors',
    body: JSON.stringify({ shortcuts: variables.shortcuts }),
  })
  const payload = await response.json()
  if (!('shortcuts' in payload)) {
    throw new Error('Error syncing shortcuts')
  }
  return payload['shortcuts'] as Shortcut[]
}

async function resetShortcuts(): Promise<Shortcut[]> {
  const url = new URL(`/api/shortcuts`, fetchEndpoint)
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...requestHeaders(),
    },
    credentials: 'include',
    mode: 'cors',
  })
  const payload = await response.json()
  if (!('shortcuts' in payload)) {
    throw new Error('Error syncing shortcuts')
  }
  return payload['shortcuts'] as Shortcut[]
}
