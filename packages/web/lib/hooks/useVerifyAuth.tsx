import { useEffect } from 'react'
import { useRouter } from 'next/router'

export function useVerifyAuth() {
  const router = useRouter()

  useEffect(() => {
    if (!window.localStorage.getItem('authVerified')) {
      window.location.href = `/login?redirect=${window.location.pathname}`
      return
    }
  }, [router])
}
