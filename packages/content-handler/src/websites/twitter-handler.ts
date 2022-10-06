import { ContentHandler, PreHandleResult } from '../content-handler'
import axios from 'axios'
import { DateTime } from 'luxon'
import _ from 'underscore'

interface TweetData {
  author_id: string
  text: string
  entities: {
    urls: [
      {
        url: string
        expanded_url: string
        display_url: string
      }
    ]
  }
  created_at: string
  referenced_tweets: [
    {
      type: string
      id: string
    }
  ]
  includes: {
    users: [
      {
        id: string
        name: string
        profile_image_url: string
        username: string
      }
    ]
    media: [
      {
        preview_image_url: string
        type: string
        url: string
      }
    ]
  }
}

interface TweetThread {
  data: TweetData[]
}

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN
const TWITTER_URL_MATCH =
  /twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?/

const getTweetFields = () => {
  const TWEET_FIELDS =
    '&tweet.fields=attachments,author_id,conversation_id,created_at,' +
    'entities,geo,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,' +
    'source,withheld'
  const EXPANSIONS = '&expansions=author_id,attachments.media_keys'
  const USER_FIELDS =
    '&user.fields=created_at,description,entities,location,pinned_tweet_id,profile_image_url,protected,public_metrics,url,verified,withheld'
  const MEDIA_FIELDS =
    '&media.fields=duration_ms,height,preview_image_url,url,media_key,public_metrics,width'

  return `${TWEET_FIELDS}${EXPANSIONS}${USER_FIELDS}${MEDIA_FIELDS}`
}

// unroll recent tweet thread
const getTweetThread = async (id: string): Promise<TweetThread> => {
  const BASE_ENDPOINT = 'https://api.twitter.com/2/tweets/search/recent'
  const apiUrl = new URL(
    BASE_ENDPOINT +
      '?query=' +
      encodeURIComponent(`conversation_id:${id}`) +
      '&' +
      getTweetFields()
  )

  if (!TWITTER_BEARER_TOKEN) {
    throw new Error('No Twitter bearer token found')
  }

  const response = await axios.get<TweetThread>(apiUrl.toString(), {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      redirect: 'follow',
    },
  })
  return response.data
}

const getTweetById = async (id: string) => {
  const BASE_ENDPOINT = 'https://api.twitter.com/2/tweets/'
  const apiUrl = new URL(BASE_ENDPOINT + id + '?' + getTweetFields())

  if (!TWITTER_BEARER_TOKEN) {
    throw new Error('No Twitter bearer token found')
  }

  return axios.get(apiUrl.toString(), {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      redirect: 'follow',
    },
  })
}

const titleForAuthor = (author: { name: string }) => {
  return `${author.name} on Twitter`
}

const tweetIdFromStatusUrl = (url: string): string | undefined => {
  const match = url.toString().match(TWITTER_URL_MATCH)
  return match?.[2]
}

const formatTimestamp = (timestamp: string) => {
  return DateTime.fromJSDate(new Date(timestamp)).toLocaleString(
    DateTime.DATETIME_FULL
  )
}

export class TwitterHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Twitter'
  }

  shouldPreHandle(url: string, dom?: Document): boolean {
    return !!TWITTER_BEARER_TOKEN && TWITTER_URL_MATCH.test(url.toString())
  }

  async preHandle(url: string, document?: Document): Promise<PreHandleResult> {
    console.log('prehandling twitter url', url)

    const tweetId = tweetIdFromStatusUrl(url)
    if (!tweetId) {
      throw new Error('could not find tweet id in url')
    }
    const tweetThread = await getTweetThread(tweetId)
    const tweetData = tweetThread.data[0]
    const authorId = tweetData.author_id
    const author = tweetData.includes.users.filter((u) => (u.id = authorId))[0]
    // escape html entities in title
    const title = _.escape(titleForAuthor(author))
    const authorImage = author.profile_image_url.replace('_normal', '_400x400')
    const description = _.escape(tweetData.text)

    let tweetHtml = ''
    for (const tweetData of tweetThread.data) {
      let text = tweetData.text
      if (tweetData.entities && tweetData.entities.urls) {
        for (const urlObj of tweetData.entities.urls) {
          text = text.replace(
            urlObj.url,
            `<a href="${urlObj.expanded_url}">${urlObj.display_url}</a>`
          )
        }
      }

      const front = `
    <div>
      <p>${text}</p>
    `

      let includesHtml = ''
      if (tweetData.includes.media) {
        includesHtml = tweetData.includes.media
          .map((m) => {
            const linkUrl = m.type == 'photo' ? m.url : url
            const previewUrl = m.type == 'photo' ? m.url : m.preview_image_url
            return `<a class="media-link" href=${linkUrl}>
          <picture>
            <img class="tweet-img" src=${previewUrl} />
          </picture>
          </a>`
          })
          .join('\n')
      }

      const back = `
       — <a href="https://twitter.com/${author.username}">${
        author.username
      }</a> ${author.name} <a href="${url}">${formatTimestamp(
        tweetData.created_at
      )}</a>
    </div>
    `
      tweetHtml += `
        ${front}
        ${includesHtml}
        ${back}
      `
    }

    const content = `
    <head>
      <meta property="og:image" content="${authorImage}" />
      <meta property="og:image:secure_url" content="${authorImage}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
    </head>
    <body>
      ${tweetHtml}
    </body>`

    return { content, url, title }
  }
}
