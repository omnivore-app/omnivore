import axios from 'axios'
import { parseHTML } from 'linkedom'
import _, { truncate } from 'lodash'
import { DateTime } from 'luxon'
import { ContentHandler, PreHandleResult } from '../content-handler'
import { createRedisClient, RedisClient } from '../redis'

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
    { value: 'https://nitter.moomoo.me', score: 0 },
    { value: 'https://nitter.net', score: 1 }, // the official instance
    { value: 'https://nitter.lacontrevoie.fr', score: 2 },
    { value: 'https://nitter.kavin.rocks', score: 3 },
    { value: 'https://notabird.site', score: 4 },
    { value: 'https://singapore.unofficialbird.com', score: 5 },
    { value: 'https://nitter.fly.dev', score: 6 },
  ]
  REDIS_KEY = 'nitter-instances'

  private instance: string

  constructor() {
    super()
    this.name = 'Nitter'
    this.instance = ''
  }

  async getInstances(redisClient: RedisClient) {
    // get instances by score in ascending order
    const instances = await redisClient.zRange(this.REDIS_KEY, '-inf', '+inf', {
      BY: 'SCORE',
    })
    console.debug('instances', instances)

    // if no instance is found, save the default instances
    if (instances.length === 0) {
      const result = await redisClient.zAdd(this.REDIS_KEY, this.INSTANCES, {
        NX: true, // only add if the key does not exist
      })
      console.debug('add instances', result)

      // expire the key after 1 day
      const exp = await redisClient.expire(this.REDIS_KEY, 60 * 60 * 24)
      console.debug('instances expire in 1 day', exp)

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
        console.error('no header found', tweet)
        return null
      }
      const author = authorParser(header)

      const body = tweet.querySelector('.tweet-body')
      if (!body) {
        console.error('no body found', tweet)
        return null
      }

      const tweetDateElement = body.querySelector('.tweet-date a')
      if (!tweetDateElement) {
        console.error('no tweet date found', tweet)
        return null
      }
      const createdAt = dateParser(tweetDateElement)
      const url = urlParser(tweetDateElement)

      const content = body.querySelector('.tweet-content')
      if (!content) {
        console.error('no content found', tweet)
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

    const redisClient = await createRedisClient(
      process.env.REDIS_URL,
      process.env.REDIS_CERT
    )

    try {
      const tweets: Tweet[] = []
      const option = {
        timeout: 20000, // 20 seconds
      }
      let html = ''
      // get instances from redis
      const instances = await this.getInstances(redisClient)
      for (const instance of instances) {
        try {
          const url = `${instance}/${username}/status/${tweetId}`
          const startTime = Date.now()
          const response = await axios.get(url, option)
          const latency = Math.floor(Date.now() - startTime)
          console.debug('latency', latency)

          html = response.data as string
          this.instance = instance

          await this.incrementInstanceScore(redisClient, instance, latency)
          break
        } catch (error) {
          await this.incrementInstanceScore(
            redisClient,
            instance,
            option.timeout
          )

          if (axios.isAxiosError(error)) {
            console.info(`Error getting tweets from ${instance}`, error.message)
          } else {
            console.info(`Error getting tweets from ${instance}`, error)
          }
        }
      }
      if (!this.instance || !html) {
        console.error('no instance or html found')
        return []
      }

      const document = parseHTML(html).document

      // get the main thread including tweets and threads
      const mainThread = document.querySelector('.main-thread')
      if (!mainThread) {
        console.error('no main thread found')
        return []
      }
      const timelineItems = Array.from(
        mainThread.querySelectorAll('.timeline-item')
      )
      if (timelineItems.length === 0) {
        console.error('no timeline items found')
        return []
      }
      for (let i = 0; i < timelineItems.length; i++) {
        const item = timelineItems[i]
        const classList = item.classList
        // skip unavailable tweets and earlier replies
        if (
          classList.contains('unavailable') ||
          classList.contains('earlier-replies')
        ) {
          console.info('skip unavailable tweets and earlier replies')
          continue
        }
        // if there are more replies, get them
        if (classList.contains('more-replies')) {
          const newUrl = item.querySelector('a')?.getAttribute('href')
          if (!newUrl) {
            console.error('no new url', newUrl)
            break
          }

          let html = ''
          try {
            // go to new url and wait for it to load
            const response = await axios.get(
              `${this.instance}${newUrl}`,
              option
            )

            html = response.data as string
          } catch (error) {
            console.error('Error getting tweets', error)
            break
          }

          const document = parseHTML(html).document
          const nextThread = document.querySelector('.main-thread .after-tweet')
          if (!nextThread) {
            console.error('no next thread found')
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
        if (
          tweet &&
          tweet.author.username.toLowerCase() === username.toLowerCase()
        ) {
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
    const description = _.escape(tweet.text) || escapedTitle
    const imageDomain =
      domain.toLowerCase() === 'twitter.com'
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

      tweetsContent += `<p class="_omnivore_tweet_content">${text}</p>${includesHtml}`
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
            <meta property="twitter:description" content="${description}" />
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
