import { useEffect } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { apiFetcher } from '../networking/networkHelpers'
import { fetchEndpoint } from '../appConfig'

export function useIsUserLoggedOut() {
  const response = useSWR(`${fetchEndpoint}/auth/verify`, apiFetcher)
  // We are not sure yet
  if (!response.data && !response.error) {
    return false
  }
  if (!response.error && 'authStatus' in (response.data as any)) {
    const { authStatus } = response.data as any
    return authStatus !== 'AUTHENTICATED'
  }
  return true
}
