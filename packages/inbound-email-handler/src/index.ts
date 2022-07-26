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

    try {
      const from = parsed.from
      const subject = parsed.subject
      const html = parsed.html
      const text = parsed.text

      const forwardedAddress = headers['x-forwarded-to']?.toString()
      const recipientAddress = forwardedAddress || parsed.to
      const postHeader = headers['list-post']?.toString()
      const unSubHeader = headers['list-unsubscribe']?.toString()

      try {
        // check if it is a forwarding confirmation email or newsletter
        const newsletterHandler = getNewsletterHandler(
          postHeader,
          from,
          unSubHeader
        )

        if (newsletterHandler) {
          console.log('handleNewsletter', from, recipientAddress)
          await newsletterHandler.handleNewsletter(
            recipientAddress,
            html,
            postHeader,
            subject,
            from,
            unSubHeader
          )
          return res.send('ok')
        }

        console.log('non-newsletter email from:', from, recipientAddress)

        if (isConfirmationEmail(from)) {
          console.log('handleConfirmation', from)
          await handleConfirmation(recipientAddress, subject)
          return res.send('ok')
        }

        if (pdfAttachment) {
          console.log('handle PDF attachment', from, recipientAddress)
          await handlePdfAttachment(
            recipientAddress,
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
            from: from,
            to: recipientAddress,
            subject: subject,
            html: html,
            text: text,
            unsubMailTo: unsubscribe.mailTo,
            unsubHttpUrl: unsubscribe.httpUrl,
          },
        })

        res.send('ok')
      } catch (error) {
        console.log(
          'error handling emails, will forward.',
          from,
          recipientAddress,
          subject
        )
        // queue error emails
        await pubsub.topic(NON_NEWSLETTER_EMAIL_TOPIC).publishMessage({
          json: {
            from: from,
            to: recipientAddress,
            subject: subject,
            html: html,
            text: text,
          },
        })
      }
    } catch (e) {
      console.log(e)
      res.send(e)
    }
  }
)
