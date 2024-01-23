import { Redis } from 'ioredis'

export const createRedisClient = (url?: string, cert?: string) => {
  return new Redis(url || 'redis://localhost:6379', {
    connectTimeout: 10000, // 10 seconds
    tls: cert
      ? {
          cert: cert.replace(/\\n/g, '\n'), // replace \n with new line
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
}
