import { addEmbeddingToArticle, addEmbeddingToLabel, addTopicsToArticle$ } from "./lib/ai/embedding"
import { insertArticleToStore, removeDuplicateArticles } from "./lib/store/articles"
import { merge, Observable, tap } from "rxjs"
import { OmnivoreArticle } from "./types/OmnivoreArticle";
import { rss$ } from "./lib/inputSources/articles/rss/rssIngestor";

const enrichedArticles$ = (): Observable<OmnivoreArticle> => {
  return merge(
    rss$,
  );
};

(async () => {
  enrichedArticles$()
    .pipe(removeDuplicateArticles,  addEmbeddingToArticle, addTopicsToArticle$, insertArticleToStore)
    .subscribe((it) =>  {});
})();
