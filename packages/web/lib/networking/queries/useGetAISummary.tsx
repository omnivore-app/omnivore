import useSWR, { Fetcher } from 'swr'
import { apiFetcher } from '../networkHelpers'

export interface AISummary {
  id: string
  summary: string
}

export interface AISummaryResponse {
  error: any
  isValidating: boolean
  summary: string | undefined
}

export function useGetAISummary(params: {
  idx: string
  libraryItemId: string
}): AISummaryResponse {
  const { idx, libraryItemId } = params
  const { data, error, isValidating } = useSWR(
    `/api/ai-summary/library-item/${libraryItemId}/${idx}`,
    apiFetcher
  )

  try {
    const result = data as AISummary
    console.log('ai summary result: ', result)
    return {
      error,
      isValidating,
      summary: result.summary,
    }
  } catch (error) {
    console.log('error', error)
    return {
      error,
      isValidating: false,
      summary: undefined,
    }
  }
}
