import axios from 'axios'
import { stripEmojis } from './htmlToSsml'
import {
  TextToSpeech,
  TextToSpeechInput,
  TextToSpeechOutput,
} from './textToSpeech'

const OPENAI_VOICE_PREFIX = 'openai-'

const getVoiceId = (name: string | undefined): string | undefined => {
  if (!name) {
    return undefined
  }

  if (name.startsWith(OPENAI_VOICE_PREFIX)) {
    return name.substring(OPENAI_VOICE_PREFIX.length)
  }

  // map realistic voice name to openai voice id
  const voiceList = [
    {
      voiceId: 'ErXwobaYiN019PkySvjV',
      name: 'echo',
    },
    {
      voiceId: 'pMsXgVXv3BLzUgSXRplE',
      name: 'alloy',
    },
    {
      voiceId: 'onwK4e9ZLuTAKqWW03F9',
      name: 'onyx',
    },
    {
      voiceId: 'ThT5KcBeYPX3keUQqHPh',
      name: 'fable',
    },
    {
      voiceId: 'flq6f7yk4E4fJM5XTYuZ',
      name: 'onyx',
    },
    {
      voiceId: 'XrExE9yKIg1WjnnlVkGX',
      name: 'shimmer',
    },
    {
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      name: 'nova',
    },
    {
      voiceId: 'EXAVITQu4vr4xnSDxMaL',
      name: 'alloy',
    },
    {
      voiceId: 'MF3mGyEYCl7XYWbV9V6O',
      name: 'shimmer',
    },
    {
      voiceId: 'TxGEqnHWrfWFTfGW9XjX',
      name: 'echo',
    },
    {
      voiceId: 'VR6AewLTigWG4xSOukaG',
      name: 'nova',
    },
    {
      voiceId: 'pNInz6obpgDQGcFmaJgB',
      name: 'fable',
    },
  ]
  return voiceList.find((voice) => voice.name === name)?.voiceId
}

export class OpenAITextToSpeech implements TextToSpeech {
  synthesizeTextToSpeech = async (
    input: TextToSpeechInput
  ): Promise<TextToSpeechOutput> => {
    const apiKey = process.env.OPENAI_API_KEY
    const voice = getVoiceId(input.voice)

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

    // Use OpenAI voice for ultra realistic voice
    if (input.isUltraRealisticVoice) {
      return true
    }

    return false
  }
}
