/* eslint-disable @typescript-eslint/no-unsafe-call */

import { EmbeddedOmnivoreTopic } from '../ai/embedding'
import { filter, map, mergeMap } from 'rxjs/operators'
import { toSql } from 'pgvector/pg'
import { OperatorFunction } from 'rxjs'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import { sqlClient } from './db'
import { Label } from '../../types/OmnivoreSchema'
import { client } from '../clients/ai/client'

const hasLabelsStoredInDatabase = async (label: Label) => {
  const { rows } = await sqlClient.query(
    `SELECT discover_topic_name, embedding_description FROM omnivore.discover_topic_embedding_link where discover_topic_name = $1 and embedding_description=$2`,
    [label.name, label.description]
  )
  return rows && rows.length === 0
}

export const removeDuplicateLabels = mergeMap((x: Label) =>
  fromPromise(hasLabelsStoredInDatabase(x)).pipe(
    filter(Boolean),
    map(() => x)
  )
)

export const insertLabels = async (
  label: EmbeddedOmnivoreTopic
): Promise<EmbeddedOmnivoreTopic> => {
  if (label.topic.name && label.topic.description) {
    await sqlClient.query(
      client.insertQuery,
      [label.topic.name, label.topic.subject, label.topic.description, toSql(label.embedding)]
    )
  }
  return label
}

export const returnTopicName = async (): Promise<string[]> => {
  const rows = await sqlClient.query('SELECT discover_topic_name FROM omnivore.discover_topic_embedding_link')
  return rows.rows.map((row) => row.discover_topic_name)
}

export const insertTopicToStore: OperatorFunction<
  EmbeddedOmnivoreTopic,
  EmbeddedOmnivoreTopic
> = mergeMap((x) => fromPromise(insertLabels(x)))
