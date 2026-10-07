import { OmnivoreFeed } from '../../../../../../types/Feeds'
import { OmnivoreArticle } from '../../../../../../types/OmnivoreArticle'
import { defaultRssConverter } from './defaultRss'

const shouldSkip = (article: any): boolean => {
  const categories = article.category;
  return categories.some((category: string) => category === 'Gear / Deals')
}

export const wiredConverter = async (
  feed: OmnivoreFeed,
  article: any
): Promise<OmnivoreArticle> => {
  if (shouldSkip(article)) {

    // We just return an empty stub, because we have already decided to skip this article.
    return {
      authors: '',
      description: '',
      feedId: '',
      image: '',
      publishedAt: new Date(),
      site: '',
      skip: true,
      slug: '',
      summary: '',
      title: '',
      type: 'rss',
      url: ''
    }
  }

  // Otherwise we return the default atom converter.
  return defaultRssConverter(feed, article)
}
