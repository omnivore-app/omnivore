import { OmnivoreFeed } from '../../../../../../types/Feeds'
import { OmnivoreArticle } from '../../../../../../types/OmnivoreArticle'
import { defaultAtomConverter } from './defaultAtom'
import { slateAllConverter } from './slateAll'
import { longReadsConverter } from './longReads'
import { defaultRssConverter } from './defaultRss'
import { bubbleConverter } from './bubbles'

const siteConverters: Record<
  'rss' | 'atom',
  Record<string, (feed: OmnivoreFeed, article: any) => Promise<OmnivoreArticle>>
> = {
  atom: {
    default: defaultAtomConverter,
    'https://bubbles.town/feed/votes/10': bubbleConverter,
    'https://bubbles.town/feed/votes/5': bubbleConverter
  },
  rss: {
    default: defaultRssConverter,
    'https://slate.com/feeds/all.rss': slateAllConverter,
    'https://longreads.com/feed/': longReadsConverter
  },
}

export const getSiteConverter = (type: 'rss' | 'atom', feed: OmnivoreFeed): (feed: OmnivoreFeed, article: any) => Promise<OmnivoreArticle> => {
  return (
    siteConverters[type][feed.link] || siteConverters[type]['default']
  )
}
