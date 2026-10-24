import {
  addEmbeddingToArticle$,
  addEmbeddingToTopic$,
  addTopicsToArticle$,
} from './lib/ai/embedding'
import {
  insertArticleToStore$,
  removeDuplicateArticles$,
} from './lib/store/articles'
import { lastValueFrom, Observable } from 'rxjs'
import { OmnivoreArticle } from './types/OmnivoreArticle'
import { rss$ } from './lib/inputSources/articles/rss/rssIngestor'
import { putImageInProxy$ } from './lib/clients/omnivore/imageProxy'
import { discoverTopics$ } from './lib/inputSources/labels/discoverTopics'
import { insertTopicToStore, returnTopicName } from './lib/store/labels'
import { isAiEnabled } from './env'
// import { communityArticles$ } from './lib/inputSources/articles/communityArticles'

const enrichedArticles$ = (): Observable<OmnivoreArticle> => {
  return rss$ as Observable<OmnivoreArticle>
}

;(async () => {

  const existingLabels = await returnTopicName()
  if (existingLabels.length === 0 && (isAiEnabled())) {
    await lastValueFrom(
      discoverTopics$
        .pipe(addEmbeddingToTopic$, insertTopicToStore)
    );
  }

  enrichedArticles$()
    .pipe(
      removeDuplicateArticles$,
      addEmbeddingToArticle$,
      addTopicsToArticle$,
      putImageInProxy$,
      insertArticleToStore$
    )
    .subscribe((_it) => {})
})()
