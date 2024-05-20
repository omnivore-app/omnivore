import { addEmbeddingToArticle$, addTopicsToArticle$ } from './lib/ai/embedding'
import {
  insertArticleToStore$,
  removeDuplicateArticles$,
} from './lib/store/articles'
import { merge, Observable, lastValueFrom } from 'rxjs'
import { OmnivoreArticle } from './types/OmnivoreArticle'
import { rss$ } from './lib/inputSources/articles/rss/rssIngestor'
import { putImageInProxy$ } from './lib/clients/omnivore/imageProxy'
import { communityArticles$ } from './lib/inputSources/articles/communityArticles'

const enrichedArticles$ = (): Observable<OmnivoreArticle> => {
  return merge(communityArticles$, rss$) as Observable<OmnivoreArticle>
}

const discover = async () =>
  await lastValueFrom(
    rss$.pipe(
      addEmbeddingToArticle$,
      addTopicsToArticle$,
      putImageInProxy$,
      insertArticleToStore$
    )
  )

export default discover
