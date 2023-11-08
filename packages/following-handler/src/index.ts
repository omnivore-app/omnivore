import * as Sentry from '@sentry/serverless'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

export const followingHandler = Sentry.GCPFunction.wrapHttpFunction(
  (req, res) => {
    if (req.query.token !== process.env.PUBSUB_VERIFICATION_TOKEN) {
      console.log('query does not include valid token')
      return res.sendStatus(403)
    }

    res.send('ok')
  }
)
