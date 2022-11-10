import {
  TextToSpeech,
  TextToSpeechInput,
  TextToSpeechOutput,
} from './textToSpeech'
import axios from 'axios'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import { PassThrough } from 'stream'

ffmpeg.setFfmpegPath(ffmpegPath.path)

interface PlayHtConvertResponse {
  message: string
  payload: string[]
}

const convertWavToMp3AndUpload = async (
  inputStream: PassThrough,
  outputStream: PassThrough
) => {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(inputStream)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('error', (err) => {
        reject(err)
      })
      .on('end', () => {
        console.debug('Finished processing')
        resolve()
      })
      .pipe(outputStream, { end: true })
  })
}

export class RealisticTextToSpeech implements TextToSpeech {
  synthesizeTextToSpeech = async (
    input: TextToSpeechInput
  ): Promise<TextToSpeechOutput> => {
    const apiEndpoint = process.env.REALISTIC_VOICE_API_ENDPOINT
    const apiKey = process.env.REALISTIC_VOICE_API_KEY
    const userId = process.env.REALISTIC_VOICE_USER_ID
    if (!apiEndpoint || !apiKey || !userId) {
      throw new Error('PlayHT API credentials not set')
    }

    const inputStream = new PassThrough()

    const HEADERS = {
      Authorization: apiKey,
      'X-User-ID': userId,
      'Content-Type': 'application/json',
    }

    const data = {
      voice: input.voice,
      content: [input.text],
    }

    // get the download url first
    const response = await axios.post<PlayHtConvertResponse>(
      apiEndpoint,
      data,
      {
        headers: HEADERS,
      }
    )

    if (response.data.payload.length === 0) {
      throw new Error('No payload returned')
    }

    const downloadUrl = response.data.payload[0]

    // polling the download url until the file is ready
    // timeout after 1 hour
    const timeout = 60 * 60 * 1000
    const startTime = Date.now()
    let isReady = false
    while (!isReady) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout when polling the download url')
      }

      // download the audio file
      try {
        const downloadResponse = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'audio/wav',
          },
        })

        // write the audio file to the input stream
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        inputStream.end(Buffer.from(downloadResponse.data, 'binary'))
        isReady = true
      } catch (e) {
        // ignore error
        console.debug('checking status of audio file', downloadUrl)
      }
    }

    const outputStream = new PassThrough()
    // transcode the audio file to mp3
    await convertWavToMp3AndUpload(inputStream, outputStream)

    // convert the buffer stream to a buffer
    const audioData = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      outputStream.on('data', (chunk) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        chunks.push(chunk)
      })
      outputStream.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      outputStream.on('error', (err) => {
        reject(err)
      })
    })

    return {
      audioData,
      speechMarks: [],
    }
  }

  use(input: TextToSpeechInput): boolean {
    return !!input.isUltraRealisticVoice
  }
}
