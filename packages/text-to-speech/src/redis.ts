import { createClient } from 'redis'
import { CacheResult } from './index'
import { SpeechMark } from './textToSpeech'

export const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: process.env.REDIS_URL?.startsWith('rediss://'), // rediss:// is the protocol for TLS
    cert: process.env.REDIS_CERT?.replace(/\\n/g, '\n'), // replace \n with new line
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
redisClient
  .connect()
  .then(() => console.log('Redis Client Connected'))
  .catch((err) => console.error('Redis Client Connection Error', err))

export const getCharacterCountFromRedis = async (
  uid: string
): Promise<number> => {
  const wordCount = await redisClient.get(`tts:charCount:${uid}`)
  return wordCount ? parseInt(wordCount) : 0
}

// store character count of each text to speech request in redis
// which will be used to rate limit the request
// expires after 1 day
export const updateCharacterCountInRedis = async (
  uid: string,
  wordCount: number
): Promise<void> => {
  await redisClient.set(`tts:charCount:${uid}`, wordCount.toString(), {
    EX: 3600 * 24, // in seconds
    NX: true,
  })
}

export const getCachedAudio = async (
  cacheKey: string
): Promise<CacheResult | null> => {
  const result = await redisClient.get(cacheKey)
  return result ? (JSON.parse(result) as CacheResult) : null
}

export const saveAudioToRedis = async (
  cacheKey: string,
  audioData: Buffer,
  speechMarks: SpeechMark[]
): Promise<CacheResult> => {
  const audioDataString = audioData.toString('hex')
  await redisClient.set(
    cacheKey,
    JSON.stringify({ audioDataString, speechMarks }),
    {
      EX: 3600 * 24, // in seconds
      NX: true,
    }
  )
  return { audioDataString, speechMarks }
}
