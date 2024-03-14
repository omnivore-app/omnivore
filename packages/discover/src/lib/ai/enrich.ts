import { OmnivoreClient } from '../clients/omnivore/omnivore'
import { OmnivoreArticle } from '../../types/OmnivoreArticle'
import { mergeMap, OperatorFunction, pipe } from 'rxjs'
import { client } from '../clients/ai/client'
import { convert } from 'html-to-text'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import { exponentialBackOff, rateLimiter } from '../utils/reactive'
import { env } from '../../env'

const omnivoreClient = OmnivoreClient.createOmnivoreClient(env.apiKey)

// A basic metric for now, we will see later if anything needs to be improved in this area.
// 10 Words is probably sufficient, and will reduce the need for the bill on the Summary side.
export const needsPopulating = (article: OmnivoreArticle) => {
  return article.description?.split(' ').length <= 3
}

const setArticleDescription = async (
  article: OmnivoreArticle
): Promise<OmnivoreArticle> => {
  const client = await omnivoreClient
  const { content } = await client.fetchPage(article.slug)
  return {
    ...article,
    description: convert(content).split(' ').slice(0, 25).join(' '),
  }
}

export const setArticleDescriptionAsSubsetOfContent: OperatorFunction<
  OmnivoreArticle,
  OmnivoreArticle
> = mergeMap(
  (it: OmnivoreArticle) => fromPromise(setArticleDescription(it)),
  10
)

const enrichArticleWithAiSummary = (it: OmnivoreArticle) =>
  fromPromise(
    (async (article: OmnivoreArticle): Promise<OmnivoreArticle> => {
      const omniClient = await omnivoreClient
      const { content } = await omniClient.fetchPage(article.slug)

      try {
        const tokens = convert(content).slice(
          0,
          Math.floor(client.tokenLimit * 0.75)
        )
        const description = await client.summarizeText(tokens)
        return { ...article, description }
      } catch (e) {
        console.log(`Error article: ${article.title}`)
        console.log(e)
        throw e
      }
    })(it)
  )

export const enrichArticleWithAiGeneratedDescription: OperatorFunction<
  OmnivoreArticle,
  OmnivoreArticle
> = pipe(
  rateLimiter({ resetLimit: 50, timeMs: 60_000 }),
  mergeMap((it: OmnivoreArticle) =>
    enrichArticleWithAiSummary(it).pipe(exponentialBackOff(30))
  )
)
