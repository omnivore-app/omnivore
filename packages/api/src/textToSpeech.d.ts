declare module '@omnivore/text-to-speech-handler' {
  function htmlToSsml(html: string, options: SSMLOptions): SSMLItem[]

  interface SSMLOptions {
    primaryVoice: string
    secondaryVoice: string
    rate: string
    language: string
  }

  interface SSMLItem {
    open: string
    close: string
    textItems: string[]
  }

  export { htmlToSsml }
}
