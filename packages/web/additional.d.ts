export {}

declare type AndroidWebKitMessenger = {
  // 1st argument is an actionID value, 2nd is jsonString
  handleIdentifiableMessage: (string, string) => void
}

declare global {
  interface Window {
    webkit?: Webkit
    MathJax?: MathJax
    ANALYTICS_INITIALIZED: boolean
    // eslint-disable-next-line @typescript-eslint/ban-types
    Intercom: Function
    intercomSettings: IntercomSettings
    AndroidWebKitMessenger?: AndroidWebKitMessenger
    themeKey?: string
    twttr?: EmbedTweetWidget
    tiktokEmbed?: EmbedTiktokWidget
  }
}

declare type MathJax = {
  typeset?: () => void
}

declare type Webkit = {
  messageHandlers: MessageHandlers
}

declare type MessageHandlers = {
  viewerAction?: WebKitMessageHandler
  highlightAction?: WebKitMessageHandler
  readingProgressUpdate?: WebKitMessageHandler
}

declare type WebKitMessageHandler = {
  postMessage: (unknown) => void
}

interface IntercomSettings {
  app_id: string
  hide_default_launcher: boolean
  vertical_padding: number
  custom_launcher_selector: string
}

export interface EmbedTweetWidget {
  widgets: {
    createTweet: (string, HTMLElement, unknown) => void
  }
  [key: string]: string | { createTweet: unknown }
}

export interface EmbedTiktokWidget {
  lib: {
    render: (tiktoksOnPage) => void
  }
}
