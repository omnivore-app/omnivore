export {}

declare type AndroidWebKitMessenger = {
  // 1st argument is an actionID value, 2nd is jsonString
  handleIdentifiableMessage: (string, string) => void
}

declare global {
  interface Window {
    showToolbar?: (payload: { type: string }) => void
  }
}
