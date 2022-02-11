import { createApp } from '../src/server'
import supertest from 'supertest'
import { v4 } from 'uuid'

const { app, apollo } = createApp()
export const request = supertest(app)

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
