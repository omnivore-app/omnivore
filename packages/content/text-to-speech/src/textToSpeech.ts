export interface TextToSpeechInput {
  text: string
  key: string
  voice?: string
  language?: string
  textType?: 'html' | 'ssml'
  rate?: string
  secondaryVoice?: string
  audioStream?: NodeJS.ReadWriteStream
  isOpenAIVoice?: boolean
  isUltraRealisticVoice?: boolean
}

export interface TextToSpeechOutput {
  audioData?: Buffer
  speechMarks: SpeechMark[]
}

export interface SpeechMark {
  time: number
  start?: number
  length?: number
  word: string
  type: 'word' | 'bookmark'
}
export abstract class TextToSpeech {
  abstract use(input: TextToSpeechInput): boolean

  abstract synthesizeTextToSpeech(
    input: TextToSpeechInput
  ): Promise<TextToSpeechOutput>
}
