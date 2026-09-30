import { OmnivoreFeed } from '../../../../../../types/Feeds'
import { OmnivoreArticle } from '../../../../../../types/OmnivoreArticle'
import { removeHTMLTag } from '../generic'
import { defaultRssConverter } from './defaultRss'


const SKIPPABLE_TITLES = [
  'Slate SoundBites',
  'Slate Mini Crossword',
  'Slate Pears Game',
  'Slate Crossword',
]

const SKIPPABLE_URLS = ['trivia-quiz-daily', '/podcasts/']

const shouldSkip = (article: any): boolean => {
  const title = removeHTMLTag(article.title['#text'] ?? article.title)

  return (
    SKIPPABLE_TITLES.some((it) => title.includes(it)) ||
    SKIPPABLE_URLS.some((it) => article.link['@_href']?.includes(it))
  )
}

export const slateAllConverter = async (
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
