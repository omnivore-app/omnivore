export type OmnivoreArticle = {
  slug: string
  title: string
  description: string
  summary: string
  image?: string
  authors: string
  site: string
  url: string
  publishedAt: Date
  type: 'community' | 'rss'
  feedId: string
}

export type RSSArticle = {
  title: string
  link: string
  description: string
  'media:thumbnail': { '@_url': string }
  'dc:creator': string
  pubDate: string
}
