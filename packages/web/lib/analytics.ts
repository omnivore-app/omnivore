import { UserBasicData } from './networking/queries/useGetViewerQuery'
import { intercomAppID, posthogApiKey, webBaseURL } from './appConfig'
import posthog from 'posthog-js'

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
  if (posthogApiKey) {
    posthog.init(posthogApiKey, {
      api_host: `${webBaseURL}/collect`,
      autocapture: false,
      disable_session_recording: false,
      advanced_disable_decide: true,
      advanced_disable_feature_flags: true,
      advanced_disable_toolbar_metrics: true,
    })
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

export const deinitAnalytics = (): void => {
  if (posthog && posthogApiKey) {
    posthog.reset(true)
  }
}
