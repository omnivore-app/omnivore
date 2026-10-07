/* eslint-disable @typescript-eslint/no-unsafe-call */

import { EmbeddedOmnivoreLabel } from '../ai/embedding'
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
  label: EmbeddedOmnivoreLabel
): Promise<EmbeddedOmnivoreLabel> => {
  if (label.label.name && label.label.description) {
    await sqlClient.query(
      client.insertQuery,
      [label.label.name, label.label.description, toSql(label.embedding)]
    )
  }
  return label
}

export const returnLabelNames = async (): Promise<string[]> => {
  const rows = await sqlClient.query('SELECT discover_topic_name FROM omnivore.discover_topic_embedding_link')
  return rows.rows.map((row) => row.discover_topic_name)
}

// export const insertLabelsToFile = async (
//   label: EmbeddedOmnivoreLabel,
// ): Promise<EmbeddedOmnivoreLabel> => {
//   fs.appendFileSync('./output.json', JSON.stringify(label))
//   return label
// }

export const insertLabelToStore: OperatorFunction<
  EmbeddedOmnivoreLabel,
  EmbeddedOmnivoreLabel
> = mergeMap((x) => fromPromise(insertLabels(x)))
