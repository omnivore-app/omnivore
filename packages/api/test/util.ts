import { ConnectionOptions, Job, QueueEvents, Worker } from 'bullmq'
import { createServer } from 'http'
import { nanoid } from 'nanoid'
import supertest from 'supertest'
import { v4 } from 'uuid'
import { makeApolloServer } from '../src/apollo'
import { createWorker, QUEUE_NAME } from '../src/queue-processor'
import { createApp } from '../src/server'
import { corsConfig } from '../src/utils/corsConfig'

const app = createApp()
const httpServer = createServer(app)
const apollo = makeApolloServer(app, httpServer)
export const request = supertest(app)
let worker: Worker
let queueEvents: QueueEvents

export const startApolloServer = async () => {
  await apollo.start()
  apollo.applyMiddleware({ app, path: '/api/graphql', cors: corsConfig })
}

export const stopApolloServer = async () => {
  await apollo.stop()
}

export const startWorker = (connection: ConnectionOptions) => {
  worker = createWorker(connection)
  queueEvents = new QueueEvents(QUEUE_NAME, {
    connection,
  })
}

export const stopWorker = async () => {
  await queueEvents.close()
  await worker.close()
}

export const waitUntilJobsDone = async (jobs: Job[]) => {
  await Promise.all(jobs.map((job) => job.waitUntilFinished(queueEvents)))
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

export const loginAndGetAuthToken = async (email: string) => {
  const res = await request
    .post('/local/debug/fake-user-login')
    .send({ fakeEmail: email })

  return res.body.authToken as string
}
