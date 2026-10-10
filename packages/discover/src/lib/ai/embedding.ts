/* eslint-disable @typescript-eslint/no-unsafe-call */
import { mergeMap } from 'rxjs/operators'
import { OmnivoreArticle } from '../../types/OmnivoreArticle'
import { OperatorFunction, pipe, share } from 'rxjs'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import { client } from '../clients/ai/client'
import { onErrorContinue, rateLimiter } from '../utils/reactive'
import { Label } from '../../types/OmnivoreSchema'
import { sqlClient } from '../store/db'
import { isAiEnabled } from '../../env'
import { toSql } from 'pgvector/pg'
import { DiscoverTopic } from '../../types/DiscoverTopic'

export type EmbeddedOmnivoreArticle = {
  embedding: Array<number>
  article: OmnivoreArticle
  topics: DiscoverTopic[]
}

export type EmbeddedOmnivoreTopic = {
  embedding: Array<number>
  topic: DiscoverTopic
}

// Remove, for instance, "The Verge" and " - The Verge" to avoid the cosine similarity matching on that.
export const prepareTitle = (article: OmnivoreArticle): string =>
  article.title
    .replace(article.site, '')
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\\\/]/gi, '')

const getEmbeddingForArticle = async (
  it: OmnivoreArticle
): Promise<EmbeddedOmnivoreArticle> => {
  if (!isAiEnabled()) {
    return {
      embedding: [],
      article: it,
      topics: [],
    }
  }

  const embedding = await client.getEmbeddings(it)

  return {
    embedding,
    article: it,
    topics: [],
  }
}

const addTopicsToArticle = async (
  it: EmbeddedOmnivoreArticle
): Promise<EmbeddedOmnivoreArticle> => {
  const articleEmbedding = it.embedding

  if (articleEmbedding.length === 0) {
    return it
  }

  const topics = await sqlClient.query(
    client.selectQuery,
    [toSql(articleEmbedding)]
  )

  const topicNames: DiscoverTopic[] = Object.values(
      topics.rows
        .filter(client.thresholdFilter)
        .reduce((prev: Record<string, DiscoverTopic>, current: { name: string, subject: string }) => {
          if (!prev[current.name]) {
            prev[current.name] = { name: current.name, subject: current.subject }
          } else {
            prev[current.name].subject = `${prev[current.name].subject}, ${current.subject}`
          }

          return prev as Record<string, DiscoverTopic>;
        }, { } as Record<string, DiscoverTopic>)
  );


  if (topicNames.length == 0) {
    topicNames.push({ name: topics.rows[0].name, subject: topics.rows[0].subject })
  }


  if (it.article.type == 'community') {
    topicNames.push({ name: 'Community Picks', subject: 'Community Picks' });
  }

  return {
    ...it,
    topics: topicNames,
  }
}

const getEmbeddingForTopic = async (
  topic: DiscoverTopic
): Promise<EmbeddedOmnivoreTopic> => {
  const embedding = await client.getEmbeddings({
    title: `${topic.name}${topic.description ? ' : ' + topic.description : ''}`,
  } as OmnivoreArticle)

  return {
    embedding,
    topic,
  }
}

export const rateLimitEmbedding = <T>() =>
  pipe(share(), rateLimiter<T>({ resetLimit: 1000, timeMs: 60_000 }))

export const rateLimiting = rateLimitEmbedding<any>()

export const addEmbeddingToTopic$: OperatorFunction<
  DiscoverTopic,
  EmbeddedOmnivoreTopic
> = pipe(
  rateLimiting,
  mergeMap((it: DiscoverTopic) => fromPromise(getEmbeddingForTopic(it)))
)

export const addEmbeddingToArticle$: OperatorFunction<
  OmnivoreArticle,
  EmbeddedOmnivoreArticle
> = pipe(
  rateLimiting,
  onErrorContinue(
    mergeMap((it: OmnivoreArticle) => fromPromise(getEmbeddingForArticle(it)))
  )
)

export const addTopicsToArticle$: OperatorFunction<
  EmbeddedOmnivoreArticle,
  EmbeddedOmnivoreArticle
> = pipe(
  onErrorContinue(
    mergeMap((it: EmbeddedOmnivoreArticle) =>
      fromPromise(addTopicsToArticle(it))
    )
  )
)
