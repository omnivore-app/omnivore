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
  reconnectOnError: (err) => {
    const targetErrors = [/READONLY/, /ETIMEDOUT/]

    targetErrors.forEach((targetError) => {
      if (targetError.test(err.message)) {
        // Only reconnect when the error contains the keyword
        return true
      }
    })

    return false
  },
  retryStrategy: (times) => {
    if (times > 10) {
      // End reconnecting after a specific number of tries and flush all commands with a individual error
      return null
    }

    // reconnect after
    return Math.min(times * 50, 2000)
  },
})

// graceful shutdown
process.on('SIGINT', () => {
  ;(async () => {
    console.log('SIGINT signal received: closing HTTP server')
    await redis.quit()
    console.log('redis connection closed')
    process.exit()
  })()
})
