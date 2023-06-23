import axios from 'axios'
import { parseHTML } from 'linkedom'
import _, { truncate } from 'lodash'
import { DateTime } from 'luxon'
import { createClient } from 'redis'
import { ContentHandler, PreHandleResult } from '../content-handler'
import { createRedisClient } from '../redis'

// explicitly create the return type of RedisClient
type RedisClient = ReturnType<typeof createClient>

interface Tweet {
  url: string
  author: {
    username: string
    name: string
    profileImageUrl: string
  }
  text: string
  entities: {
    urls: {
      url: string
      displayUrl: string
    }[]
  }
  attachments: {
    type: string
    url: string
    previewUrl: string
  }[]
  createdAt: string
}

export class NitterHandler extends ContentHandler {
  // matches twitter.com and nitter.net urls
  URL_MATCH =
    /((twitter\.com)|(nitter\.net))\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?/
  INSTANCES = [
    { value: 'https://nitter.1d4.us', score: 7 },
    { value: 'https://nitter.net', score: 6 }, // the official instance
    { value: 'https://nitter.lacontrevoie.fr', score: 5 },
    { value: 'https://nitter.kavin.rocks', score: 4 },
    { value: 'https://nitter.it', score: 3 },
    { value: 'https://singapore.unofficialbird.com', score: 2 },
    { value: 'nitter.fly.dev', score: 1 },
  ]
  REDIS_KEY = 'nitter-instances'

  private instance: string

  constructor() {
    super()
    this.name = 'Nitter'
    this.instance = ''
  }

  async getInstances(redisClient: RedisClient) {
    const instances = await redisClient.zRangeByScore(
      this.REDIS_KEY,
      '-inf',
      '+inf'
    )

    // if no instance is found, save the default instances
    if (instances.length === 0) {
      await redisClient.zAdd(this.REDIS_KEY, this.INSTANCES)
      return this.INSTANCES.map((i) => i.value)
    }

    return instances
  }

  async incrementInstanceScore(
    redisClient: RedisClient,
    instance: string,
    score = 1
  ) {
    await redisClient.zIncrBy(this.REDIS_KEY, score, instance)
  }

  async getTweets(username: string, tweetId: string) {
    function authorParser(header: Element) {
      const profileImageUrl =
        header.querySelector('.tweet-avatar img')?.getAttribute('src') ?? ''
      const name =
        header.querySelector('.fullname')?.getAttribute('title') ?? ''
      const username =
        header.querySelector('.username')?.getAttribute('title') ?? ''

      return {
        profileImageUrl,
        name,
        username: username.replace('@', ''), // remove @ from username
      }
    }

    function dateParser(date: Element) {
      const validDateTime =
        date.getAttribute('title')?.replace(' · ', ' ') ?? Date.now()

      return new Date(validDateTime).toISOString()
    }

    function urlParser(date: Element) {
      return date.getAttribute('href') ?? ''
    }

    function attachmentParser(attachments: Element | null) {
      if (!attachments) return []

      const photos = Array.from(attachments.querySelectorAll('img')).map(
        (i) => ({
          url: i.getAttribute('src') ?? '',
          type: 'photo',
          previewUrl: i.getAttribute('src') ?? '',
        })
      )
      const videos = Array.from(attachments.querySelectorAll('video')).map(
        (i) => ({
          url: i.getAttribute('data-url') ?? '',
          type: 'video',
          previewUrl: i.getAttribute('poster') ?? '',
        })
      )

      return [...photos, ...videos]
    }

    function parseTweet(tweet: Element): Tweet | null {
      const header = tweet.querySelector('.tweet-header')
      if (!header) {
        return null
      }
      const author = authorParser(header)

      const body = tweet.querySelector('.tweet-body')
      if (!body) {
        return null
      }

      const tweetDateElement = body.querySelector('.tweet-date a')
      if (!tweetDateElement) {
        return null
      }
      const createdAt = dateParser(tweetDateElement)
      const url = urlParser(tweetDateElement)

      const content = body.querySelector('.tweet-content')
      if (!content) {
        return null
      }
      const text = content.textContent ?? ''
      const urls = Array.from(content.querySelectorAll('a')).map((a) => ({
        url: a.getAttribute('href') ?? '',
        displayUrl: a.textContent ?? '',
      }))

      const attachments = attachmentParser(body.querySelector('.attachments'))

      return {
        author,
        createdAt,
        text,
        url,
        entities: {
          urls,
        },
        attachments,
      }
    }

    const redisClient = await createRedisClient()

    try {
      const tweets: Tweet[] = []
      const option = {
        timeout: 20000, // 20 seconds
      }
      let html: any
      // get instances from redis
      const instances = await this.getInstances(redisClient)
      for (const instance of instances) {
        try {
          const url = `${instance}/${username}/status/${tweetId}`
          const startTime = Date.now()
          const response = await axios.get(url, option)
          const latency = Date.now() - startTime

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          html = response.data
          this.instance = instance

          await this.incrementInstanceScore(
            redisClient,
            instance,
            -latency / 1000
          )
          break
        } catch (error) {
          await this.incrementInstanceScore(redisClient, instance, -20000)

          if (axios.isAxiosError(error)) {
            console.info(`Error getting tweets from ${instance}`, error.message)
          } else {
            console.info(`Error getting tweets from ${instance}`, error)
          }
        }
      }
      if (!this.instance || !html) {
        return []
      }

      const document = parseHTML(html).document

      // get the main thread including tweets and threads
      const mainThread = document.querySelector('.main-thread')
      if (!mainThread) {
        return []
      }
      const timelineItems = Array.from(
        mainThread.querySelectorAll('.timeline-item')
      )
      for (let i = 0; i < timelineItems.length; i++) {
        const item = timelineItems[i]
        if (item.classList.contains('more-replies')) {
          const newUrl = item.querySelector('a')?.getAttribute('href')
          if (!newUrl) {
            break
          }

          // go to new url and wait for it to load
          const response = await axios.get(`${this.instance}${newUrl}`, option)

          const document = parseHTML(response.data).document
          const nextThread = document.querySelector('.main-thread .after-tweet')
          if (!nextThread) {
            break
          }

          // get the new timeline items and add them to the list
          const newTimelineItems = Array.from(
            nextThread.querySelectorAll('.timeline-item')
          )

          timelineItems.push(...newTimelineItems)
          continue
        }

        const tweet = parseTweet(item)
        // filter out replies
        if (tweet && tweet.author.username === username) {
          tweets.push(tweet)
        }
      }

      return tweets
    } catch (error) {
      console.error('Error getting tweets', error)

      return []
    } finally {
      await redisClient?.quit()
    }
  }

