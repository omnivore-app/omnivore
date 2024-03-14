import { addEmbeddingToArticle$, addTopicsToArticle$ } from './lib/ai/embedding'
import {
  insertArticleToStore$,
  removeDuplicateArticles$,
} from './lib/store/articles'
import { merge, Observable } from 'rxjs'
import { OmnivoreArticle } from './types/OmnivoreArticle'
import { rss$ } from './lib/inputSources/articles/rss/rssIngestor'
import { putImageInProxy$ } from './lib/clients/omnivore/imageProxy'
import { communityArticles$ } from './lib/inputSources/articles/communityArticles'

const enrichedArticles$ = (): Observable<OmnivoreArticle> => {
  return merge(communityArticles$, rss$) as Observable<OmnivoreArticle>
}

;(() => {
  enrichedArticles$()
    .pipe(
      // removeDuplicateArticles$,
      addEmbeddingToArticle$,
      addTopicsToArticle$,
      putImageInProxy$,
      insertArticleToStore$
    )
    .subscribe((it) => {
      console.log('enriched: ', it)
    })
})()
