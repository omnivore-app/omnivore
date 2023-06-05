import { Page } from '../elastic/types'
import { ContentReader } from '../generated/graphql'
import { contentReaderForPage } from '../utils/uploads'
import { FeatureName, isOptedIn } from './features'

/*
 * We should synthesize the page when user is opted in to the feature
 */
export const shouldSynthesize = async (
  userId: string,
  page: Page
): Promise<boolean> => {
  if (
    contentReaderForPage(page.pageType, page.uploadFileId) !==
      ContentReader.Web ||
    !page.content
  ) {
    // we don't synthesize files for now
    return false
  }

  return isOptedIn(FeatureName.UltraRealisticVoice, userId)
}
