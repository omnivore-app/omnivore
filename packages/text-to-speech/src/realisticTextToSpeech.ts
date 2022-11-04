import {
  TextToSpeech,
  TextToSpeechInput,
  TextToSpeechOutput,
} from './textToSpeech'
import axios from 'axios'

interface PlayHtConvertResponse {
  message: string
  payload: string[]
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
    // timeout after 5 minutes
    const timeout = 5 * 60 * 1000
    const startTime = Date.now()
    let audioData: Buffer | undefined
    while (!audioData) {
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
        // convert the wav file to buffer
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        audioData = Buffer.from(downloadResponse.data, 'binary')
      } catch (e) {
        // ignore error
        console.debug('checking status of audio file', downloadUrl)
      }
    }

    return {
      audioData,
      speechMarks: [],
    }
  }

  use(input: TextToSpeechInput): boolean {
    return !!input.isUltraRealisticVoice
  }
}
