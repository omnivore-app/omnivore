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
import { normalize, normalizeMinMax } from '../utils/math'

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

  const embedding = normalize(await client.getEmbeddings(it))

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


  // We cluster the most likely around some others.
  let topicNames = topics.rows
      .map(it => ({
        ...it,
        similarity: normalizeMinMax(it.similarity, 0.69, 0.8).toFixed(2)
      }))
      .filter(client.thresholdFilter)

  // If we haven't filtered any, let's get a clustering of the best and then find similar ones around it.
  if (topicNames.length == 0) {
    let comparator =  { ...topics.rows[0], similarity: normalizeMinMax(topics.rows[0].similarity, 0.69, 0.8) }
    topics.rows.shift()
    topicNames.push(
      ...[
        comparator,
        ...topics.rows
          .map((it) => ({
            ...it,
            similarity: normalizeMinMax(it.similarity, 0.69, 0.8)
          }))
          .filter(
            (topic) =>
              Math.abs(comparator.similarity - topic.similarity) <= 0.05
          ),
      ]
    )
  }

  console.log(
    topicNames
      .map(
        (topic: { name: string; subject: string; similarity: number }) =>
          `${it.article.title}:: ${topic.name}, ${topic.subject} === ${topic.similarity}`
      )
  )

  topicNames = Object.values(topicNames.reduce(
    (
      prev: Record<string, DiscoverTopic>,
      current: { name: string; subject: string }
    ) => {
      if (!prev[current.name]) {
        prev[current.name] = { name: current.name, subject: current.subject }
      } else {
        prev[current.name].subject = `${prev[current.name].subject}, ${
          current.subject
        }`
      }

      return prev as Record<string, DiscoverTopic>
    },
    {} as Record<string, DiscoverTopic>
  ))




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
    embedding: normalize(embedding),
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
