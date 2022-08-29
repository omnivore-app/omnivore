import { searchPages } from '../elastic/pages'
import { Page, PageType } from '../elastic/types'
import { SortBy, SortOrder } from '../utils/search'

/*
 * We should not synthesize the page when:
 ** 1. User has no recent listens the last 30 days
 ** 2. User has a recent listen but the page was saved after the listen
 */
export const shouldSynthesize = async (
  userId: string,
  page: Page
): Promise<boolean> => {
  if (page.pageType === PageType.File || !page.content) {
    // we don't synthesize files for now
    return false
  }

  if (process.env.TEXT_TO_SPEECH_BETA_TEST) {
    return true
  }

  const [recentListenedPage, count] = (await searchPages(
    {
      dateFilters: [
        {
          field: 'listenedAt',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      ],
      sort: {
        by: SortBy.LISTENED,
        order: SortOrder.DESCENDING,
      },
      size: 1,
    },
    userId
  )) || [[], 0]
  if (count === 0) {
    return false
  }
  return (
    !!recentListenedPage[0].listenedAt &&
    page.savedAt < recentListenedPage[0].listenedAt
  )
}
