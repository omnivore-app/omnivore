/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { EmbeddedOmnivoreArticle } from '../ai/embedding'
import { filter, map, mergeMap, bufferTime } from 'rxjs/operators'
import { toSql } from 'pgvector/pg'
import { OmnivoreArticle } from '../../types/OmnivoreArticle'
import { from, pipe } from 'rxjs'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import { sqlClient } from './db'
import pgformat from 'pg-format'
import { v4 } from 'uuid'
import { onErrorContinue } from '../utils/reactive'

const hasStoredInDatabase = async (articleSlug: string, feedId: string) => {
  const { rows } = await sqlClient.query(
    'SELECT slug FROM omnivore.discover_feed_articles WHERE slug = $1 and feed_id = $2',
    [articleSlug, feedId]
  )
  return rows && rows.length === 0
}

export const removeDuplicateArticles$ = onErrorContinue(
  mergeMap((x: OmnivoreArticle) =>
    fromPromise(hasStoredInDatabase(x.slug, x.feedId)).pipe(
      filter(Boolean),
      map(() => x)
    )
  )
)

export const batchInsertArticlesSql = async (
  articles: EmbeddedOmnivoreArticle[]
) => {
  const params = articles.map((embedded) => [
    v4(),
    embedded.article.title,
    embedded.article.feedId,
    embedded.article.slug,
    embedded.article.description,
    embedded.article.url,
    embedded.article.authors,
    embedded.article.image,
    embedded.article.publishedAt,
    toSql(embedded.embedding),
  ])

  if (articles.length > 0) {
    const formattedMultiInsert = pgformat(
      `INSERT INTO omnivore.discover_feed_articles(id, title, feed_id, slug, description, url, author, image, published_at, embedding) VALUES %L ON CONFLICT DO NOTHING`,
      params
    )

    await sqlClient.query(formattedMultiInsert)

    const topicLinks = articles.flatMap((it, idx) => {
      const [uuid] = params[idx]
      return it.topics.map((topic) => [topic, uuid])
    })

    const formattedTopicInsert = pgformat(
      `INSERT INTO omnivore.discover_feed_article_topic_link(discover_topic_name, discover_feed_article_id) VALUES %L ON CONFLICT DO NOTHING`,
      topicLinks
    )
    await sqlClient.query(formattedTopicInsert)

    return articles
  }

  return articles
}

export const insertArticleToStore$ = pipe(
  bufferTime<EmbeddedOmnivoreArticle>(5000, null, 100),
  onErrorContinue(
    mergeMap((x: EmbeddedOmnivoreArticle[]) =>
      fromPromise(batchInsertArticlesSql(x))
    )
  ),
  mergeMap((it: EmbeddedOmnivoreArticle[]) => from(it))
)
