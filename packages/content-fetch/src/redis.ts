/* eslint-disable @typescript-eslint/no-misused-promises */
import { Redis } from 'ioredis'

const url = process.env.REDIS_URL
const cert = process.env.REDIS_CERT

export const redis = new Redis(url || 'redis://localhost:6379', {
  connectTimeout: 10000, // 10 seconds
  tls: cert
    ? {
        cert,
        rejectUnauthorized: false, // for self-signed certs
      }
    : undefined,
  maxRetriesPerRequest: null,
  offlineQueue: false,
})

redis.on('connect', () => {
  console.log('Redis connected')
})

redis.on('error', (err) => {
  console.error('Redis error', err)
})

redis.on('close', () => {
  console.log('Redis closed')
})
