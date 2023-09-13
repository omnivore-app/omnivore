import { deinitAnalytics } from './analytics'
import { logoutMutation } from './networking/mutations/logoutMutation'

export const logout = async () => {
  await logoutMutation()
  try {
    const result = await logoutMutation()
    if (!result) {
      throw new Error('Logout failed')
    }
    deinitAnalytics()
    window.location.href = '/login'
  } catch {
    // TODO: display an error message instead
    window.location.href = '/'
  }
}
