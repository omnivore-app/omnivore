import { ConnectionOptions, Worker } from 'bullmq'
import { nanoid } from 'nanoid'
import supertest from 'supertest'
import { v4 } from 'uuid'
import { createWorker } from '../src/queue-processor'
import { createApp } from '../src/server'
import { corsConfig } from '../src/utils/corsConfig'

const { app, apollo } = createApp()
export const request = supertest(app)
let worker: Worker | undefined

export const startApolloServer = async () => {
  await apollo.start()
  apollo.applyMiddleware({ app, path: '/api/graphql', cors: corsConfig })
}

export const stopApolloServer = async () => {
  await apollo.stop()
}

export const startWorker = async (connection: ConnectionOptions) => {
  worker = createWorker(connection)
}

export const stopWorker = async () => {
  worker?.close()
}

export const waitUntilJobsDone = async () => {
  await worker?.waitUntilReady()
}

export const graphqlRequest = (
  query: string,
  authToken: string,
  variables?: Record<string, unknown>
): supertest.Test => {
  return request
    .post(apollo.graphqlPath)
    .send({ query, variables })
    .set('Accept', 'application/json')
    .set('authorization', authToken)
    .expect('Content-Type', /json/)
}

export const generateFakeUuid = () => {
  return v4()
}

export const generateFakeShortId = () => {
  return nanoid(8)
}
