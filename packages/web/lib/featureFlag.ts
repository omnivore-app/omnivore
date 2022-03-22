import { UserBasicData } from "./networking/queries/useGetViewerQuery"

const VIP_USERS = ['jacksonh', 'satindar', 'hongbo']

export const isVipUser = (username: string): boolean => {
  return VIP_USERS.includes(username)
}
