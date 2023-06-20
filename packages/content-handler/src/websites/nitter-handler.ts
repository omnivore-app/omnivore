import _, { truncate } from 'lodash'
import { DateTime } from 'luxon'
import { Browser, BrowserContext } from 'puppeteer-core'
import { ContentHandler, PreHandleResult } from '../content-handler'

interface Tweet {
  id: string
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
      display_url: string
    }[]
    photos: string[]
    videos: string[]
  }
  createdAt: string
}

export class NitterHandler extends ContentHandler {
  // matches twitter.com and nitter.net urls
  URL_MATCH =
    /((twitter\.com)|(nitter\.net))\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?/
  ADDRESS = 'https://nitter.net'

  constructor() {
    super()
    this.name = 'Nitter'
  }

  async getTweets(browser: Browser, username: string, tweetId: string) {
    const url = `${this.ADDRESS}/${username}/status/${tweetId}`

    async function genTweets(): Promise<Tweet[]> {
      const waitFor = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms))

      let context: BrowserContext | undefined
      try {
        context = await browser.createIncognitoBrowserContext()
        const page = await context.newPage()

        // Modify this variable to control the size of viewport
        const deviceScaleFactor = 0.2
        const height = Math.floor(2000 / deviceScaleFactor)
        const width = Math.floor(1700 / deviceScaleFactor)
        await page.setViewport({ width, height, deviceScaleFactor })

        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000, // 30 seconds
        })

        const tweets = (await page.evaluate(
          async (username, id, url) => {
            function authorParser(header: Element) {
              const avatar = header
                .querySelector('.tweet-avatar img')
                ?.getAttribute('src')
              if (!avatar) {
                return null
              }
              const name = header
                .querySelector('.fullname')
                ?.getAttribute('title')
              if (!name) {
                return null
              }
              return {
                avatar,
                name,
              }
            }

            function attachmentParser(attachments: Element | null) {
              if (!attachments) return { photos: [], videos: [] }

              const photos = Array.from(
                attachments.querySelectorAll('img')
              ).map((i) => i.getAttribute('src') ?? '')
              const videos = Array.from(
                attachments.querySelectorAll('source')
              ).map((i) => i.getAttribute('src') ?? '')
              return {
                photos,
                videos,
              }
            }

            function parseTweet(tweet: Element): Tweet | null {
              const header = tweet.querySelector('.tweet-header')
              if (!header) {
                return null
              }
              const author = authorParser(header)
              if (!author) {
                return null
              }

              const body = tweet.querySelector('.tweet-body')
              if (!body) {
                return null
              }

              const createdAt = body
                .querySelector('.tweet-date a')
                ?.getAttribute('title')
              if (!createdAt) {
                return null
              }

              const content = body.querySelector('.tweet-content')
              if (!content) {
                return null
              }
              const text = content.textContent
              if (!text) {
                return null
              }
              const urls = Array.from(content.querySelectorAll('a')).map(
                (a) => ({
                  url: a.getAttribute('href') ?? '',
                  display_url: a.textContent ?? '',
                })
              )

              const attachments = body.querySelector('.attachments')
              const { photos, videos } = attachmentParser(attachments)

              return {
                id,
                author: {
                  username,
                  name: author.name,
                  profileImageUrl: author.avatar,
                },
                createdAt,
                text,
                url,
                entities: {
                  urls,
                  photos,
                  videos,
                },
              }
            }

            const tweets: Tweet[] = []
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
              if (item.classList.contains('show-more')) {
                // click the show more button
                ;(item as HTMLAnchorElement).click()
                await waitFor(2000)

                // get the new timeline items and add them to the list
                const newTimelineItems = Array.from(
                  mainThread.querySelectorAll('.timeline-item')
                )
                timelineItems.push(...newTimelineItems)
                continue
              }

              const tweet = parseTweet(item)
              tweet && tweets.push(tweet)
            }

            return tweets
          },
          username,
          tweetId,
          url
        )) as Tweet[]

        console.log('tweets', tweets)
        return tweets
      } catch (error) {
        console.error('Error getting tweets', error)

        return []
      } finally {
        if (context) {
          await context.close()
        }
      }
    }

    return genTweets()
  }

  tweetIdAndUsernameFromUrl = (url: string) => {
    const match = url.toString().match(this.URL_MATCH)
    return {
      tweetId: match?.[5],
      username: match?.[4],
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

  async preHandle(url: string, browser: Browser): Promise<PreHandleResult> {
    const { tweetId, username } = this.tweetIdAndUsernameFromUrl(url)
    if (!tweetId || !username) {
      throw new Error('could not find tweet id or username in url')
    }
    const tweets = await this.getTweets(browser, username, tweetId)

    const tweet = tweets[0]
    const author = tweet.author
    // escape html entities in title
    const title = this.titleForTweet(author, tweet.text)
    const escapedTitle = _.escape(title)
    const authorImage = `${this.ADDRESS}/${author.profileImageUrl.replace(
      '_normal',
      '_400x400'
    )}`
    const description = _.escape(tweet.text)

    let tweetsContent = ''
    for (const tweet of tweets) {
      let text = tweet.text
      if (tweet.entities && tweet.entities.urls) {
        for (const urlObj of tweet.entities.urls) {
          text = text.replace(
            urlObj.url,
            `<a href="${urlObj.url}">${urlObj.display_url}</a>`
          )
        }
      }

      const includesHtml =
        tweet.entities.photos
          ?.map(
            (url) =>
              `<a class="media-link" href=${this.ADDRESS}/${url}>
          <picture>
            <img class="tweet-img" src=${this.ADDRESS}/${url} />
          </picture>
          </a>`
          )
          .join('\n') ?? ''

      tweetsContent += `
      <p>${text}</p>
      ${includesHtml}
    `
    }

    const tweetUrl = `
       — <a href="https://twitter.com/${author.username}">${
      author.username
    }</a> <span itemscope itemtype="https://schema.org/Person" itemprop="author">${
      author.name
    }</span> <a href="${url}">${this.formatTimestamp(tweet.createdAt)}</a>
    `

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
    </head>
    <body>
      <div>
        ${tweetsContent}
        ${tweetUrl}
      </div>
    </body>
</html>`

    return { content, url, title }
  }
}
