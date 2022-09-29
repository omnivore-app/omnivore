import { ContentHandler, PreHandleResult } from './index'
import axios from 'axios'
import { DateTime } from 'luxon'
import _ from 'underscore'

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

class TwitterHandler extends ContentHandler {
  shouldPreHandle(url: string, dom?: Document): boolean {
    return !!TWITTER_BEARER_TOKEN && TWITTER_URL_MATCH.test(url.toString())
  }

  async preHandle(url: string, document?: Document): Promise<PreHandleResult> {
    console.log('prehandling twitter url', url)

    const tweetId = tweetIdFromStatusUrl(url)
    if (!tweetId) {
      throw new Error('could not find tweet id in url')
    }
    const tweetData = (await getTweetById(tweetId)).data as {
      data: {
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
      }
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
    const authorId = tweetData.data.author_id
    const author = tweetData.includes.users.filter((u) => (u.id = authorId))[0]
    // escape html entities in title
    const title = _.escape(titleForAuthor(author))
    const authorImage = author.profile_image_url.replace('_normal', '_400x400')

    let text = tweetData.data.text
    if (tweetData.data.entities && tweetData.data.entities.urls) {
      for (const urlObj of tweetData.data.entities.urls) {
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
          const mediaOpen = `<a class="media-link" href=${linkUrl}>
          <picture>
            <img class="tweet-img" src=${previewUrl} />
          </picture>
          </a>`
          return mediaOpen
        })
        .join('\n')
    }

    const back = `
       — <a href="https://twitter.com/${author.username}">${
      author.username
    }</a> ${author.name} <a href="${url}">${formatTimestamp(
      tweetData.data.created_at
    )}</a>
    </div>
    `
    const content = `
    <head>
      <meta property="og:image" content="${authorImage}" />
      <meta property="og:image:secure_url" content="${authorImage}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${_.escape(
        tweetData.data.text
      )}" />
    </head>
    <body>
      ${front}
      ${includesHtml}
      ${back}
    </body>`

    return { content, url, title }
  }
}
