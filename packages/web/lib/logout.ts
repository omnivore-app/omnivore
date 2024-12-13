import { useQueryClient } from '@tanstack/react-query'
import { logoutMutation } from './networking/mutations/logoutMutation'
import { useCallback } from 'react'
import { useRouter } from 'next/router'

export const useLogout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const logout = useCallback(async () => {
    await logoutMutation()
    try {
      const result = await logoutMutation()
      if (!result) {
        throw new Error('Logout failed')
      }
      queryClient.clear()
      console.log('cleared the query client')
      router.push('/login')
    } catch (err) {
      console.log('error on logout: ', err)
      router.push('/')
    }
  }, [])
  return { logout }
}
