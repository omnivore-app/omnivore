import { Storage } from '@google-cloud/storage'
import sinon from 'sinon'
import { env } from '../src/env'
import { redisDataSource } from '../src/redis_data_source'
import { createTestConnection } from './db'
import { MockBucket } from './mock_storage'
import { startApolloServer, startWorker } from './util'

export const mochaGlobalSetup = async () => {
  await createTestConnection()
  console.log('db connection created')

  if (env.redis.cache.url) {
    await redisDataSource.initialize()
    console.log('redis connection created')

    if (redisDataSource.workerRedisClient) {
      startWorker(redisDataSource.workerRedisClient)
      console.log('worker started')
    }
  }

  await startApolloServer()
  console.log('apollo server started')

  // mock cloud storage
  const mockBucket = new MockBucket('test')
  sinon.replace(
    Storage.prototype,
    'bucket',
    sinon.fake.returns(mockBucket as never)
  )
  console.log('mock cloud storage created')
}
