import {
  CancellationDetails,
  CancellationReason,
  ResultReason,
  SpeechConfig,
  SpeechSynthesisOutputFormat,
  SpeechSynthesisResult,
  SpeechSynthesizer,
} from 'microsoft-cognitiveservices-speech-sdk'
import { htmlToSsmlItems, ssmlItemText } from './htmlToSsml'

export interface TextToSpeechInput {
  id?: string
  text: string
  voice?: string
  languageCode?: string
  textType?: 'html' | 'ssml'
  rate?: number
  volume?: number
  complimentaryVoice?: string
  bucket?: string
  audioStream: NodeJS.ReadWriteStream
  ssmlItems?: string[]
  speechMarksStream: NodeJS.ReadWriteStream
}

export interface TextToSpeechOutput {
  speechMarks: SpeechMark[]
}

export interface SpeechMark {
  time: number
  start?: number
  length?: number
  word: string
  type: 'word' | 'bookmark'
}

export const synthesizeTextToSpeech = async (
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> => {
  if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
    throw new Error('Azure Speech Key or Region not set')
  }
  const textType = input.textType || 'html'
  const audioStream = input.audioStream
  const speechMarksStream = input.speechMarksStream
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION
  )
  speechConfig.speechSynthesisOutputFormat =
    SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

  // Create the speech synthesizer.
  const synthesizer = new SpeechSynthesizer(speechConfig)
  const speechMarks: SpeechMark[] = []
  let timeOffset = 0

  synthesizer.synthesizing = function (s, e) {
    // convert arrayBuffer to stream and write to stream
    audioStream.write(Buffer.from(e.result.audioData))
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
    console.error(str)
  }

  // The unit of e.audioOffset is tick (1 tick = 100 nanoseconds), divide by 10,000 to convert to milliseconds.
  synthesizer.wordBoundary = (s, e) => {
    console.debug(
      `(word boundary) Audio offset: ${e.audioOffset / 10000}ms, text: ${
        e.text
      }`
    )
    speechMarksStream.write(
      Buffer.from(
        JSON.stringify({
          word: e.text,
          time: (timeOffset + e.audioOffset) / 10000,
          start: e.textOffset,
          length: e.wordLength,
          type: 'word',
        })
      )
    )
  }

  synthesizer.bookmarkReached = (s, e) => {
    console.debug(
      `(bookmark reached) Audio offset: ${
        e.audioOffset / 10000
      }ms, bookmark text: ${e.text}`
    )
    speechMarksStream.write(
      Buffer.from(
        JSON.stringify({
          word: e.text,
          time: (timeOffset + e.audioOffset) / 10000,
          type: 'bookmark',
        })
      )
    )
  }

  const speakSsmlAsyncPromise = (
    ssml: string
  ): Promise<SpeechSynthesisResult> => {
    return new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          resolve(result)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  try {
    if (textType === 'html') {
      const ssmlItems = htmlToSsmlItems(input.text, {
        primaryVoice: input.voice || 'en-US-JennyNeural',
        secondaryVoice: input.complimentaryVoice || 'en-US-GuyNeural',
        language: input.languageCode || 'en-US',
        rate: '1.333',
      })
      for (const ssmlItem of ssmlItems) {
        const ssml = ssmlItemText(ssmlItem)
        const result = await speakSsmlAsyncPromise(ssml)
        timeOffset = timeOffset + result.audioDuration
      }
    } else {
      for (const ssmlItem of input.ssmlItems || []) {
        await speakSsmlAsyncPromise(ssmlItem)
      }
    }
  } catch (error) {
    console.error('synthesis error', error)
    throw error
  } finally {
    console.debug('closing synthesizer')
    audioStream.end()
    speechMarksStream.end()
    synthesizer.close()
    console.debug('synthesizer closed')
  }

  return {
    speechMarks,
  }
}
