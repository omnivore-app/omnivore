import { ContentHandler, PreHandleResult } from '../content-handler'
import axios from 'axios'
import { DateTime } from 'luxon'
import _ from 'underscore'
import puppeteer from 'puppeteer-core'

interface TweetIncludes {
  users: {
    id: string
    name: string
    profile_image_url: string
    username: string
  }[]
  media?: {
    preview_image_url: string
    type: string
    url: string
    media_key: string
  }[]
}

interface TweetMeta {
  result_count: number
}

interface TweetData {
  author_id: string
  text: string
  entities: {
    urls: {
      url: string
      expanded_url: string
      display_url: string
    }[]
  }
  created_at: string
  referenced_tweets: {
    type: string
    id: string
  }[]
  conversation_id: string
  attachments?: {
    media_keys: string[]
  }
}

interface Tweet {
  data: TweetData
  includes: TweetIncludes
}

interface TweetThread {
  data: TweetData[]
  includes: TweetIncludes
  meta: TweetMeta
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
const getTweetThread = async (
  conversationId: string,
  username: string
): Promise<TweetThread> => {
  const BASE_ENDPOINT = 'https://api.twitter.com/2/tweets/search/recent'
  const apiUrl = new URL(
    BASE_ENDPOINT +
      '?query=' +
      encodeURIComponent(
        `conversation_id:${conversationId} from:${username} to:${username}`
      ) +
      getTweetFields() +
      '&max_results=100'
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

const getTweetById = async (id: string): Promise<Tweet> => {
  const BASE_ENDPOINT = 'https://api.twitter.com/2/tweets/'
  const apiUrl = new URL(BASE_ENDPOINT + id + '?' + getTweetFields())

  if (!TWITTER_BEARER_TOKEN) {
    throw new Error('No Twitter bearer token found')
  }

  const response = await axios.get<Tweet>(apiUrl.toString(), {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      redirect: 'follow',
    },
  })

  return response.data
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

/**
 * Wait for `ms` amount of milliseconds
 * @param {number} ms
 */
const waitFor = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Get tweets(even older than 7 days) using puppeteer
 * @param {string} tweetId
 */
const getTweetIdsFromThreadId = async (tweetId: string): Promise<string[]> => {
  const pageURL = `https://twitter.com/anyone/status/${tweetId}`

  // Modify this variable to control the size of viewport
  const factor = 0.2
  const height = Math.floor(2000 / factor)
  const width = Math.floor(1700 / factor)

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width,
      height,
    },
    args: [
      `--force-device-scale-factor=${factor}`,
      `--window-size=${width},${height}`,
    ],
  })

  const page = await browser.newPage()

  await page.goto(pageURL, {
    waitUntil: 'networkidle2',
    timeout: 5 * 60 * 1000,
  })

  await waitFor(4000)

  /** @type {string[]} */
  const tweetIds = (await page.evaluate(async () => {
    const ids: string[] = []

    // Find the first Show thread button and click it
    const showRepliesButton = Array.from(
      document.querySelectorAll('div[dir="auto"]')
    )
      .filter((node) => node.children[0] && node.children[0].tagName === 'SPAN')
      .find((node) => node.children[0].innerHTML === 'Show replies')

    if (showRepliesButton) {
      ;(showRepliesButton as HTMLElement).click()

      await waitFor(2000)
    }

    const timeNodes = Array.from(document.querySelectorAll('time'))

    for (const timeNode of timeNodes) {
      /** @type {HTMLAnchorElement | HTMLSpanElement} */
      const timeContainerAnchor = timeNode.parentElement
      if (!timeContainerAnchor) continue

      if (timeContainerAnchor?.tagName === 'SPAN') continue

      const id = (timeContainerAnchor as HTMLAnchorElement).href
        .split('/')
        .reverse()[0]

      ids.push(id)
    }

    return ids
  })) as string[]

  await browser.close()

  return [tweetId, ...tweetIds]
}

export class TwitterHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Twitter'
  }

  shouldPreHandle(url: string): boolean {
    return !!TWITTER_BEARER_TOKEN && TWITTER_URL_MATCH.test(url.toString())
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    const tweetId = tweetIdFromStatusUrl(url)
    if (!tweetId) {
      throw new Error('could not find tweet id in url')
    }
    let tweet = await getTweetById(tweetId)
    const conversationId = tweet.data.conversation_id
    if (conversationId !== tweetId) {
      // this is a reply, so we need to get the referenced tweet
      tweet = await getTweetById(conversationId)
    }

    const tweetData = tweet.data
    const authorId = tweetData.author_id
    const author = tweet.includes.users.filter((u) => (u.id = authorId))[0]
    // escape html entities in title
    const title = _.escape(titleForAuthor(author))
    const authorImage = author.profile_image_url.replace('_normal', '_400x400')
    const description = _.escape(tweetData.text)

    const tweets = [tweet]
    // we want to get the full thread
    const thread = await getTweetThread(conversationId, author.username)
    if (thread.meta.result_count > 0) {
      // tweets are in reverse chronological order in the thread
      for (const t of thread.data.reverse()) {
        // get the tweet media if it exists
        const media = thread.includes.media?.filter((m) =>
          t.attachments?.media_keys?.includes(m.media_key)
        )
        const tweet: Tweet = {
          data: t,
          includes: {
            users: thread.includes.users,
            media,
          },
        }
        tweets.push(tweet)
      }
    }

    let tweetsContent = ''
    for (const tweet of tweets) {
      const tweetData = tweet.data
      let text = tweetData.text
      if (tweetData.entities && tweetData.entities.urls) {
        for (const urlObj of tweetData.entities.urls) {
          text = text.replace(
            urlObj.url,
            `<a href="${urlObj.expanded_url}">${urlObj.display_url}</a>`
          )
        }
      }

      const includesHtml =
        tweet.includes.media
          ?.map((m) => {
            const linkUrl = m.type == 'photo' ? m.url : url
            const previewUrl = m.type == 'photo' ? m.url : m.preview_image_url
            return `<a class="media-link" href=${linkUrl}>
          <picture>
            <img class="tweet-img" src=${previewUrl} />
          </picture>
          </a>`
          })
          .join('\n') ?? ''

      tweetsContent += `
      <p>${text}</p>
      ${includesHtml}
    `
    }

    const tweetUrl = `
       — <a href="https://twitter.com/${author.username}">${
      author.username
    }</a> ${author.name} <a href="${url}">${formatTimestamp(
      tweetData.created_at
    )}</a>
    `

    const content = `
    <head>
      <meta property="og:image" content="${authorImage}" />
      <meta property="og:image:secure_url" content="${authorImage}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
    </head>
    <body>
      <div>
        ${tweetsContent}
        ${tweetUrl}
      </div>
    </body>`

    return { content, url, title }
  }
}
