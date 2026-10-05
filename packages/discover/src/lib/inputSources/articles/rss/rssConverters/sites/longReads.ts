import { OmnivoreFeed } from '../../../../../../types/Feeds'
import { OmnivoreArticle } from '../../../../../../types/OmnivoreArticle'
import { parseHTML } from 'linkedom'
import { defaultRssConverter } from './defaultRss'
import { streamHeadAndRetrieveOpenGraph } from '../generic'


const getDescriptionAndImage = async (link: string) => {
  const ogData = await streamHeadAndRetrieveOpenGraph(link)
  const image = ogData.image
  const description = ogData.description

  return { image, description }
}

export const longReadsConverter = async (
  feed: OmnivoreFeed,
  article: any
): Promise<OmnivoreArticle> => {
  const defaultArticle = await defaultRssConverter(feed, article)
  // The long reads rss feed contains the full content.
  const dom = parseHTML(article['content:encoded']).document

  const readFullStoryButton = [
    ...dom.getElementsByClassName('wp-element-button'),
  ].find((it) => it.innerHTML === 'Read the story')
  const url = readFullStoryButton?.getAttribute('href')

  if (!readFullStoryButton || !url) {
    return defaultArticle
  }

  // Otherwise...
  const {image, description} = await getDescriptionAndImage(url)
  return {
    ...defaultArticle,
    description: description || defaultArticle.description,
    image: image || defaultArticle.image,
  }
}
