import { createApp } from '../src/server'
import supertest from 'supertest'
import { v4 } from 'uuid'
import { corsConfig } from '../src/utils/corsConfig'
import { Page } from '../src/elastic/types'
import { PageType } from '../src/generated/graphql'
import { createPage } from '../src/elastic'
import { User } from '../src/entity/user'
import { Label } from '../src/entity/label'
import { createPubSubClient } from '../src/datalayer/pubsub'

const { app, apollo } = createApp()
export const request = supertest(app)

before(async () => {
  await apollo.start()
  apollo.applyMiddleware({ app, path: '/api/graphql', cors: corsConfig })
})

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
  user: User,
  labels?: Label[]
): Promise<Page> => {
  const page: Page = {
    id: '',
    hash: 'test hash',
    userId: user.id,
    pageType: PageType.Article,
    title: 'test title',
    content: '<p>test content</p>',
    createdAt: new Date(),
    url: 'https://example.com/test-url',
    slug: 'test-with-omnivore',
    labels: labels,
  }

  const pageId = await createPage(page, {
    pubsub: createPubSubClient(),
    refresh: true,
  })
  if (pageId) {
    page.id = pageId
  }
  return page
}
