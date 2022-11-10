import { Page, PageType } from '../elastic/types'
import { FeatureName, isOptedIn } from './features'

/*
 * We should synthesize the page when user is opted in to the feature
 */
export const shouldSynthesize = async (
  userId: string,
  page: Page
): Promise<boolean> => {
  if (page.pageType === PageType.File || !page.content) {
    // we don't synthesize files for now
    return false
  }

  return isOptedIn(FeatureName.UltraRealisticVoice, userId)
}
