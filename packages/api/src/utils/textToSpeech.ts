import { buildLogger } from './logger'
import { createGCSFile, getFilePublicUrl, uploadToBucket } from './uploads'
import {
  CancellationDetails,
  CancellationReason,
  ResultReason,
  SpeechConfig,
  SpeechSynthesisOutputFormat,
  SpeechSynthesisResult,
  SpeechSynthesizer,
} from 'microsoft-cognitiveservices-speech-sdk'
import { env } from '../env'
import { parseHTML } from 'linkedom'

export interface TextToSpeechInput {
  id: string
  text: string
  voice?: string
  languageCode?: string
}

export interface TextToSpeechOutput {
  audioUrl: string
  speechMarksUrl: string
}

export interface SpeechMark {
  time: number
  start?: number
  length?: number
  word: string
  type: 'word' | 'bookmark'
}

const logger = buildLogger('app.dispatch')

export const synthesizeTextToSpeech = async (
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> => {
  const audioFile = `speech/${input.id}.mp3`
  const gcsFile = createGCSFile(audioFile)
  const writeStream = gcsFile.createWriteStream({
    public: true,
    resumable: true,
  })
  const speechConfig = SpeechConfig.fromSubscription(
    env.azure.speechKey,
    env.azure.speechRegion
  )
  speechConfig.speechSynthesisLanguage = input.languageCode || 'en-US'
  speechConfig.speechSynthesisVoiceName = input.voice || 'en-US-JennyNeural'
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
    logger.info(
      `(synthesized) Reason: ${ResultReason[e.result.reason]} Audio length: ${
        e.result.audioData.byteLength
      }`
    )
  }

  // The synthesis started event signals that the synthesis is started.
  synthesizer.synthesisStarted = (s, e) => {
    logger.info('(synthesis started)')
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
    logger.info(str)
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
    logger.info(
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
          synthesizer.close()
          reject(error)
        }
      )
    })
  }
  // slice the text into chunks of 5,000 characters
  let currentTextChunk = ''
  const textChunks = input.text.split('\n')
  for (const textChunk of textChunks) {
    currentTextChunk += textChunk + '\n'
    if (currentTextChunk.length < 5000) {
      continue
    }
    logger.debug(`synthesizing ${currentTextChunk}`)
    const result = await speakTextAsyncPromise(currentTextChunk)
    timeOffset = timeOffset + result.audioDuration
    characterOffset = characterOffset + currentTextChunk.length
    currentTextChunk = ''
  }
  writeStream.end()
  synthesizer.close()

  logger.debug(`audio file: ${audioFile}`)

  // upload Speech Marks file to GCS
  const speechMarksFile = `speech/${input.id}.json`
  await uploadToBucket(
    speechMarksFile,
    Buffer.from(JSON.stringify(speechMarks)),
    {
      public: true,
    }
  )

  return {
    audioUrl: getFilePublicUrl(audioFile),
    speechMarksUrl: getFilePublicUrl(speechMarksFile),
  }
}

export const htmlToSsml = (
  html: string,
  language = 'en-US',
  voice = 'en-US-JennyNeural',
  rate = 100,
  volume = 100
): string => {
  const document = parseHTML(html).document
  const paragraphs = document.querySelectorAll('p')
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
  prosodyElement.setAttribute('rate', `${rate}%`)
  prosodyElement.setAttribute('volume', volume.toString())
  voiceElement.appendChild(prosodyElement)
  // add each paragraph to the ssml document
  paragraphs.forEach((p) => {
    const id = p.getAttribute('data-omnivore-anchor-idx')
    if (id) {
      const text = p.innerText
      const bookMark = ssml.createElement('bookmark')
      bookMark.setAttribute('mark', `data-omnivore-anchor-idx-${id}`)
      bookMark.innerText = text
      prosodyElement.appendChild(bookMark)
    }
  })

  return speakElement.outerHTML
}
