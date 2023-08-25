import {
  TextToSpeech,
  TextToSpeechInput,
  TextToSpeechOutput,
} from './textToSpeech'
import axios from 'axios'
import { stripEmojis } from './htmlToSsml'

const getRealisticVoiceId = (name: string | undefined) => {
  const voiceList = [
    {
      voiceId: 'ErXwobaYiN019PkySvjV',
      name: 'Antoni',
    },
    {
      voiceId: 'pMsXgVXv3BLzUgSXRplE',
      name: 'Serena',
    },
    {
      voiceId: 'onwK4e9ZLuTAKqWW03F9',
      name: 'Daniel',
    },
    {
      voiceId: 'ThT5KcBeYPX3keUQqHPh',
      name: 'Dorothy',
    },
    {
      voiceId: 'flq6f7yk4E4fJM5XTYuZ',
      name: 'Michael',
    },
    {
      voiceId: 'XrExE9yKIg1WjnnlVkGX',
      name: 'Matilda',
    },
    {
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      name: 'Rachel',
    },
    {
      voiceId: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Bella',
    },
    {
      voiceId: 'MF3mGyEYCl7XYWbV9V6O',
      name: 'Elli',
    },
    {
      voiceId: 'TxGEqnHWrfWFTfGW9XjX',
      name: 'Josh',
    },
    {
      voiceId: 'VR6AewLTigWG4xSOukaG',
      name: 'Arnold',
    },
    {
      voiceId: 'pNInz6obpgDQGcFmaJgB',
      name: 'Adam',
    },
  ]
  return voiceList.find((voice) => voice.name === name)?.voiceId
}

export class RealisticTextToSpeech implements TextToSpeech {
  synthesizeTextToSpeech = async (
    input: TextToSpeechInput
  ): Promise<TextToSpeechOutput> => {
    const voiceId = getRealisticVoiceId(input.voice)
    const apiKey = process.env.REALISTIC_VOICE_API_KEY
    const apiEndpoint = process.env.REALISTIC_VOICE_API_ENDPOINT

    if (!apiEndpoint || !apiKey || !voiceId) {
      throw new Error('API credentials not set')
    }

    const HEADERS = {
      'xi-api-key': apiKey,
      voice_id: voiceId,
      'Content-Type': 'application/json',
    }

    const requestUrl = `${apiEndpoint}${voiceId}`
    const response = await axios.post<Buffer>(
      requestUrl,
      {
        text: stripEmojis(input.text),
      },
      {
        headers: HEADERS,
        responseType: 'arraybuffer',
      }
    )

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
    return !!input.isUltraRealisticVoice
  }
}
