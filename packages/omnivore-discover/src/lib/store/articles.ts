import { EmbeddedOmnivoreArticle } from "../ai/embedding";
import { filter, map, mergeMap, bufferTime, buffer } from "rxjs/operators";
import { toSql } from "pgvector/pg";
import { OmnivoreArticle } from "../../types/OmnivoreArticle";
import { from, pipe } from "rxjs";
import { fromPromise } from "rxjs/internal/observable/innerFrom";
import { sqlClient } from "./db";
import pgformat from "pg-format";

const hasStoredInDatabase = async (articleSlug: string) => {
  const { rows } = await sqlClient.query(
    "SELECT slug FROM article_embeddings WHERE slug = $1",
    [articleSlug],
  );
  return rows && rows.length === 0;
};

export const removeDuplicateArticles = mergeMap((x: OmnivoreArticle) =>
  fromPromise(hasStoredInDatabase(x.slug)).pipe(
    filter(Boolean),
    map(() => x),
  ),
);

export const batchInsertArticlesSql = async (
  articles: EmbeddedOmnivoreArticle[],
) => {
  const params = articles.map((embedded) => [
    embedded.article.slug,
    embedded.article.authors,
    embedded.article.description,
    embedded.article.image,
    toSql(embedded.embedding),
    embedded.article.publishedAt,
    embedded.article.title,
  ]);
  if (articles.length > 0) {
    const formattedMultiInsert = pgformat(
      `INSERT INTO article_embeddings(slug, author, description, img, embedding, publishedDate, title) VALUES %L ON CONFLICT DO NOTHING`,
      params,
    );
    await sqlClient.query(formattedMultiInsert);

    return articles;
  }

  return articles;
};

export const insertArticleToStore = pipe(
  bufferTime(5000, null, 100),
  mergeMap((x: EmbeddedOmnivoreArticle[]) =>
    fromPromise(batchInsertArticlesSql(x)),
  ),
  mergeMap((it: EmbeddedOmnivoreArticle[]) => from(it)),
);
