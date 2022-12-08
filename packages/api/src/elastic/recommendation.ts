import { Page, PageContext, Recommendation } from './types'
import { createPage, getPageByParam, updatePage } from './pages'

export const addRecommendation = async (
  ctx: PageContext,
  page: Page,
  recommendation: Recommendation,
  highlightIds?: string[]
): Promise<string | undefined> => {
  try {
    const highlights = page.highlights?.filter((highlight) =>
      highlightIds?.includes(highlight.id)
    )

    // check if the page is already recommended to the group
    const existingPage = await getPageByParam({
      userId: ctx.uid,
      url: page.url,
    })
    if (existingPage) {
      const existingHighlights = existingPage.highlights || []

      // remove duplicates
      const newHighlights =
        highlights?.filter(
          (highlight) =>
            !existingHighlights.find(
              (existingHighlight) => existingHighlight.quote === highlight.quote
            )
        ) || []

      const existingRecommendations = existingPage.recommendations || []
      const isRecommended = existingRecommendations.some(
        (existingRecommendation) =>
          existingRecommendation.id === recommendation.id
      )
      if (isRecommended && newHighlights.length === 0) {
        return existingPage._id
      }

      // update recommendations in the existing page
      const recommendations = isRecommended
        ? undefined
        : existingRecommendations.concat(recommendation)

      await updatePage(
        existingPage.id,
        {
          recommendations,
          highlights: existingHighlights.concat(newHighlights),
        },
        ctx
      )
      return existingPage.id
    }

    // create a new page
    const newPage: Page = {
      ...page,
      id: '',
      recommendations: [recommendation],
      userId: ctx.uid,
      readingProgressPercent: 0,
      readingProgressAnchorIndex: 0,
      sharedAt: new Date(),
      highlights,
      readAt: undefined,
      labels: [],
    }

    return createPage(newPage, ctx)
  } catch (err) {
    console.error(err)
  }
}
