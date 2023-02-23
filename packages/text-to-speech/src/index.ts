/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { AzureTextToSpeech } from './azureTextToSpeech'
import { File, Storage } from '@google-cloud/storage'
import { endSsml, htmlToSpeechFile, startSsml } from './htmlToSsml'
import crypto from 'crypto'
import {
  getCachedAudio,
  getCharacterCountFromRedis,
  redisClient,
  saveAudioToRedis,
  updateCharacterCountInRedis,
} from './redis'
import {
  SpeechMark,
  TextToSpeechInput,
  TextToSpeechOutput,
} from './textToSpeech'
import { RealisticTextToSpeech } from './realisticTextToSpeech'

export interface UtteranceInput {
  text: string
  idx: string
  isUltraRealisticVoice?: boolean
  voice?: string
  rate?: string
  language?: string
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

export interface CacheResult {
  audioDataString: string
  speechMarks: SpeechMark[]
}

export interface Claim {
  uid: string
  featureName: string | null
  grantedAt: number | null
}

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const MAX_CHARACTER_COUNT = 50000
const storage = new Storage()

const textToSpeechHandlers = [
  new AzureTextToSpeech(),
  new RealisticTextToSpeech(),
]

export const synthesizeTextToSpeech = async (
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> => {
  const textToSpeechHandler = textToSpeechHandlers.find((handler) =>
    handler.use(input)
  )
  if (!textToSpeechHandler) {
    throw new Error('No text to speech handler found')
  }
  return textToSpeechHandler.synthesizeTextToSpeech(input)
}

const uploadToBucket = async (
  filePath: string,
  data: Buffer,
  bucket: string,
  options?: { contentType?: string; public?: boolean }
): Promise<void> => {
  await storage.bucket(bucket).file(filePath).save(data, options)
}

export const createGCSFile = (bucket: string, filename: string): File => {
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

export const optedInAndGranted = (claim: Claim): boolean => {
  // validate if user has opted in to use ultra realistic voice feature and has been granted
  return claim.featureName === 'ultra-realistic-voice' && !!claim.grantedAt
}

export const validCharacterCount = async (
  text: string,
  uid: string
): Promise<boolean> => {
  const characterCount = await getCharacterCountFromRedis(uid)
  const newCharacterCount = characterCount + text.length
  if (newCharacterCount > MAX_CHARACTER_COUNT) {
    return false
  }
  await updateCharacterCountInRedis(uid, newCharacterCount)
  return true
}

export const assembledSsml = (utteranceInput: UtteranceInput): string => {
  const ssmlOptions = {
    primaryVoice: utteranceInput.voice,
    secondaryVoice: utteranceInput.voice,
    language: utteranceInput.language,
    rate: utteranceInput.rate,
  }
  return `${startSsml(ssmlOptions)}${utteranceInput.text}${endSsml()}`
}

export const hash = (text: string): string => {
  return crypto.createHash('md5').update(text).digest('hex')
}

export const textToSpeechHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.info('Text to speech request body:', req.body)
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
      // temporary solution to use realistic text to speech
      const { speechMarks } = await synthesizeTextToSpeech({
        ...input,
        textType: 'html',
        audioStream,
        key: id,
      })
      console.info(
        `Synthesize text to speech completed in ${Date.now() - startTime} ms`
      )

      // speech marks file to be saved in GCS
      let speechMarksFileName: string | undefined
      if (speechMarks.length > 0) {
        speechMarksFileName = `speech/${id}.json`
        await uploadToBucket(
          speechMarksFileName,
          Buffer.from(JSON.stringify(speechMarks)),
          bucket
        )
      }

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

    let claim: Claim
    try {
      claim = jwt.verify(token, process.env.JWT_SECRET) as Claim
    } catch (e) {
      console.error('Authentication error:', e)
      return res.status(401).send({ errorCode: 'UNAUTHENTICATED' })
    }

    try {
      const utteranceInput = req.body as UtteranceInput
      if (!utteranceInput.text) {
        return res.send({
          idx: utteranceInput.idx,
          audioData: '',
          speechMarks: [],
        })
      }
      // validate if user can use ultra realistic voice feature
      if (utteranceInput.isUltraRealisticVoice && !optedInAndGranted(claim)) {
        return res.status(403).send('UNAUTHORIZED')
      }
      // validate character count
      if (!(await validCharacterCount(utteranceInput.text, claim.uid))) {
        return res.status(429).send('RATE_LIMITED')
      }
      // for utterance, assemble the ssml and pass it through
      const ssml = assembledSsml(utteranceInput)
      // hash ssml to get the cache key
      const cacheKey = hash(ssml)
      // find audio data in cache
      const cachedResult = await getCachedAudio(cacheKey)
      if (cachedResult) {
        res.send({
          idx: utteranceInput.idx,
          audioData: cachedResult.audioDataString,
          speechMarks: cachedResult.speechMarks,
        })
        return
      }

      const bucket = process.env.GCS_UPLOAD_BUCKET
      if (!bucket) {
        throw new Error('GCS_UPLOAD_BUCKET not set')
      }

      // audio file to be saved in GCS
      const audioFileName = `speech/${cacheKey}.mp3`
      const speechMarksFileName = `speech/${cacheKey}.json`
      const audioFile = createGCSFile(bucket, audioFileName)
      const speechMarksFile = createGCSFile(bucket, speechMarksFileName)

      let audioData: Buffer | undefined
      let speechMarks: SpeechMark[] = []
      // check if audio file already exists
      const [exists] = await audioFile.exists()
      if (exists) {
        console.debug('Audio file already exists')
        ;[audioData] = await audioFile.download()
        const [speechMarksExists] = await speechMarksFile.exists()
        if (speechMarksExists) {
          speechMarks = JSON.parse(
            (await speechMarksFile.download()).toString()
          )
        }
      } else {
        // audio file does not exist, synthesize text to speech
        const input: TextToSpeechInput = {
          ...utteranceInput,
          textType: 'ssml',
          key: cacheKey,
        }
        // synthesize text to speech if cache miss
        const output = await synthesizeTextToSpeech(input)
        audioData = output.audioData
        speechMarks = output.speechMarks
        if (!audioData || audioData.length === 0) {
          return res.send({
            idx: utteranceInput.idx,
            audioData: '',
            speechMarks: [],
          })
        }

        console.debug('saving audio file')
        // upload audio data to GCS
        await audioFile.save(audioData)
        // upload speech marks to GCS
        if (speechMarks.length > 0) {
          await speechMarksFile.save(JSON.stringify(speechMarks))
        }
      }
      // save audio data to cache for 24 hours for mainly the newsletters
      const result = await saveAudioToRedis(cacheKey, audioData, speechMarks)

      res.send({
        idx: utteranceInput.idx,
        audioData: result.audioDataString,
        speechMarks,
      })
    } catch (e) {
      console.error('Text to speech streaming error:', e)
      return res.status(500).send({ errorCodes: 'SYNTHESIZER_ERROR' })
    } finally {
      await redisClient.quit()
      console.log('Redis Client Disconnected')
    }
  }
)

module.exports = {
  htmlToSpeechFile,
  textToSpeechStreamingHandler,
  textToSpeechHandler,
  synthesizeTextToSpeech,
}
