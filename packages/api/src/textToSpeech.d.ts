declare module '@omnivore/text-to-speech-handler' {
  function htmlToSsml(html: string, options: SSMLOptions): string[]

  interface SSMLOptions {
    primaryVoice: string
    secondaryVoice: string
    rate: string
    language: string
  }

  export { htmlToSsml }
}