  parseTweetUrl = (url: string) => {
    const match = url.match(this.URL_MATCH)
    return {
      domain: match?.[1],
      username: match?.[4],
      tweetId: match?.[5],
    }
  }

  titleForTweet = (author: { name: string }, text: string) => {
    return `${author.name} on Twitter: ${truncate(text.replace(/http\S+/, ''), {
      length: 100,
    })}`
  }

  formatTimestamp = (timestamp: string) => {
    return DateTime.fromJSDate(new Date(timestamp)).toLocaleString(
      DateTime.DATETIME_FULL
    )
  }

  shouldPreHandle(url: string): boolean {
    return this.URL_MATCH.test(url.toString())
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    const { tweetId, username, domain } = this.parseTweetUrl(url)
    if (!tweetId || !username || !domain) {
      throw new Error('could not parse tweet url')
    }
    const tweets = await this.getTweets(username, tweetId)
    if (tweets.length === 0) {
      throw new Error('could not get tweets')
    }

    const tweet = tweets[0]
    const author = tweet.author
    // escape html entities in title
    const title = this.titleForTweet(author, tweet.text)
    const escapedTitle = _.escape(title)
    const authorImage = `${this.instance}${author.profileImageUrl.replace(
      '_normal',
      '_400x400'
    )}`
    const description = _.escape(tweet.text)
    const imageDomain =
      domain === 'twitter.com'
        ? 'https://pbs.twimg.com'
        : 'https://nitter.net/pic'

    let tweetsContent = ''
    for (const tweet of tweets) {
      let text = tweet.text
      for (const urlObj of tweet.entities.urls) {
        text = text.replace(
          urlObj.displayUrl,
          `<a href="${urlObj.url}">${urlObj.displayUrl}</a>`
        )
      }

      const includesHtml = tweet.attachments
        .map(
          (attachment) =>
            `<a class="media-link" href=${imageDomain}${decodeURIComponent(
              attachment.url
            ).replace('/pic', '')}>
          <picture>
            <img class="tweet-img" src=${imageDomain}${decodeURIComponent(
              attachment.previewUrl
            ).replace('/pic', '')} />
          </picture>
          </a>`
        )
        .join('\n')

      tweetsContent += `
      <p>${text}</p>
      ${includesHtml}
    `
    }

    const tweetUrl = `
       — <a href="https://${domain}/${author.username}">${
      author.username
    }</a> <span itemscope itemtype="https://schema.org/Person" itemprop="author">${
      author.name
    }</span> <a href="${url}">${this.formatTimestamp(tweet.createdAt)}</a>`

    const content = `
      <html>
          <head>
            <meta property="og:image" content="${authorImage}" />
            <meta property="og:image:secure_url" content="${authorImage}" />
            <meta property="og:title" content="${escapedTitle}" />
            <meta property="og:description" content="${description}" />
            <meta property="article:published_time" content="${tweet.createdAt}" />
            <meta property="og:site_name" content="Twitter" />
            <meta property="og:type" content="tweet" />
            <meta property="dc:creator" content="${author.name}" />
          </head>
          <body>
            <div class="_omnivore_twitter">
              ${tweetsContent}
              ${tweetUrl}
            </div>
          </body>
      </html>`

    return { content, url, title }
  }
}
