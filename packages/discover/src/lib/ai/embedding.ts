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

export type EmbeddedOmnivoreArticle = {
  embedding: Array<number>
  article: OmnivoreArticle
  topics: string[]
}

export type EmbeddedOmnivoreLabel = {
  embedding: Array<number>
  label: Label
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

  // OpenAI seems to cluster things around 0.7-0.9. Through trial and error I have found 0.77 to be a fairly accurate score.
  const topicNames = topics.rows
    .filter(client.thresholdFilter)
    .map(({ name }) => name as string)

  if (topicNames.length == 0) {
    topicNames.push(topics.rows[0]?.name)
  }


  if (it.article.type == 'community') {
    topicNames.push('Community Picks')
  }

  return {
    ...it,
    topics: topicNames,
  }
}

const getEmbeddingForLabel = async (
  label: Label
): Promise<EmbeddedOmnivoreLabel> => {
  const embedding = await client.getEmbeddings({
    title: `${label.name}${label.description ? ' : ' + label.description : ''}`
  } as OmnivoreArticle)

  return {
    embedding,
    label,
  }
}

export const rateLimitEmbedding = <T>() =>
  pipe(share(), rateLimiter<T>({ resetLimit: 1000, timeMs: 60_000 }))

export const rateLimiting = rateLimitEmbedding<any>()

export const addEmbeddingToLabel$: OperatorFunction<
  Label,
  EmbeddedOmnivoreLabel
> = pipe(
  rateLimiting,
  mergeMap((it: Label) => fromPromise(getEmbeddingForLabel(it)))
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
