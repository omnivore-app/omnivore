declare module '@omnivore/text-to-speech-handler' {
  export function htmlToSpeechFile(htmlInput: HtmlInput): SpeechFile

  export interface HtmlInput {
    title?: string
    content: string
    options: SSMLOptions
  }

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
