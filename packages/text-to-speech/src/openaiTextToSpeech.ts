import {
  TextToSpeech,
  TextToSpeechInput,
  TextToSpeechOutput,
} from './textToSpeech'
import axios from 'axios'
import { stripEmojis } from './htmlToSsml'

const OPEN_AI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

export class OpenAITextToSpeech implements TextToSpeech {
  synthesizeTextToSpeech = async (
    input: TextToSpeechInput,
  ): Promise<TextToSpeechOutput> => {
    const apiKey = process.env.OPENAI_API_KEY
    const voice = input.voice?.substring('openai-'.length)

    if (!apiKey) {
      throw new Error('API credentials not set')
    }

    const HEADERS = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }

    const payload = {
      model: 'tts-1',
      voice: voice,
      input: stripEmojis(input.text),
    }

    const requestUrl = `https://api.openai.com/v1/audio/speech`
    const response = await axios.post<Buffer>(requestUrl, payload, {
      headers: HEADERS,
      responseType: 'arraybuffer',
    })

    if (response.data.length === 0) {
      console.log('No payload returned: ', response)
      throw new Error('No payload returned')
    }

    return {
      speechMarks: [],
      audioData: response.data,
    }
  }

  use(input: TextToSpeechInput): boolean {
    if (input.voice?.startsWith('openai-')) {
      return true
    }
    return false
  }
}
