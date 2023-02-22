import express from 'express'
import { Server } from 'http'
import { Server as SocketServer } from 'socket.io'
import { CacheResult, synthesizeTextToSpeech, UtteranceInput } from './index'
import { endSsml, startSsml } from './htmlToSsml'
import crypto from 'crypto'
import { TextToSpeechInput } from './textToSpeech'
import { createRedisClient } from './redis'
import * as jwt from 'jsonwebtoken'

const SYNTHESIZE_EVENT = 'synthesize'
const SYNTHESIZE_RESULT_EVENT = 'synthesizedResult'

const app = express()
const server = new Server(app)
const io = new SocketServer(server, {
  serveClient: false,
})
const redisClient = createRedisClient(
  process.env.REDIS_URL,
  process.env.REDIS_CERT
)
redisClient
  .connect()
  .then(() => console.log('Redis Client Connected'))
  .catch((err) => console.error('Redis Client Connection Error', err))

// middleware to check if the request is valid
io.use((socket, next) => {
  if (!process.env.JWT_SECRET) {
    return next(new Error('No JWT secret provided'))
  }
  const token = socket.handshake.auth.token as string
  try {
    jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    console.error('JWT verification error', err)
    return next(new Error('Unauthorized'))
  }
})
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
server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})

// Clean up resources on shutdown
process.on('SIGTERM', () => {
  console.log('received SIGTERM')
  server.close(() => {
    console.log('HTTP server closed')
    redisClient
      .quit()
      .then(() => {
        console.log('Redis Client Disconnected')
      })
      .catch((err) => console.error('Redis Client Disconnection Error', err))
      .finally(() => process.exit(0))
  })
})
