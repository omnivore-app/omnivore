import { useEffect } from 'react'
import { logoutMutation } from '../lib/networking/mutations/logoutMutation'
import { webBaseURL } from '../lib/appConfig'

export default function Logout(): JSX.Element {
  useEffect(() => {
    async function logoutAPI(): Promise<void> {
      await logoutMutation()
      try {
        const result = await logoutMutation()
        if (!result) {
          throw new Error('Logout failed')
        }
      } catch (error) {
        console.log('error logging out', error)
      }
    }
    async function logoutLocal(): Promise<void> {
      console.trace('making auth verify call')
      // Note that we are using web URL so we get a URL like
      // omnivore.app/api/client/logout, this will clear
      // the cookie on the frontend domain
      await fetch(`${webBaseURL}/api/client/logout`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
    }
    window.localStorage.removeItem('authVerified')
    window.localStorage.removeItem('authToken')

    logoutAPI().then(() => {
      logoutLocal()
    })
  })

  return (
    <>
      <div data-testid="login-page-tag" />
      <div>You have been logged out.</div>
    </>
  )
}
