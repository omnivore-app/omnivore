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

const streamWavToMp3 = (inputStream: PassThrough, outputSteam: PassThrough) => {
  ffmpeg(inputStream)
    .on('error', (err) => {
      throw err
    })
    .on('end', () => {
      outputSteam.end()
    })
    .pipe(outputSteam, { end: true })
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
    const outputStream = input.audioStream

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
    while (true) {
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
        inputStream.end(downloadResponse.data)
        break
      } catch (e) {
        // ignore error
        console.debug('checking status of audio file', downloadUrl)
      }
    }

    // transcode the audio file to mp3
    if (outputStream) {
      streamWavToMp3(inputStream, outputStream as PassThrough)
    }

    return {
      speechMarks: [],
    }
  }

  use(input: TextToSpeechInput): boolean {
    return !!input.isUltraRealisticVoice
  }
}
