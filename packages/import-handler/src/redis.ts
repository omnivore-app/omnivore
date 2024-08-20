import { Result } from 'ioredis'

// Add declarations
declare module 'ioredis' {
  interface RedisCommander<Context> {
    updatemetrics(
      key: string,
      arg1: string,
      arg2: string
    ): Result<number, Context>
  }
}
