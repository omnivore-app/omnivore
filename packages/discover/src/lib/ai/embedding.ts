import { mergeMap } from 'rxjs/operators'
import { OmnivoreArticle } from '../../types/OmnivoreArticle'
import { OperatorFunction, pipe, share } from 'rxjs'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import { client } from '../clients/ai/client'
import { rateLimiter } from '../utils/reactive'
import { Label } from '../../types/OmnivoreSchema'
import { sqlClient } from '../store/db'
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
const prepareTitle = (article: OmnivoreArticle): string =>
  article.title
    .replace(article.site, '')
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\\\/]/gi, '')

const getEmbeddingForArticle = async (
  it: OmnivoreArticle,
): Promise<EmbeddedOmnivoreArticle> => {
  console.log(`${prepareTitle(it)}: ${it.description}`)
  const embedding = await client.getEmbeddings(
    `${prepareTitle(it)}: ${it.description}`,
  )

  return {
    embedding,
    article: it,
    topics: [],
  }
}

const addTopicsToArticle = async (
  it: EmbeddedOmnivoreArticle,
): Promise<EmbeddedOmnivoreArticle> => {
  const articleEmbedding = it.embedding

  const topics = await sqlClient.query(
    `SELECT name 
    FROM (SELECT name, (1 - (embed.embedding <=> $1) - 0.6) / 0.2 AS "similarity" FROM omnivore.discover_topics embed)  topics
    WHERE topics.similarity > 0.75`,
    [toSql(articleEmbedding)],
  )

  const topicNames = topics.rows.map(({ name }) => name as string)
  if (it.article.type == 'community') {
    topicNames.push('Community Picks')
  }

  return {
    ...it,
    topics: topicNames,
  }
}

const getEmbeddingForLabel = async (
  label: Label,
): Promise<EmbeddedOmnivoreLabel> => {
  const embedding = await client.getEmbeddings(
    `${label.name}${label.description ? ':' + label.description : ''}`,
  )
  return {
    embedding,
    label,
  }
}

export const rateLimitEmbedding = () =>
  pipe(share(), rateLimiter<any>({ resetLimit: 1000, timeMs: 60_000 }))

export const rateLimiting = rateLimitEmbedding()

export const addEmbeddingToLabel: OperatorFunction<
  Label,
  EmbeddedOmnivoreLabel
> = pipe(
  rateLimiting,
  mergeMap((it: Label) => fromPromise(getEmbeddingForLabel(it))),
)

export const addEmbeddingToArticle$: OperatorFunction<
  OmnivoreArticle,
  EmbeddedOmnivoreArticle
> = pipe(
  rateLimiting,
  mergeMap((it: OmnivoreArticle) => fromPromise(getEmbeddingForArticle(it))),
)

export const addTopicsToArticle$: OperatorFunction<
  EmbeddedOmnivoreArticle,
  EmbeddedOmnivoreArticle
> = pipe(
  mergeMap((it: EmbeddedOmnivoreArticle) =>
    fromPromise(addTopicsToArticle(it)),
  ),
)
