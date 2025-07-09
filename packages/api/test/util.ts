import { ConnectionOptions, Job, QueueEvents, Worker } from 'bullmq'
import { createServer, Server } from 'http'
// import { nanoid } from 'nanoid'
import supertest, { SuperTest, Test } from 'supertest'
import { v4 } from 'uuid'
import { makeApolloServer } from '../src/apollo'
import { BACKEND_QUEUE_NAME, createWorker } from '../src/queue-processor'
import { createApp } from '../src/server'
import { corsConfig } from '../src/utils/corsConfig'

import express from 'express'
import { ApolloServer } from 'apollo-server-express'

let app: express.Application
let httpServer: Server
let apollo: ApolloServer
export let request: ReturnType<typeof supertest>

let worker: Worker
let queueEvents: QueueEvents

export const startApolloServer = async () => {
  const expressApp = await createApp()
  app = expressApp
  httpServer = createServer(app)
  apollo = await makeApolloServer(app as any, httpServer)
  request = supertest(app)

  await apollo.start()
  void apollo.applyMiddleware({ app, path: '/api/graphql', cors: corsConfig })
}

export const stopApolloServer = async () => {
  await apollo.stop()
}

export const startWorker = (connection: ConnectionOptions) => {
  worker = createWorker(connection)
  queueEvents = new QueueEvents(BACKEND_QUEUE_NAME, {
    connection,
  })
}

export const stopWorker = async () => {
  await queueEvents.close()
  await worker.close()
}

export const waitUntilJobsDone = async (jobs: Job[]) => {
  await Promise.all(
    jobs.map((job) => job.waitUntilFinished(queueEvents, 10000))
  )
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
  return crypto.randomUUID().slice(0, 8)
}

export const loginAndGetAuthToken = async (email: string) => {
  const res = await request
    .post('/local/debug/fake-user-login')
    .send({ fakeEmail: email })

  return res.body.authToken as string
}
