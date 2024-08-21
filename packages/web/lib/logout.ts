import { useQueryClient } from '@tanstack/react-query'
import { deinitAnalytics } from './analytics'
import { logoutMutation } from './networking/mutations/logoutMutation'
import { useCallback } from 'react'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const logout = useCallback(async () => {
    await logoutMutation()
    try {
      const result = await logoutMutation()
      if (!result) {
        throw new Error('Logout failed')
      }
      deinitAnalytics()
      queryClient.clear()
      window.location.href = '/login'
    } catch {
      // TODO: display an error message instead
      window.location.href = '/'
    }
  }, [])
  return { logout }
}
