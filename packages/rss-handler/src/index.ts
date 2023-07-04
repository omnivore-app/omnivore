import * as Sentry from '@sentry/serverless'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import Parser from 'rss-parser'

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const parser = new Parser()

export const rssHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    try {
      const feed = await parser.parseURL('https://www.reddit.com/.rss')
      console.log(feed.title)

      feed.items.forEach((item) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`${item.title}:${item.link}`)
      })

      res.send('ok')
    } catch (e) {
      console.error('Error while parsing RSS feed', e)
      res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  }
)
