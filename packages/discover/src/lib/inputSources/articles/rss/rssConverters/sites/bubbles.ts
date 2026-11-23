import { OmnivoreFeed } from '../../../../../../types/Feeds'
import { OmnivoreArticle } from '../../../../../../types/OmnivoreArticle'
import { removeHTMLTag } from '../generic'
import { defaultAtomConverter } from './defaultAtom'

const SKIPPABLE_TITLES = [
  'Re:',
  're:'
]

const shouldSkip = (article: any): boolean => {
  const title = removeHTMLTag(article.title['#text'] ?? article.title)

  return SKIPPABLE_TITLES.some((it) => title.indexOf(it) === 0);
}

export const bubbleConverter = async (
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
      url: '',
    }
  }

  // Otherwise we return the default atom converter.
  return defaultAtomConverter(feed, article)
}
