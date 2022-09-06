/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { synthesizeTextToSpeech, TextToSpeechInput } from './textToSpeech'
import { File, Storage } from '@google-cloud/storage'
import { htmlToSsml } from './htmlToSsml'

interface SSMLInput {
  text: string
}

interface UtteranceInput {
  voice?: string
  rate?: number
  language?: string
  text: string
}

interface HTMLInput {
  id: string
  text: string
  voice?: string
  language?: string
  rate?: number
  complimentaryVoice?: string
  bucket: string
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
    console.info('Text to speech request received')
    const token = req.query.token as string
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not exists')
      return res.status(500).send({ errorCodes: 'JWT_SECRET_NOT_EXISTS' })
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      console.error(e)
      return res.status(200).send('UNAUTHENTICATED')
    }
    const input = req.body as HTMLInput
    const id = input.id
    const bucket = input.bucket
    if (!id || !bucket) {
      return res.status(200).send('Invalid data')
    }
    try {
      const audioFileName = `speech/${id}.mp3`
      const audioFile = createGCSFile(bucket, audioFileName)
      const audioStream = audioFile.createWriteStream({
        resumable: true,
      }) as NodeJS.WriteStream
      const speechMarksFileName = `speech/${id}.json`
      const speechMarksFile = createGCSFile(bucket, speechMarksFileName)
      const speechMarksStream = speechMarksFile.createWriteStream({
        resumable: true,
      }) as NodeJS.WriteStream
      const startTime = Date.now()
      await synthesizeTextToSpeech({
        ...input,
        textType: 'html',
        audioStream,
        speechMarksStream,
      })
      console.info(
        `Synthesize text to speech completed in ${Date.now() - startTime} ms`
      )
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
      console.error('Text to speech cloud function error', e)
      await updateSpeech(id, token, 'FAILED')
      return res.status(500).send({ errorCodes: 'SYNTHESIZER_ERROR' })
    }
  }
)

export const textToSpeechStreamingHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.debug('Text to speech steaming request', req)
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not exists')
      return res.status(500).send({ errorCodes: 'JWT_SECRET_NOT_EXISTS' })
    }
    const token = (req.query.token || req.headers.authorization) as string
    if (!token) {
      return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      console.error(e)
      return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const utteranceInput = req.body as UtteranceInput
      if (!utteranceInput.text) {
        return res.status(400).send({ errorCode: 'INVALID_DATA' })
      }
      const input: TextToSpeechInput = {
        ...utteranceInput,
        textType: 'utterance',
      }
      const { audioStream, speechMarks } = await synthesizeTextToSpeech(input)
      // const readStream = new Readable()
      // readStream.push(JSON.stringify({ audioData, speechMarks }))
      //
      // res.set({
      //   'Content-Type': 'application/json',
      //   'Transfer-Encoding': 'chunked',
      // })
      // console.info('Text to speech starts streaming')
      // pipeline(readStream, res, (err) => {
      //   if (err) {
      //     console.error('Text to speech streaming error', err)
      //     res.status(500).send({ errorCode: 'STREAMING_ERROR' })
      //   }
      // })
      res.send({ audioData: audioStream.read(), speechMarks })
    } catch (e) {
      console.error('Text to speech streaming error', e)
      return res.status(500).send({ errorCodes: 'SYNTHESIZER_ERROR' })
    }
  }
)

module.exports = {
  htmlToSsml,
  textToSpeechStreamingHandler,
  textToSpeechHandler,
}
