/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Sentry from '@sentry/serverless'
import parseHeaders from 'parse-headers'
import * as multipart from 'parse-multipart-data'
import {
  handleConfirmation,
  handleNewsletter,
  isConfirmationEmail,
  isNewsletter,
} from './newsletter'
import { PubSub } from '@google-cloud/pubsub'
import { handlePdfAttachment } from './pdf'

const NON_NEWSLETTER_EMAIL_TOPIC = 'nonNewsletterEmailReceived'
const pubsub = new PubSub()

export const inboundEmailHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    const parts = multipart.parse(req.body, 'xYzZY')
    const parsed: Record<string, string> = {}

    for (const part of parts) {
      const { name, data, type, filename } = part
      if (name && data) {
        parsed[name] = data.toString()
      } else if (type === 'application/pdf' && data) {
        parsed['pdf-attachment-data'] = data.toString()
        parsed['pdf-attachment-filename'] = filename
          ? filename
          : 'attachment.pdf'
      } else {
        console.log('no data or name for ', part)
      }
    }

    const headers = parseHeaders(parsed.headers)
    console.log('parsed: ', parsed)
    console.log('headers: ', headers)

    try {
      const from = parsed.from.toString()
      const subject = parsed.subject
      const html = parsed.html
      const text = parsed.text

      const forwardedAddress = headers['x-forwarded-to']
      const recipientAddress = forwardedAddress
        ? forwardedAddress.toString()
        : parsed.to
      const rawUrl = headers['list-post'] ? headers['list-post'].toString() : ''

      // check if it is a forwarding confirmation email or newsletter
      if (isNewsletter(rawUrl, from)) {
        try {
          console.log('handleNewsletter', from, recipientAddress)
          await handleNewsletter(recipientAddress, html, rawUrl, subject, from)
        } catch (error) {
          console.log(
            'error handling newsletter, will forward.',
            from,
            recipientAddress,
            subject
          )
          // queue non-newsletter emails
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
      } else {
        console.log('non-newsletter email from:', from, recipientAddress)

        if (isConfirmationEmail(from)) {
          console.log('handleConfirmation', from, recipientAddress)
          await handleConfirmation(recipientAddress, subject)
        } else if (parsed['pdf-attachment-filename']) {
          console.log('handle PDF attachment', from, recipientAddress)
          await handlePdfAttachment(
            recipientAddress,
            parsed['pdf-attachment-filename'],
            parsed['pdf-attachment-data']
          )
        }

        // queue non-newsletter emails
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

      res.send('ok')
    } catch (e) {
      console.log(e)
      res.send(e)
    }
  }
)
