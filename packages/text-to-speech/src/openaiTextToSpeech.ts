import axios from 'axios'
import { stripEmojis } from './htmlToSsml'
import {
  TextToSpeech,
  TextToSpeechInput,
  TextToSpeechOutput,
} from './textToSpeech'

const OPENAI_VOICE_PREFIX = 'openai-'

const isOpenAIVoice = (voice: string | undefined) =>
  voice?.startsWith(OPENAI_VOICE_PREFIX)

const getVoiceId = (name: string | undefined): string | undefined => {
  if (!name) {
    return undefined
  }

  if (isOpenAIVoice(name)) {
    return name.substring(OPENAI_VOICE_PREFIX.length)
  }

  // map realistic voice name to openai voice id
  const voiceList = [
    {
      voiceId: 'alloy',
      name: 'Antoni',
    },
    {
      voiceId: 'echo',
      name: 'Serena',
    },
    {
      voiceId: 'fable',
      name: 'Daniel',
    },
    {
      voiceId: 'onyx',
      name: 'Dorothy',
    },
    {
      voiceId: 'nova',
      name: 'Michael',
    },
    {
      voiceId: 'shimmer',
      name: 'Matilda',
    },
    {
      voiceId: 'alloy',
      name: 'Rachel',
    },
    {
      voiceId: 'echo',
      name: 'Bella',
    },
    {
      voiceId: 'fable',
      name: 'Elli',
    },
    {
      voiceId: 'onyx',
      name: 'Josh',
    },
    {
      voiceId: 'nova',
      name: 'Arnold',
    },
    {
      voiceId: 'shimmer',
      name: 'Adam',
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
    // Use OpenAI voice for ultra realistic voice
    return isOpenAIVoice(input.voice) || !!input.isUltraRealisticVoice
  }
}
