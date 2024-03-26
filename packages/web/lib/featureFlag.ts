import { UserBasicData } from './networking/queries/useGetViewerQuery'

export const userHasFeature = (
  user: UserBasicData | undefined,
  feature: string
): boolean => {
  if (!user) {
    return false
  }
  return user.features.includes(feature)
}
