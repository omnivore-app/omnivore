import { UserBasicData } from './networking/queries/useGetViewerQuery'

const VIP_USERS = ['jacksonh', 'satindar', 'hongbo', 'nat']

export const isVipUser = (user: UserBasicData): boolean => {
  return VIP_USERS.includes(user.profile.username)
}
