import { UserBasicData } from './networking/queries/useGetViewerQuery'
import { intercomAppID } from './appConfig'

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
  if (!intercomAppID) return
  if (!window.Intercom) return
  if (!window.ANALYTICS_INITIALIZED) initAnalytics(user)

  if (user) {
    window.Intercom('update', userInfo(user))
  }
}
