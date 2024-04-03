export type OmnivoreFeed = {
  id: string
  description?: string
  image?: string
  link: string
  title: string
  type: string
}

export type OmnivoreContentFeed = {
  feed: OmnivoreFeed
  content: string
}
