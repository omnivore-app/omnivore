/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PubSub } from '@google-cloud/pubsub'
import { handleNewsletter } from '@omnivore/content-handler'
import { generateUniqueUrl } from '@omnivore/content-handler/build/src/content-handler'
import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import * as jwt from 'jsonwebtoken'
import parseHeaders from 'parse-headers'
import * as multipart from 'parse-multipart-data'
import { promisify } from 'util'
import { Attachment, handleAttachments, isAttachment } from './attachment'
import {
  handleGoogleConfirmationEmail,
  isGoogleConfirmationEmail,
  isSubscriptionConfirmationEmail,
  parseAuthor,
  parseUnsubscribe,
} from './newsletter'

interface SaveReceivedEmailResponse {
  id: string
}

interface Envelope {
  to: string[]
  from: string
}

const signToken = promisify(jwt.sign)

const NEWSLETTER_EMAIL_RECEIVED_TOPIC = 'newsletterEmailReceived'
const NON_NEWSLETTER_EMAIL_TOPIC = 'nonNewsletterEmailReceived'
const pubsub = new PubSub()

export const publishMessage = async (
  topic: string,
  message: any
): Promise<string | undefined> => {
  return pubsub
    .topic(topic)
    .publishMessage({ json: message })
    .catch((err) => {
      console.log('error publishing message:', err)
      return undefined
    })
}

const saveReceivedEmail = async (
  email: string,
  data: any
): Promise<SaveReceivedEmailResponse> => {
  if (process.env.JWT_SECRET === undefined) {
    throw new Error('JWT_SECRET is not defined')
  }
  const auth = await signToken(email, process.env.JWT_SECRET)

  if (process.env.INTERNAL_SVC_ENDPOINT === undefined) {
    throw new Error('REST_BACKEND_ENDPOINT is not defined')
  }

  const response = await axios.post(
    `${process.env.INTERNAL_SVC_ENDPOINT}svc/pubsub/emails/save`,
    data,
    {
      headers: {
        Authorization: `${auth as string}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return response.data as SaveReceivedEmailResponse
}

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
          parsed[name] = data.toString()
        } else if (isAttachment(type, data)) {
          attachments.push({ data, contentType: type, filename })
        } else {
          console.log('no data or name for ', part)
        }
      }

      const headers = parseHeaders(parsed.headers)
      console.log('parsed: ', parsed)
      console.log('headers: ', headers)

      // original sender email address
      const from = parsed['from']
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
      const unsubscribe = parseUnsubscribe(unSubHeader)

      const { id: receivedEmailId } = await saveReceivedEmail(to, {
        from,
        to,
        subject,
        html,
        text,
      })

      try {
        // check if it is a subscription or google confirmation email
        const isGoogleConfirmation = isGoogleConfirmationEmail(from, subject)
        if (isGoogleConfirmation || isSubscriptionConfirmationEmail(subject)) {
          console.debug('handleConfirmation', from, subject)
          // we need to parse the confirmation code from the email
          isGoogleConfirmation &&
            (await handleGoogleConfirmationEmail(to, subject))
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
              receivedEmailId,
            },
          })
          return res.send('ok')
        }
        if (attachments.length > 0) {
          console.debug('handle attachments', from, to, subject)
          // save the attachments as articles
          await handleAttachments(to, subject, attachments, receivedEmailId)
          return res.send('ok')
        }
        // all other emails are considered newsletters
        const newsletterMessage = await handleNewsletter({
          from,
          to,
          subject,
          html,
          headers,
        })
        // queue newsletter emails
        await pubsub.topic(NEWSLETTER_EMAIL_RECEIVED_TOPIC).publishMessage({
          json: {
            email: to,
            content: html,
            url: generateUniqueUrl(),
            title: subject,
            author: parseAuthor(from),
            text,
            unsubMailTo: unsubscribe.mailTo,
            unsubHttpUrl: unsubscribe.httpUrl,
            forwardedFrom,
            receivedEmailId,
            ...newsletterMessage,
          },
        })
        res.send('newsletter received')
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
            receivedEmailId,
          },
        })
        res.send('ok')
      }
    } catch (e) {
      console.log(e)
      res.send(e)
    }
  }
)
