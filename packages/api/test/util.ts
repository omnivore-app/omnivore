import supertest from 'supertest'
import { v4 } from 'uuid'
import { createPage } from '../src/elastic/pages'
import { ArticleSavingRequestStatus, Label, Page } from '../src/elastic/types'
import { PageType } from '../src/generated/graphql'
import { createPubSubClient } from '../src/pubsub'
import { createApp } from '../src/server'
import { corsConfig } from '../src/utils/corsConfig'

const { app, apollo } = createApp()
export const request = supertest(app)

export const startApolloServer = async () => {
  await apollo.start()
  apollo.applyMiddleware({ app, path: '/api/graphql', cors: corsConfig })
}

export const stopApolloServer = async () => {
  await apollo.stop()
}

export const graphqlRequest = (
  query: string,
  authToken?: string
): supertest.Test => {
  return request
    .post(apollo.graphqlPath)
    .send({
      query,
    })
    .set('Accept', 'application/json')
    .set('authorization', authToken || '')
    .expect('Content-Type', /json/)
}

export const generateFakeUuid = () => {
  return v4()
}

export const createTestElasticPage = async (
  userId: string,
  labels?: Label[]
): Promise<Page> => {
  const page: Page = {
    id: '',
    hash: 'test hash',
    userId,
    pageType: PageType.Article,
    title: 'test title',
    content: '<p>test content</p>',
    createdAt: new Date(),
    savedAt: new Date(),
    url: 'https://blog.omnivore.app/test-url',
    slug: 'test-with-omnivore',
    labels: labels,
    readingProgressPercent: 0,
    readingProgressAnchorIndex: 0,
    state: ArticleSavingRequestStatus.Succeeded,
  }

  page.id = (await createPage(page, {
    pubsub: createPubSubClient(),
    refresh: true,
    uid: userId,
  }))!
  return page
}
