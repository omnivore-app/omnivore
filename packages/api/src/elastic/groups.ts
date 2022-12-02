import { Group, Page, PageContext } from './types'
import { createPage, updatePage } from './pages'

export const recommendPage = async (
  ctx: PageContext,
  page: Page,
  userId: string,
  group: Group,
  existingPage?: Page
): Promise<string | undefined> => {
  try {
    if (existingPage) {
      // update recommendedBy in the existing page
      const recommendedBy = (existingPage.recommendedBy || []).concat(group)

      await updatePage(
        existingPage.id,
        {
          recommendedBy,
        },
        ctx
      )
      return existingPage.id
    }

    // create a new page
    const newPage = {
      ...page,
      recommendedBy: [group],
      userId,
    }

    return createPage(newPage, ctx)
  } catch (err) {
    console.error(err)
  }
}
