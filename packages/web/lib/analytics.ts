import { UserBasicData } from './networking/queries/useGetViewerQuery'
import { intercomAppID, posthogApiKey } from './appConfig'
import posthog from 'posthog-js'

if (posthogApiKey) {
  posthog.init(posthogApiKey, {
    api_host: 'https://app.posthog.com',
  })
}

const userInfo = (user: UserBasicData): { user_id: string; name: string } => {
  return {
    user_id: user.id,
    name: user.name,
  }
}

const initAnalytics = (user?: UserBasicData): void => {
  window.intercomSettings = {
    app_id: intercomAppID ?? '',
    hide_default_launcher: true,
    vertical_padding: 120,
    custom_launcher_selector: '.custom-intercom-launcher',
  }
  if (user) {
    window.Intercom('boot', userInfo(user))
  }
  window.ANALYTICS_INITIALIZED = true
}

export const setupAnalytics = (user?: UserBasicData): void => {
  if (!intercomAppID || !window.Intercom) {
    return
  }
  if (!window.ANALYTICS_INITIALIZED) {
    initAnalytics(user)
  }

  if (user) {
    window.Intercom('update', userInfo(user))
    posthog.identify(user.id, {
      name: user.name,
      username: user.profile.username,
    })
  }
}
