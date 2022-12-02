import { Page, PageContext, Recommendation } from './types'
import { createPage, getPageByParam, updatePage } from './pages'

export const addRecommendation = async (
  ctx: PageContext,
  page: Page,
  recommendation: Recommendation
): Promise<string | undefined> => {
  try {
    const userId = ctx.uid
    // check if the page is already recommended to the group
    const existingPage = await getPageByParam({
      userId,
      url: page.url,
    })
    if (existingPage) {
      // update recommendedBy in the existing page
      const recommendedBy = (existingPage.recommendedBy || []).concat(
        recommendation
      )

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
      recommendedBy: [recommendation],
      userId,
    }

    return createPage(newPage, ctx)
  } catch (err) {
    console.error(err)
  }
}
