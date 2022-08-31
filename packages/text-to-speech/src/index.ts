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
import { createWriteStream } from 'fs'

dotenv.config()

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

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

export const textToSpeechHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.debug('New text to speech request', req)
    const token = req.query.token as string
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not exists')
      return res.status(500).send('JWT_SECRET not exists')
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      console.error(e)
      return res.status(200).send('UNAUTHENTICATED')
    }
    const input = req.body as TextToSpeechInput
    try {
      const audioFileName = `speech/${input.id}.mp3`
      const audioFile = createGCSFile(input.bucket, audioFileName)
      const writeStream = audioFile.createWriteStream({
        resumable: true,
      })
      const { speechMarks } = await synthesizeTextToSpeech({
        ...input,
        writeStream,
      })
      // upload Speech Marks file to GCS
      const speechMarksFileName = `speech/${input.id}.json`
      await uploadToBucket(
        speechMarksFileName,
        Buffer.from(JSON.stringify(speechMarks)),
        input.bucket
      )
      const updated = await updateSpeech(
        input.id,
        token,
        'COMPLETED',
        audioFileName,
        speechMarksFileName
      )

      if (!updated) {
        return res.status(500).send('Failed to update speech')
      }
    } catch (e) {
      console.error(e)
      await updateSpeech(input.id, token, 'FAILED')
      return res.status(500).send('Failed to synthesize')
    }

    res.send('OK')
  }
)

export const textToSpeechStreamingHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.debug('Text to speech steaming request', req)
    const token = req.query.token as string
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not exists')
      return res.status(500).send('JWT_SECRET not exists')
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      console.error(e)
      return res.status(200).send('UNAUTHENTICATED')
    }

    try {
      const audioFileName = `./tmp/speech-${Date.now()}.mp3`
      const writeStream = createWriteStream(audioFileName)
      const input: TextToSpeechInput = {
        id: req.query.id as string,
        text: 'text',
        bucket: req.query.bucket as string,
        textType: 'ssml',
        writeStream,
      }
      await synthesizeTextToSpeech(input)

      res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      })
      writeStream.pipe(res)
    } catch (e) {
      console.error(e)
      return res.status(500).send('Failed to synthesize')
    }
  }
)
