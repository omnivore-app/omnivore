import { readFileSync } from 'fs'
import path from 'path'
import { createClient } from 'redis'

// load lua script
export const lua = {
  script: readFileSync(
    path.resolve(__dirname, 'luaScripts/updateMetrics.lua'),
    'utf8'
  ),
  sha: '',
}

export const createRedisClient = async (url?: string, cert?: string) => {
  const redisClient = createClient({
    url,
    socket: {
      tls: url?.startsWith('rediss://'), // rediss:// is the protocol for TLS
      cert: cert?.replace(/\\n/g, '\n'), // replace \n with new line
      rejectUnauthorized: false, // for self-signed certs
      connectTimeout: 10000, // 10 seconds
      reconnectStrategy(retries: number): number | Error {
        if (retries > 10) {
          return new Error('Retries exhausted')
        }
        return 1000
      },
    },
  })

  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()
  console.log('Redis Client Connected:', url)

  // load script to redis
  lua.sha = await redisClient.scriptLoad(lua.script)
  console.log('Redis Lua Script Loaded', lua.sha)

  return redisClient
}
