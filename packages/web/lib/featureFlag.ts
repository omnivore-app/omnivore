import { UserBasicData } from './networking/queries/useGetViewerQuery'

const VIP_USERS = ['jacksonh', 'satindar', 'hongbo', 'nat']

export const isVipUser = (user: UserBasicData): boolean => {
  return VIP_USERS.includes(user.profile.username)
}

export const userHasFeature = (
  user: UserBasicData | undefined,
  feature: string
): boolean => {
  if (!user) {
    return false
  }
  return user.features.includes(feature)
}
