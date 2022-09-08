declare module '@omnivore/text-to-speech-handler' {
  export function htmlToSpeechFile(
    html: string,
    options: SSMLOptions
  ): SpeechFile

  export interface SSMLOptions {
    primaryVoice?: string
    secondaryVoice?: string
    rate?: string
    language?: string
  }

  interface Utterance {
    idx: string
    wordOffset: number
    wordCount: number
    voice?: string
    text: string
  }

  export interface SpeechFile {
    wordCount: number
    language: string
    defaultVoice: string
    utterances: Utterance[]
  }
}
