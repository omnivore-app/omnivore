import { useEffect } from 'react'
import { useRouter } from 'next/router'

export function useVerifyAuth() {
  const router = useRouter()

  useEffect(() => {
    if (window.localStorage.getItem('authVerified')) {
      console.log('not verified')
      return
    }
  }, [router])
}
