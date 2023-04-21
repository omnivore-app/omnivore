import { Page, PageType } from '../elastic/types'
import { ContentReader } from '../generated/graphql'
import { contentReaderForPageType } from '../utils/uploads'
import { FeatureName, isOptedIn } from './features'

/*
 * We should synthesize the page when user is opted in to the feature
 */
export const shouldSynthesize = async (
  userId: string,
  page: Page
): Promise<boolean> => {
  if (
    contentReaderForPageType(page.pageType) !== ContentReader.Web ||
    !page.content
  ) {
    // we don't synthesize files for now
    return false
  }

  return isOptedIn(FeatureName.UltraRealisticVoice, userId)
}
