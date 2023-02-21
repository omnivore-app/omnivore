import express from 'express'
import { Server } from 'http'
import { Server as SocketServer } from 'socket.io'
import {
  CacheResult,
  RedisClient,
  synthesizeTextToSpeech,
  UtteranceInput,
} from './index'
import { endSsml, startSsml } from './htmlToSsml'
import crypto from 'crypto'
import { TextToSpeechInput } from './textToSpeech'
import { createRedisClient } from './redis'

const SYNTHESIZE_EVENT = 'synthesize'
const SYNTHESIZE_RESULT_EVENT = 'synthesizedResult'

const app = express()
const server = new Server(app)
const io = new SocketServer(server)
let redisClient: RedisClient
// Listen for new connection
io.on('connection', (socket) => {
  console.log('New client connected')
  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
  socket.on(SYNTHESIZE_EVENT, async (utteranceInput: UtteranceInput) => {
    console.log('utterance input received: ', utteranceInput)
    if (!utteranceInput.text || utteranceInput.text === '') {
      return socket.emit('message', {
        idx: utteranceInput.idx,
        audioData: '',
        speechMarks: [],
      })
    }
    const ssmlOptions = {
      primaryVoice: utteranceInput.voice,
      secondaryVoice: utteranceInput.voice,
      language: utteranceInput.language,
      rate: utteranceInput.rate,
    }
    // for utterance, assemble the ssml and pass it through
    const ssml = `${startSsml(ssmlOptions)}${utteranceInput.text}${endSsml()}`
    // hash ssml to get the cache key
    const cacheKey = crypto.createHash('md5').update(ssml).digest('hex')
    // find audio data in cache
    const cacheResult = await redisClient.get(cacheKey)
    if (cacheResult) {
      console.debug('Cache hit')
      const { audioDataString, speechMarks } = JSON.parse(
        cacheResult
      ) as CacheResult
      return socket.emit(SYNTHESIZE_RESULT_EVENT, {
        idx: utteranceInput.idx,
        audioData: audioDataString,
        speechMarks,
      })
    }

    // audio file does not exist, synthesize text to speech
    const input: TextToSpeechInput = {
      ...utteranceInput,
      textType: 'ssml',
      key: cacheKey,
    }
    // synthesize text to speech if cache miss
    const output = await synthesizeTextToSpeech(input)
    const audioData = output.audioData
    const speechMarks = output.speechMarks
    if (!audioData || audioData.length === 0) {
      return socket.emit(SYNTHESIZE_RESULT_EVENT, {
        idx: utteranceInput.idx,
        audioData: '',
        speechMarks: [],
      })
    }

    const audioDataString = audioData.toString('hex')
    // save audio data to cache for 24 hours for mainly the newsletters
    await redisClient.set(
      cacheKey,
      JSON.stringify({ audioDataString, speechMarks }),
      {
        EX: 3600 * 24, // in seconds
        NX: true,
      }
    )
    socket.emit(SYNTHESIZE_RESULT_EVENT, {
      idx: utteranceInput.idx,
      audioData: audioDataString,
      speechMarks,
    })
  })
})

const PORT = parseInt(process.env.PORT || '') || 8080
// eslint-disable-next-line @typescript-eslint/no-misused-promises
server.listen(PORT, async () => {
  redisClient = await createRedisClient(
    process.env.REDIS_URL,
    process.env.REDIS_CERT
  )
  console.log(`App listening on port ${PORT}`)
  console.log('Press Ctrl+C to quit.')
})

// Clean up resources on shutdown
// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on('SIGTERM', async () => {
  console.log('received SIGTERM')
  await redisClient.quit()
  process.exit(0)
})
