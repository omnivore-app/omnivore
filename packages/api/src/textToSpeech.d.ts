declare module '@omnivore/text-to-speech-handler' {
  export function htmlToSsmlItems(
    html: string,
    options: SSMLOptions
  ): SSMLItem[]

  export interface SSMLOptions {
    primaryVoice: string
    secondaryVoice: string
    rate: string
    language: string
  }

  export interface SSMLItem {
    open: string
    close: string
    textItems: string[]
    idx: number
    voice?: string
  }
}
