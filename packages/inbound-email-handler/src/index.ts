/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RedisDataSource } from '@omnivore/utils'
import * as Sentry from '@sentry/serverless'
import 'dotenv/config'
import parseHeaders from 'parse-headers'
import * as multipart from 'parse-multipart-data'
import rfc2047 from 'rfc2047'
import { Attachment, handleAttachments, isAttachment } from './attachment'
import { EmailJobType, queueEmailJob } from './job'
import {
  handleGoogleConfirmationEmail,
  isGoogleConfirmationEmail,
  isSubscriptionConfirmationEmail,
  parseUnsubscribe,
} from './newsletter'

interface Envelope {
  to: string[]
  from: string
}

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

export const parsedTo = (parsed: Record<string, string>): string => {
  // envelope to contains the real recipient email address
  try {
    const envelope = JSON.parse(parsed.envelope) as Envelope
    return envelope.to[0]
  } catch (err) {
    return parsed.to
  }
}

export const inboundEmailHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    try {
      const parts = multipart.parse(req.body, 'xYzZY')
      const parsed: Record<string, string> = {}
      const attachments: Attachment[] = []

      for (const part of parts) {
        const { name, data, type, filename } = part
        if (name && data) {
          // decode data from rfc2047 encoded
          parsed[name] = rfc2047.decode(data.toString())
        } else if (isAttachment(type, data)) {
          attachments.push({ data, contentType: type, filename })
        } else {
          console.log('no data or name for ', part)
        }
      }

      const headers = parseHeaders(parsed.headers)

      // original sender email address
      const from = parsed['from']
      const replyTo = parsed['reply-to']
      const subject = parsed['subject']
      const html = parsed['html']
      const text = parsed['text']
      // if an email is forwarded to the inbox, the to is the forwarding email recipient
      const to = parsedTo(parsed)
      // x-forwarded-for is a space separated list of email address
      // the first one is the forwarding email sender and the last one is the recipient
      // e.g. 'X-Forwarded-For: sender@omnivore.app recipient@omnivore.app'
      const forwardedFrom = headers['x-forwarded-for']?.toString().split(' ')[0]
      const unSubHeader = headers['list-unsubscribe']?.toString()
      const unsubscribe = unSubHeader
        ? parseUnsubscribe(unSubHeader)
        : undefined

      const redisDataSource = new RedisDataSource({
        cache: {
          url: process.env.REDIS_URL,
          cert: process.env.REDIS_CERT,
        },
        mq: {
          url: process.env.MQ_REDIS_URL,
          cert: process.env.MQ_REDIS_CERT,
        },
      })

      try {
        // check if it is a subscription or google confirmation email
        const isGoogleConfirmation = isGoogleConfirmationEmail(from, subject)
        if (isGoogleConfirmation || isSubscriptionConfirmationEmail(subject)) {
          console.log('handleConfirmation', from, subject)
          // we need to parse the confirmation code from the email
          if (isGoogleConfirmation) {
            await handleGoogleConfirmationEmail(
              redisDataSource,
              from,
              to,
              subject
            )
          }

          // forward emails
          await queueEmailJob(redisDataSource, EmailJobType.ForwardEmail, {
            from,
            to,
            subject,
            html,
            text,
            headers,
            forwardedFrom,
            replyTo,
          })
          return res.send('ok')
        }
        if (attachments.length > 0) {
          console.log('handle attachments', from, to, subject)
          // save the attachments as articles
          await handleAttachments(
            redisDataSource,
            from,
            to,
            subject,
            attachments
          )
          return res.send('ok')
        }

        // all other emails are considered newsletters
        // queue newsletter emails
        await queueEmailJob(redisDataSource, EmailJobType.SaveNewsletter, {
          from,
          to,
          subject,
          html,
          text,
          headers,
          unsubMailTo: unsubscribe?.mailTo,
          unsubHttpUrl: unsubscribe?.httpUrl,
          forwardedFrom,
          replyTo,
        })

        res.send('newsletter received')
      } catch (error) {
        console.error(
          'error handling emails, will forward.',
          from,
          to,
          subject,
          error
        )

        // fallback to forward the email
        await queueEmailJob(redisDataSource, EmailJobType.ForwardEmail, {
          from,
          to,
          subject,
          html,
          text,
          headers,
          forwardedFrom,
          replyTo,
        })

        return res.send('ok')
      } finally {
        await redisDataSource.shutdown()
      }
    } catch (e) {
      console.error(e)
      res.send(e)
    }
  }
)
