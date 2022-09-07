declare module '@omnivore/text-to-speech-handler' {
  export function htmlToSpeechFile(
    html: string,
    options: SSMLOptions
  ): SpeechFile

  export interface SSMLOptions {
    primaryVoice?: string
    secondaryVoice?: string
    rate?: number
    language?: string
  }

  interface Utterance {
    idx: number
    wordOffset: number
    wordCount: number
    voice?: string
    text: string
  }

  export interface SpeechFile {
    wordCount: number
    averageWPM: number
    language: string
    defaultVoice: string
    utterances: Utterance[]
  }
}
