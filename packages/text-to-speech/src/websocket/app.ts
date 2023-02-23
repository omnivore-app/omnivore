import express from 'express'
import { Server } from 'http'
import { Server as SocketServer } from 'socket.io'
import {
  assembledSsml,
  Claim,
  hash,
  optedInAndGranted,
  synthesizeTextToSpeech,
  UtteranceInput,
  validCharacterCount,
} from '../index'
import { TextToSpeechInput } from '../textToSpeech'
import * as jwt from 'jsonwebtoken'
import { getCachedAudio, saveAudioToRedis } from '../redis'

const SYNTHESIZE_EVENT = 'synthesize'
const SYNTHESIZE_RESULT_EVENT = 'synthesizedResult'

const app = express()
export const server = new Server(app)
const io = new SocketServer(server, {
  serveClient: false,
})
let claim: Claim

// middleware to check if the request is valid
io.use((socket, next) => {
  if (!process.env.JWT_SECRET) {
    return next(new Error('No JWT secret provided'))
  }
  const token = socket.handshake.headers['authorization'] as string
  try {
    claim = jwt.verify(token, process.env.JWT_SECRET) as Claim
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
      return socket.emit(SYNTHESIZE_RESULT_EVENT, {
        idx: utteranceInput.idx,
        audioData: '',
        speechMarks: [],
      })
    }
    // validate if user can use ultra realistic voice feature
    if (utteranceInput.isUltraRealisticVoice && !optedInAndGranted(claim)) {
      return socket.emit(SYNTHESIZE_RESULT_EVENT, {
        error: 'NOT_OPTED_IN',
      })
    }
    // validate character count
    if (!(await validCharacterCount(utteranceInput.text, claim.uid))) {
      return socket.emit(SYNTHESIZE_RESULT_EVENT, {
        error: 'CHARACTER_COUNT_EXCEEDED',
      })
    }
    // for utterance, assemble the ssml and pass it through
    const ssml = assembledSsml(utteranceInput)
    // hash ssml to get the cache key
    const cacheKey = hash(ssml)
    // find audio data in cache
    const cachedResult = await getCachedAudio(cacheKey)
    if (cachedResult) {
      return socket.emit(SYNTHESIZE_RESULT_EVENT, {
        idx: utteranceInput.idx,
        audioData: cachedResult.audioDataString,
        speechMarks: cachedResult.speechMarks,
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
    // save audio data to cache for 24 hours for mainly the newsletters
    const result = await saveAudioToRedis(cacheKey, audioData, speechMarks)

    socket.emit(SYNTHESIZE_RESULT_EVENT, {
      idx: utteranceInput.idx,
      audioData: result.audioDataString,
      speechMarks,
    })
  })
})
