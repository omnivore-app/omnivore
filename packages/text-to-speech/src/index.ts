/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Sentry from '@sentry/serverless'
import { parseHTML } from 'linkedom'
import { File, Storage } from '@google-cloud/storage'
import {
  CancellationDetails,
  CancellationReason,
  ResultReason,
  SpeechConfig,
  SpeechSynthesisOutputFormat,
  SpeechSynthesisResult,
  SpeechSynthesizer,
} from 'microsoft-cognitiveservices-speech-sdk'
import axios from 'axios'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

interface TextToSpeechInput {
  id: string
  text: string
  voice?: string
  languageCode?: string
  textType?: 'text' | 'ssml'
  rate?: number
  volume?: number
  complimentaryVoice?: string
  bucket: string
}

interface TextToSpeechOutput {
  audioFileName: string
  speechMarksFileName: string
}

interface SpeechMark {
  time: number
  start?: number
  length?: number
  word: string
  type: 'word' | 'bookmark'
}

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
    `${process.env.REST_BACKEND_ENDPOINT}/svc/text-to-speech?token=${token}`,
    {
      speechId,
      audioFileName,
      speechMarksFileName,
      state,
    }
  )

  return response.status === 200
}

const synthesizeTextToSpeech = async (
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> => {
  if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
    throw new Error('Azure Speech Key or Region not set')
  }
  const audioFileName = `speech/${input.id}.mp3`
  const audioFile = createGCSFile(input.bucket, audioFileName)
  const writeStream = audioFile.createWriteStream({
    resumable: true,
  })
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION
  )
  const textType = input.textType || 'text'
  if (textType === 'text') {
    speechConfig.speechSynthesisLanguage = input.languageCode || 'en-US'
    speechConfig.speechSynthesisVoiceName = input.voice || 'en-US-JennyNeural'
  }
  speechConfig.speechSynthesisOutputFormat =
    SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

  // Create the speech synthesizer.
  const synthesizer = new SpeechSynthesizer(speechConfig)
  const speechMarks: SpeechMark[] = []
  let timeOffset = 0
  let characterOffset = 0

  synthesizer.synthesizing = function (s, e) {
    // convert arrayBuffer to stream and write to gcs file
    writeStream.write(Buffer.from(e.result.audioData))
  }

  // The event synthesis completed signals that the synthesis is completed.
  synthesizer.synthesisCompleted = (s, e) => {
    console.info(
      `(synthesized) Reason: ${ResultReason[e.result.reason]} Audio length: ${
        e.result.audioData.byteLength
      }`
    )
  }

  // The synthesis started event signals that the synthesis is started.
  synthesizer.synthesisStarted = (s, e) => {
    console.info('(synthesis started)')
  }

  // The event signals that the service has stopped processing speech.
  // This can happen when an error is encountered.
  synthesizer.SynthesisCanceled = (s, e) => {
    const cancellationDetails = CancellationDetails.fromResult(e.result)
    let str =
      '(cancel) Reason: ' + CancellationReason[cancellationDetails.reason]
    if (cancellationDetails.reason === CancellationReason.Error) {
      str += ': ' + e.result.errorDetails
    }
    console.info(str)
  }

  // The unit of e.audioOffset is tick (1 tick = 100 nanoseconds), divide by 10,000 to convert to milliseconds.
  synthesizer.wordBoundary = (s, e) => {
    speechMarks.push({
      word: e.text,
      time: (timeOffset + e.audioOffset) / 10000,
      start: characterOffset + e.textOffset,
      length: e.wordLength,
      type: 'word',
    })
  }

  synthesizer.bookmarkReached = (s, e) => {
    console.debug(
      `(Bookmark reached), Audio offset: ${
        e.audioOffset / 10000
      }ms, bookmark text: ${e.text}`
    )
    speechMarks.push({
      word: e.text,
      time: (timeOffset + e.audioOffset) / 10000,
      type: 'bookmark',
    })
  }

  const speakTextAsyncPromise = (
    text: string
  ): Promise<SpeechSynthesisResult> => {
    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result) => {
          resolve(result)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  const speakSsmlAsyncPromise = (
    text: string
  ): Promise<SpeechSynthesisResult> => {
    return new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        text,
        (result) => {
          resolve(result)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  if (textType === 'text') {
    // slice the text into chunks of 5,000 characters
    let currentTextChunk = ''
    const textChunks = input.text.split('\n')
    for (let i = 0; i < textChunks.length; i++) {
      currentTextChunk += textChunks[i] + '\n'
      if (currentTextChunk.length < 5000 && i < textChunks.length - 1) {
        continue
      }
      console.debug(`synthesizing ${currentTextChunk}`)
      const result = await speakTextAsyncPromise(currentTextChunk)
      timeOffset = timeOffset + result.audioDuration
      characterOffset = characterOffset + currentTextChunk.length
      currentTextChunk = ''
    }
  } else {
    const document = parseHTML(input.text).document
    const elements = document.querySelectorAll(
      'h1, h2, h3, p, ul, ol, blockquote'
    )
    // convert html elements to the ssml document
    for (const e of Array.from(elements)) {
      const htmlElement = e as HTMLElement
      if (htmlElement.innerText) {
        // use complimentary voice for blockquote, hardcoded for now
        const voice =
          htmlElement.tagName.toLowerCase() === 'blockquote'
            ? input.complimentaryVoice || 'en-US-AriaNeural'
            : input.voice
        const ssml = htmlElementToSsml({
          htmlElement: e,
          language: input.languageCode,
          rate: input.rate,
          volume: input.volume,
          voice,
        })
        console.debug(`synthesizing ${ssml}`)
        const result = await speakSsmlAsyncPromise(ssml)
        // if (result.reason === ResultReason.Canceled) {
        //   synthesizer.close()
        //   throw new Error(result.errorDetails)
        // }
        timeOffset = timeOffset + result.audioDuration
        // characterOffset = characterOffset + htmlElement.innerText.length
      }
    }
  }
  writeStream.end()
  synthesizer.close()

  console.debug(`audio file: ${audioFileName}`)

  // upload Speech Marks file to GCS
  const speechMarksFileName = `speech/${input.id}.json`
  await uploadToBucket(
    speechMarksFileName,
    Buffer.from(JSON.stringify(speechMarks)),
    input.bucket
  )

  return {
    audioFileName,
    speechMarksFileName,
  }
}

const htmlElementToSsml = ({
  htmlElement,
  language = 'en-US',
  voice = 'en-US-JennyNeural',
  rate = 1,
  volume = 100,
}: {
  htmlElement: Element
  language?: string
  voice?: string
  rate?: number
  volume?: number
}): string => {
  const replaceElement = (newElement: Element, oldElement: Element) => {
    const id = oldElement.getAttribute('data-omnivore-anchor-idx')
    if (id) {
      const e = htmlElement.querySelector(`[data-omnivore-anchor-idx="${id}"]`)
      e?.parentNode?.replaceChild(newElement, e)
    }
  }

  const appendBookmarkElement = (parent: Element, element: Element) => {
    const id = element.getAttribute('data-omnivore-anchor-idx')
    if (id) {
      const bookMark = ssml.createElement('bookmark')
      bookMark.setAttribute('mark', `data-omnivore-anchor-idx-${id}`)
      parent.appendChild(bookMark)
    }
  }

  const replaceWithEmphasis = (element: Element, level: string) => {
    const parent = ssml.createDocumentFragment() as unknown as Element
    appendBookmarkElement(parent, element)
    const emphasisElement = ssml.createElement('emphasis')
    emphasisElement.setAttribute('level', level)
    emphasisElement.innerHTML = element.innerHTML.trim()
    parent.appendChild(emphasisElement)
    replaceElement(parent, element)
  }

  const replaceWithSentence = (element: Element) => {
    const parent = ssml.createDocumentFragment() as unknown as Element
    appendBookmarkElement(parent, element)
    const sentenceElement = ssml.createElement('s')
    sentenceElement.innerHTML = element.innerHTML.trim()
    parent.appendChild(sentenceElement)
    replaceElement(parent, element)
  }

  // create new ssml document
  const ssml = parseHTML('').document
  const speakElement = ssml.createElement('speak')
  speakElement.setAttribute('version', '1.0')
  speakElement.setAttribute('xmlns', 'http://www.w3.org/2001/10/synthesis')
  speakElement.setAttribute('xml:lang', language)
  const voiceElement = ssml.createElement('voice')
  voiceElement.setAttribute('name', voice)
  speakElement.appendChild(voiceElement)
  const prosodyElement = ssml.createElement('prosody')
  prosodyElement.setAttribute('rate', `${rate}`)
  prosodyElement.setAttribute('volume', volume.toString())
  voiceElement.appendChild(prosodyElement)
  // add each paragraph to the ssml document
  appendBookmarkElement(prosodyElement, htmlElement)
  // replace emphasis elements with ssml
  htmlElement.querySelectorAll('*').forEach((e) => {
    switch (e.tagName.toLowerCase()) {
      case 's':
        replaceWithEmphasis(e, 'moderate')
        break
      case 'sub':
        if (e.getAttribute('alias') === null) {
          replaceWithEmphasis(e, 'moderate')
        }
        break
      case 'i':
      case 'em':
      case 'q':
      case 'blockquote':
      case 'cite':
      case 'del':
      case 'strike':
      case 'sup':
      case 'summary':
      case 'caption':
      case 'figcaption':
        replaceWithEmphasis(e, 'moderate')
        break
      case 'b':
      case 'strong':
      case 'dt':
      case 'dfn':
      case 'u':
      case 'mark':
      case 'th':
      case 'title':
      case 'var':
        replaceWithEmphasis(e, 'moderate')
        break
      case 'li':
        replaceWithSentence(e)
        break
      default: {
        const parent = ssml.createDocumentFragment() as unknown as Element
        appendBookmarkElement(parent, e)
        const text = (e as HTMLElement).innerText.trim()
        const textElement = ssml.createTextNode(text)
        parent.appendChild(textElement)
        replaceElement(parent, e)
      }
    }
  })
  prosodyElement.appendChild(htmlElement)

  return speakElement.outerHTML.replace(/&nbsp;|\n/g, '')
}

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
      const { audioFileName, speechMarksFileName } =
        await synthesizeTextToSpeech(input)
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
