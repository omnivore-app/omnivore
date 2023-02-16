import {
  TextToSpeech,
  TextToSpeechInput,
  TextToSpeechOutput,
} from './textToSpeech'
import axios from 'axios'

export class RealisticTextToSpeech implements TextToSpeech {
  synthesizeTextToSpeech = async (
    input: TextToSpeechInput
  ): Promise<TextToSpeechOutput> => {
    const voiceId = process.env.REALISTIC_VOICE_ID
    const apiKey = process.env.REALISTIC_VOICE_API_KEY
    const apiEndpoint = process.env.REALISTIC_API_ENDPOINT

    if (!apiEndpoint || !apiKey || !voiceId) {
      throw new Error('API credentials not set')
    }

    const HEADERS = {
      'xi-api-key': apiKey,
      voice_id: voiceId,
      'Content-Type': 'application/json',
    }

    const requestUrl = `${apiEndpoint}/${voiceId}`
    const response = await axios.post<Buffer>(
      requestUrl,
      {
        text: input.text,
      },
      {
        headers: HEADERS,
      }
    )

    if (response.data.length === 0) {
      throw new Error('No payload returned')
    }

    return {
      speechMarks: [],
      audioData: response.data,
    }
  }

  use(input: TextToSpeechInput): boolean {
    return !!input.isUltraRealisticVoice
  }
}
