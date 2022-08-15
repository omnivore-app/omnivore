import { buildLogger } from './logger'
import { createGCSFile, getFilePublicUrl } from './uploads'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { env } from '../env'

export interface TextToSpeechInput {
  id: string
  text: string
  voice?: string
  textType?: 'text' | 'ssml'
  engine?: 'standard' | 'neural'
  languageCode?: string
}

export interface TextToSpeechOutput {
  audioUrl: string
  speechMarks: SpeechMark[]
}

export interface SpeechMark {
  time: number
  start: number
  length: number
  word: string
}

const logger = buildLogger('app.dispatch')

// // create a new AWS Polly client
// const client = new AWS.Polly()

export const synthesizeTextToSpeech = async (
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> => {
  const audioFile = `speech/${input.id}.mp3`
  const gcsFile = createGCSFile(audioFile)
  const writeStream = gcsFile.createWriteStream({
    public: true,
    resumable: true,
  })
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    env.azure.speechKey,
    env.azure.speechRegion
  )
  speechConfig.speechSynthesisLanguage = input.languageCode || 'en-US'
  speechConfig.speechSynthesisVoiceName = input.voice || 'en-US-JennyNeural'
  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

  // Create the speech synthesizer.
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig)
  const speechMarks: SpeechMark[] = []

  synthesizer.synthesizing = function (s, e) {
    logger.debug(`synthesizing ${e.result.audioData.byteLength} bytes`)
    // convert arrayBuffer to stream and write to gcs file
    writeStream.write(Buffer.from(e.result.audioData))
  }

  // The event synthesis completed signals that the synthesis is completed.
  synthesizer.synthesisCompleted = function (s, e) {
    logger.info(
      '(synthesized)  Reason: ' +
        sdk.ResultReason[e.result.reason] +
        ' Audio length: ' +
        e.result.audioData.byteLength
    )
  }

  // The synthesis started event signals that the synthesis is started.
  synthesizer.synthesisStarted = function (s, e) {
    logger.info('(synthesis started)')
  }

  // The event signals that the service has stopped processing speech.
  // This can happen when an error is encountered.
  synthesizer.SynthesisCanceled = function (s, e) {
    const cancellationDetails = sdk.CancellationDetails.fromResult(e.result)
    let str =
      '(cancel) Reason: ' + sdk.CancellationReason[cancellationDetails.reason]
    if (cancellationDetails.reason === sdk.CancellationReason.Error) {
      str += ': ' + e.result.errorDetails
    }
    logger.info(str)
  }

  synthesizer.wordBoundary = function (s, e) {
    speechMarks.push({
      word: e.text,
      time: e.audioOffset,
      start: e.textOffset,
      length: e.wordLength,
    })
  }

  const speakTextAsyncPromise = (
    text: string
  ): Promise<sdk.SpeechSynthesisResult> => {
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
  // slice the text into chunks of 1,000 characters
  const textChunks = input.text.match(/.{1,1000}/g) || []
  for (const textChunk of textChunks) {
    console.debug(`synthesizing ${textChunk}`)
    await speakTextAsyncPromise(textChunk)
  }
  writeStream.end()
  synthesizer.close()

  logger.debug(`audio file: ${audioFile}`)
  logger.debug(`speechMarks: ${speechMarks}`)

  return {
    audioUrl: getFilePublicUrl(audioFile),
    speechMarks,
  }
}

// export const createAudio = async (
//   input: TextToSpeechInput
// ): Promise<Buffer> => {
//   const { text, voice, textType, engine, languageCode } = input
//   const params: SynthesizeSpeechInput = {
//     OutputFormat: 'ogg_vorbis',
//     Text: text,
//     TextType: textType || 'text',
//     VoiceId: voice || 'Joanna',
//     Engine: engine || 'neural',
//     LanguageCode: languageCode || 'en-US',
//   }
//   try {
//     const data = await client.synthesizeSpeech(params).promise()
//     return data.AudioStream as Buffer
//   } catch (error) {
//     logger.error('Unable to create audio file', { error })
//     throw error
//   }
// }

// export const createSpeechMarks = async (
//   input: TextToSpeechInput
// ): Promise<string> => {
//   const { text, voice, textType, engine, languageCode } = input
//   const params: SynthesizeSpeechInput = {
//     OutputFormat: 'json',
//     Text: text,
//     TextType: textType || 'text',
//     VoiceId: voice || 'Joanna',
//     Engine: engine || 'neural',
//     SpeechMarkTypes: ['word'],
//     LanguageCode: languageCode || 'en-US',
//   }
//   try {
//     const data = await client.synthesizeSpeech(params).promise()
//     return (data.AudioStream as Buffer).toString()
//   } catch (error) {
//     logger.error('Unable to create speech marks', { error })
//     throw error
//   }
// }
//
// export const createAudioWithSpeechMarks = async (
//   input: TextToSpeechInput
// ): Promise<TextToSpeechOutput> => {
//   try {
//     const audio = await createAudio(input)
//     // upload audio to google cloud storage
//     const filePath = `speech/${input.id}.ogg`
//
//     logger.info('start uploading...', { filePath })
//     await uploadToBucket(filePath, audio, {
//       contentType: 'audio/ogg',
//       public: true,
//     })
//
//     // get public url for audio file
//     const publicUrl = getFilePublicUrl(filePath)
//     logger.info('upload complete', { publicUrl })
//
//     const speechMarks = await createSpeechMarks(input)
//     return {
//       audioUrl: publicUrl,
//       speechMarks,
//     }
//   } catch (error) {
//     logger.error('Unable to create audio with speech marks', error)
//     throw error
//   }
// }

export const htmlToSsml = (
  html: string,
  language = 'en-US',
  voice = 'en-US-JennyNeural',
  rate = 100,
  volume = 100
): string => {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}"><voice name="${voice}"><prosody rate="${rate}%" volume="${volume}%">${html}</prosody></voice></speak>`
}
