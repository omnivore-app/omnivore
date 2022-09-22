/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import {
  SpeechMark,
  synthesizeTextToSpeech,
  TextToSpeechInput,
} from './textToSpeech'
import { File, Storage } from '@google-cloud/storage'
import { endSsml, htmlToSpeechFile, startSsml } from './htmlToSsml'
import crypto from 'crypto'
import { createRedisClient } from './redis'

interface UtteranceInput {
  voice?: string
  rate?: string
  language?: string
  text: string
  idx: string
}

interface HTMLInput {
  id: string
  text: string
  voice?: string
  language?: string
  rate?: string
  complimentaryVoice?: string
  bucket: string
}

interface CacheResult {
  audioDataString: string
  speechMarks: SpeechMark[]
}

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const storage = new Storage()

const uploadToBucket = async (
  filePath: string,
  data: Buffer,
  bucket: string,
  options?: { contentType?: string; public?: boolean }
): Promise<void> => {
  await storage.bucket(bucket).file(filePath).save(data, options)
}

const createGCSFile = (bucket: string, filename: string): File => {
  return storage.bucket(bucket).file(filename)
}

const updateSpeech = async (
  speechId: string,
  token: string,
  state: 'COMPLETED' | 'FAILED',
  audioFileName?: string,
  speechMarksFileName?: string
): Promise<boolean> => {
  if (!process.env.REST_BACKEND_ENDPOINT) {
    throw new Error('backend rest api endpoint not exists')
  }
  const response = await axios.post(
    `${process.env.REST_BACKEND_ENDPOINT}/text-to-speech?token=${token}`,
    {
      speechId,
      audioFileName,
      speechMarksFileName,
      state,
    }
  )

  return response.status === 200
}

export const textToSpeechHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.info('Text to speech request body:', req.body)
    const token = req.query.token as string
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not exists')
      return res.status(500).send({ errorCodes: 'JWT_SECRET_NOT_EXISTS' })
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      console.error('Authentication error:', e)
      return res.status(200).send('UNAUTHENTICATED')
    }
    // validate input
    const input = req.body as HTMLInput
    const id = input.id
    const bucket = input.bucket
    if (!id || !bucket) {
      return res.status(200).send('INVALID_INPUT')
    }
    try {
      // audio file to be saved in GCS
      const audioFileName = `speech/${id}.mp3`
      const audioFile = createGCSFile(bucket, audioFileName)
      const audioStream = audioFile.createWriteStream({
        resumable: true,
      }) as NodeJS.WriteStream
      // synthesize text to speech
      const startTime = Date.now()
      const { speechMarks } = await synthesizeTextToSpeech({
        ...input,
        textType: 'html',
        audioStream,
      })
      console.info(
        `Synthesize text to speech completed in ${Date.now() - startTime} ms`
      )
      // speech marks file to be saved in GCS
      const speechMarksFileName = `speech/${id}.json`
      await uploadToBucket(
        speechMarksFileName,
        Buffer.from(JSON.stringify(speechMarks)),
        bucket
      )
      // update speech state
      const updated = await updateSpeech(
        id,
        token,
        'COMPLETED',
        audioFileName,
        speechMarksFileName
      )
      if (!updated) {
        console.error('Failed to update speech')
        return res.status(500).send({ errorCodes: 'DB_ERROR' })
      }
      console.info('Text to speech cloud function completed')
      res.send('OK')
    } catch (e) {
      console.error('Text to speech cloud function error:', e)
      await updateSpeech(id, token, 'FAILED')
      return res.status(500).send({ errorCodes: 'SYNTHESIZER_ERROR' })
    }
  }
)

export const textToSpeechStreamingHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.log('Text to speech steaming request body:', req.body)
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not exists')
      return res.status(500).send({ errorCodes: 'JWT_SECRET_NOT_EXISTS' })
    }
    const token = (req.query.token || req.headers.authorization) as string
    if (!token) {
      return res.status(401).send({ errorCode: 'INVALID_TOKEN' })
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      console.error('Authentication error:', e)
      return res.status(401).send({ errorCode: 'UNAUTHENTICATED' })
    }

    try {
      const utteranceInput = req.body as UtteranceInput
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
      const redisClient = await createRedisClient(
        process.env.REDIS_URL,
        process.env.REDIS_CERT
      )
      // find audio data in cache
      const cacheResult = await redisClient.get(cacheKey)
      if (cacheResult) {
        console.log('Cache hit')
        const { audioDataString, speechMarks }: CacheResult =
          JSON.parse(cacheResult)
        res.send({
          idx: utteranceInput.idx,
          audioData: audioDataString,
          speechMarks,
        })
        return
      }
      console.log('Cache miss')
      // synthesize text to speech if cache miss
      const input: TextToSpeechInput = {
        ...utteranceInput,
        textType: 'ssml',
        text: ssml,
      }
      const { audioData, speechMarks } = await synthesizeTextToSpeech(input)
      if (!audioData) {
        return res.status(500).send({ errorCode: 'SYNTHESIZER_ERROR' })
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
      console.log('Cache saved')

      res.send({
        idx: utteranceInput.idx,
        audioData: audioDataString,
        speechMarks,
      })
    } catch (e) {
      console.error('Text to speech streaming error:', e)
      return res.status(500).send({ errorCodes: 'SYNTHESIZER_ERROR' })
    }
  }
)

module.exports = {
  htmlToSpeechFile,
  textToSpeechStreamingHandler,
  textToSpeechHandler,
}
