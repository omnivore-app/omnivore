import supertest from 'supertest'
import { DeepPartial } from 'typeorm'
import { v4 } from 'uuid'
import { Label } from '../src/entity/label'
import { LibraryItem } from '../src/entity/library_item'
import { createApp } from '../src/server'
import { createLibraryItem } from '../src/services/library_item'
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

export const createTestLibraryItem = async (
  userId: string,
  labels?: Label[]
): Promise<LibraryItem> => {
  const item: DeepPartial<LibraryItem> = {
    user: { id: userId },
    title: 'test title',
    originalContent: '<p>test content</p>',
    originalUrl: 'https://blog.omnivore.app/test-url',
    slug: 'test-with-omnivore',
    labels,
  }

  return createLibraryItem(item, userId)
}
