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
import { PassThrough } from 'stream'
import { htmlToSsml } from './htmlToSsml'

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
    const input = req.body as TextToSpeechInput
    const id = input.id
    const bucket = input.bucket
    if (!id || !bucket) {
      return res.status(200).send('Invalid data')
    }
    try {
      const audioFileName = `speech/${id}.mp3`
      const audioFile = createGCSFile(bucket, audioFileName)
      const writeStream = audioFile.createWriteStream({
        resumable: true,
      }) as NodeJS.WriteStream
      const startTime = Date.now()
      const { speechMarks } = await synthesizeTextToSpeech({
        ...input,
        textType: 'html',
        audioStream: writeStream,
      })
      console.info(
        `Synthesize text to speech completed in ${Date.now() - startTime} ms`
      )
      // upload Speech Marks file to GCS
      const speechMarksFileName = `speech/${id}.json`
      await uploadToBucket(
        speechMarksFileName,
        Buffer.from(JSON.stringify(speechMarks)),
        bucket
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
      return res.status(200).send({ errorCode: 'UNAUTHORIZED' })
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      console.error(e)
      return res.status(200).send({ errorCode: 'UNAUTHORIZED' })
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const ssmlItems = req.body.ssmlItems as string[]
      if (!ssmlItems || ssmlItems.length === 0) {
        return res.status(200).send({ errorCode: 'INVALID_DATA' })
      }
      const audioStream = new PassThrough()
      const input: TextToSpeechInput = {
        text: '',
        textType: 'ssml',
        audioStream,
        ssmlItems,
      }
      res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      })

      console.info('Text to speech starts streaming')
      audioStream.pipe(res)

      await synthesizeTextToSpeech(input)
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
