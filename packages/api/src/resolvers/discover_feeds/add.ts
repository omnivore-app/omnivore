/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'
import { v4 } from 'uuid'
import { appDataSource } from '../../data_source'
import {
  AddDiscoverFeedError,
  AddDiscoverFeedErrorCode,
  AddDiscoverFeedSuccess,
  DiscoverFeed,
  MutationAddDiscoverFeedArgs,
} from '../../generated/graphql'
import { authorized } from '../../utils/gql-utils'
import { enqueueDiscoverJob } from '../../utils/createTask'

const RSS_PARSER_CONFIG = {
  timeout: 5000, // 5 seconds
  headers: {
    // some rss feeds require user agent
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    Accept:
      'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4, text/html;q=0.2',
  },
}

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true,
  ignoreDeclaration: false,
  ignorePiTags: false,
})

const extractAtomData = (
  url: string,
  feed: {
    title: string
    subtitle?: string
    icon?: string
  }
): Partial<DiscoverFeed> => ({
  description: feed.subtitle ?? '',
  title: feed.title ?? url,
  image: feed.icon,
  link: url,
  type: 'atom',
})

const extractRssData = (
  url: string,
  parsedXml: {
    channel: {
      title: string
      description?: string
      ['sy:updateFrequency']: number
    }
    image: { url: string }
  }
): Partial<DiscoverFeed> => ({
  description: parsedXml.channel?.description ?? '',
  title: parsedXml.channel.title ?? url,
  image: parsedXml.image?.url,
  link: url,
  type: 'rss',
})

const handleExistingSubscription = async (
  feed: DiscoverFeed,
  userId: string
): Promise<AddDiscoverFeedSuccess | AddDiscoverFeedError> => {
  // Add to existing, otherwise conflict.
  const existingSubscription = await appDataSource.query(
    'SELECT * FROM omnivore.discover_feed_subscription WHERE user_id = $1 and feed_id = $2',
    [userId, feed.id]
  )

  if (existingSubscription.length > 0) {
    return {
      __typename: 'AddDiscoverFeedError',
      errorCodes: [AddDiscoverFeedErrorCode.Conflict],
    }
  }

  await appDataSource.query(
    'INSERT INTO omnivore.discover_feed_subscription(feed_id, user_id) VALUES($1, $2)',
    [feed.id, userId]
  )

  return {
    __typename: 'AddDiscoverFeedSuccess',
    feed,
  }
}

const addNewSubscription = async (
  url: string,
  userId: string
): Promise<AddDiscoverFeedSuccess | AddDiscoverFeedError> => {
  // First things first, we need to validate that this is an actual RSS or ATOM feed.
  const response = await axios.get(url, RSS_PARSER_CONFIG)
  const content = response.data

  const contentType = response.headers['content-type']
  const isXML =
    contentType?.includes('text/rss+xml') ||
    contentType?.includes('text/atom+xml') ||
    contentType?.includes('application/xml') || 
    contentType?.includes('text/xml') || 
    contentType?.includes('application/rss')

  if (!isXML) {
    return {
      __typename: 'AddDiscoverFeedError',
      errorCodes: [AddDiscoverFeedErrorCode.BadRequest],
    }
  }
  const parsedFeed = parser.parse(content)

  if (!parsedFeed?.rss && !parsedFeed['rdf:RDF'] && !parsedFeed['feed']) {
    return {
      __typename: 'AddDiscoverFeedError',
      errorCodes: [AddDiscoverFeedErrorCode.BadRequest],
    }
  }

  const feed =
    parsedFeed?.rss || parsedFeed['rdf:RDF']
      ? extractRssData(url, parsedFeed.rss || parsedFeed['rdf:RDF'])
      : extractAtomData(url, parsedFeed.feed)

  if (!feed.title) {
    return {
      __typename: 'AddDiscoverFeedError',
      errorCodes: [AddDiscoverFeedErrorCode.BadRequest],
    }
  }

  const discoverFeedId = v4()
  await appDataSource.query(
    'INSERT INTO omnivore.discover_feed(id, title, link, image, type, description) VALUES($1, $2, $3, $4, $5, $6)',
    [
      discoverFeedId,
      feed.title,
      feed.link,
      feed.image,
      feed.type,
      feed.description,
    ]
  )

  await appDataSource.query(
    'INSERT INTO omnivore.discover_feed_subscription(feed_id, user_id) VALUES($2, $1)',
    [userId, discoverFeedId]
  )

  return {
    __typename: 'AddDiscoverFeedSuccess',
    feed: { ...feed, id: discoverFeedId } as DiscoverFeed,
  }
}

export const addDiscoverFeedResolver = authorized<
  AddDiscoverFeedSuccess,
  AddDiscoverFeedError,
  MutationAddDiscoverFeedArgs
>(async (_, { input: { url } }, { uid, log }) => {
  try {
    const existingFeed = (await appDataSource.query(
      'SELECT id from omnivore.discover_feed where link = $1',
      [url]
    )) as DiscoverFeed[]

    if (existingFeed.length > 0) {
      return await handleExistingSubscription(existingFeed[0], uid)
    }

    const result = await addNewSubscription(url, uid)
    if (result.__typename == 'AddDiscoverFeedSuccess') {
      await enqueueDiscoverJob({ id: result.feed.id, feed: result.feed })
    }

    return result
  } catch (error) {
    log.error('Error Getting Discover Articles', error)

    return {
      __typename: 'AddDiscoverFeedError',
      errorCodes: [AddDiscoverFeedErrorCode.Unauthorized],
    }
  }
})
