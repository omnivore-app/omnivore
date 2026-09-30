import { OmnivoreFeed } from '../../../../../../types/Feeds'
import { OmnivoreArticle } from '../../../../../../types/OmnivoreArticle'
import { defaultAtomConverter } from './defaultAtom'
import { slateAllConverter } from './slateAll'
import { longReadsConverter } from './longReads'

const siteConverters: Record<
  'rss' | 'atom',
  Record<string, (feed: OmnivoreFeed, article: any) => Promise<OmnivoreArticle>>
> = {
  atom: {
    default: defaultAtomConverter,
  },
  rss: {
    default: defaultAtomConverter,
    'https://slate.com/feeds/all.rss': slateAllConverter,
    'https://longreads.com/feed/': longReadsConverter
  },
}

export const getSiteConverter = (type: 'rss' | 'atom', feed: OmnivoreFeed): (feed: OmnivoreFeed, article: any) => Promise<OmnivoreArticle> => {
  return (
    siteConverters[type][feed.link] || siteConverters[type]['default']
  )
}
