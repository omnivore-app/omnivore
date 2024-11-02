import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetcher } from './networkHelpers'
import { TaskState } from './mutations/exportToIntegrationMutation'

type Export = {
  id: string
  state: TaskState
  totalItems?: number
  processedItems?: number
  createdAt: string
  signedUrl: string
}

type ExportsResponse = {
  exports: Export[]
}

export const createExport = async (): Promise<boolean> => {
  try {
    const response = await apiFetcher(`/api/export/`)
    console.log('RESPONSE:  ', response)
    if ('error' in (response as any)) {
      return false
    }
    return true
  } catch (error) {
    console.log('error scheduling export. ')
    return false
  }
}

export function useGetExports() {
  return useQuery({
    queryKey: ['exports'],
    queryFn: async () => {
      const response = (await apiFetcher(`/api/export/list`)) as ExportsResponse
      return response.exports
    },
  })
}
