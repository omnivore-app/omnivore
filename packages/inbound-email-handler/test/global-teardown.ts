import { redisDataSource } from '../src/redis_data_source'

export const mochaGlobalTeardown = async () => {
  await redisDataSource.shutdown()
}
