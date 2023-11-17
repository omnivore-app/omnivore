import {
  myArticles$,
  removeNearEmptyArticles,
} from "./lib/inputSources/myArticleIngestor";
import { addEmbeddingToArticle, addEmbeddingToLabel } from "./lib/ai/embedding";
import { insertArticleToStore } from "./lib/store/articles";
import { insertLabelToStore, removeDuplicateLabels } from "./lib/store/labels";
import { catchError, EMPTY, merge, Observable, partition } from "rxjs";
import { needsPopulating } from "./lib/ai/enrich";
import { OmnivoreArticle } from "./types/OmnivoreArticle";
import { rss$ } from "./lib/inputSources/articles/rss/rssIngestor";
import { userLabels$ } from "./lib/inputSources/labels/labelIngestor";
import { map } from "rxjs/operators";
import { createRelatedConceptsIfNoDescription } from "./lib/ai/label";
import { Label } from "./types/OmnivoreSchema";

const removeUidFromSlug = map((it: OmnivoreArticle) => {
  const splitSlug = it.slug.split("-");
  const removedUniqueIdSlug = splitSlug
    .slice(0, splitSlug.length - 1)
    .join("-");

  return { ...it, slug: removedUniqueIdSlug };
});

const enrichedArticles$ = (): Observable<OmnivoreArticle> => {
  const filteredDocuments = myArticles$.pipe(removeNearEmptyArticles);
  const [enriched, nonEnriched] = partition(filteredDocuments, needsPopulating);
  const [addContent, aiEnrich] = partition(
    enriched,
    (it) => it.wordsCount < 100,
  );

  return merge(
    // concat(
    //   nonEnriched,
    //   aiEnrich.pipe(tap(console.log), enrichArticleWithAiGeneratedDescription, tap(console.log)),
    //   addContent.pipe(tap(console.log), setArticleDescriptionAsSubsetOfContent, tap(console.log))
    // ).pipe(removeUidFromSlug),
    rss$,
  );
};

(async () => {
  // userLabels$
  //   .pipe(
  //     map((it: Label): Label => ({ name: it.name.toLowerCase(), ...it })),
  //     removeDuplicateLabels,
  //     createRelatedConceptsIfNoDescription,
  //     addEmbeddingToLabel,
  //     insertLabelToStore,
  //   )
  //   .subscribe((it) => {});

  enrichedArticles$()
    // .pipe(addEmbeddingToArticle, insertArticleToStore)
    .subscribe((it) => console.log(`Me:${it.title}: ${it.publishedAt}`));
})();
