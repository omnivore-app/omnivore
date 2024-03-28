import { UserBasicData } from './networking/queries/useGetViewerQuery'

export const userHasFeature = (
  user: UserBasicData | undefined,
  feature: string
): boolean => {
  if (!user) {
    return false
  }
  return user.featureList.some(
    (f) =>
      f.name === feature &&
      f.grantedAt &&
      (!f.expiresAt || new Date(f.expiresAt) > new Date())
  )
}
