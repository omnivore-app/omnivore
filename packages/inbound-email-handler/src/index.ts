/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Sentry from '@sentry/serverless'
import parseHeaders from 'parse-headers'
import * as multipart from 'parse-multipart-data'
import {
  handleConfirmation,
  isConfirmationEmail,
  NewsletterHandler,
  parseUnsubscribe,
} from './newsletter'
import { PubSub } from '@google-cloud/pubsub'
import { handlePdfAttachment } from './pdf'
import { SubstackHandler } from './substack-handler'
import { AxiosHandler } from './axios-handler'
import { BloombergHandler } from './bloomberg-handler'
import { GolangHandler } from './golang-handler'
import { MorningBrewHandler } from './morning-brew-handler'

const NON_NEWSLETTER_EMAIL_TOPIC = 'nonNewsletterEmailReceived'
const pubsub = new PubSub()
const NEWSLETTER_HANDLERS = [
  new SubstackHandler(),
  new AxiosHandler(),
  new BloombergHandler(),
  new GolangHandler(),
  new MorningBrewHandler(),
]

export const getNewsletterHandler = (
  postHeader: string,
  from: string,
  unSubHeader: string
): NewsletterHandler | undefined => {
  return NEWSLETTER_HANDLERS.find((h) => {
    return h.isNewsletter(postHeader, from, unSubHeader)
  })
}

export const inboundEmailHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    try {
      const parts = multipart.parse(req.body, 'xYzZY')
      const parsed: Record<string, string> = {}

      let pdfAttachment: Buffer | undefined
      let pdfAttachmentName: string | undefined

      for (const part of parts) {
        const { name, data, type, filename } = part
        if (name && data) {
          parsed[name] = data.toString()
        } else if (type === 'application/pdf' && data) {
          pdfAttachment = data
          pdfAttachmentName = filename
        } else {
          console.log('no data or name for ', part)
        }
      }

      const headers = parseHeaders(parsed.headers)
      console.log('parsed: ', parsed)
      console.log('headers: ', headers)

      // original sender email address
      const from = headers['from'].toString()
      const subject = headers['subject']?.toString()
      const html = parsed['html']
      const text = parsed['text']

      // headers added when forwarding email by some rules in Gmail
      // e.g. 'X-Forwarded-To: recipient@omnivore.app'
      const forwardedTo = headers['x-forwarded-to']?.toString().split(',')[0]
      // x-forwarded-for is a space separated list of email address
      // the first one is the forwarding email sender and the last one is the recipient
      // e.g. 'X-Forwarded-For: sender@omnivore.app recipient@omnivore.app'
      const forwardedFrom = headers['x-forwarded-for']?.toString().split(' ')[0]

      // if an email is forwarded to the inbox, the to is the forwarding email recipient
      const to = forwardedTo || headers['to'].toString()
      const postHeader = headers['list-post']?.toString()
      const unSubHeader = headers['list-unsubscribe']?.toString()

      try {
        // check if it is a confirmation email or forwarding newsletter
        const newsletterHandler = getNewsletterHandler(
          postHeader,
          from,
          unSubHeader
        )

        if (newsletterHandler) {
          console.log('handleNewsletter', from, to)
          await newsletterHandler.handleNewsletter(
            to,
            html,
            postHeader,
            subject,
            from,
            unSubHeader
          )
          return res.send('ok')
        }

        console.log('non-newsletter email from', from, 'to', to)

        if (isConfirmationEmail(from)) {
          console.log('handleConfirmation', from)
          await handleConfirmation(to, subject)
          return res.send('ok')
        }

        if (pdfAttachment) {
          console.log('handle PDF attachment', from, to)
          await handlePdfAttachment(
            to,
            pdfAttachmentName,
            pdfAttachment,
            subject
          )
          return res.send('ok')
        }

        const unsubscribe = parseUnsubscribe(unSubHeader)
        // queue non-newsletter emails
        await pubsub.topic(NON_NEWSLETTER_EMAIL_TOPIC).publishMessage({
          json: {
            from,
            to,
            subject,
            html,
            text,
            unsubMailTo: unsubscribe.mailTo,
            unsubHttpUrl: unsubscribe.httpUrl,
            forwardedFrom,
          },
        })

        res.send('ok')
      } catch (error) {
        console.log('error handling emails, will forward.', from, to, subject)
        // queue error emails
        await pubsub.topic(NON_NEWSLETTER_EMAIL_TOPIC).publishMessage({
          json: {
            from,
            to,
            subject,
            html,
            text,
            forwardedFrom,
          },
        })
      }
    } catch (e) {
      console.log(e)
      res.send(e)
    }
  }
)
