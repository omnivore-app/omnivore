import express from 'express'
import { analytics } from '../../utils/analytics'
import { initModels } from '../../server'
import { kx } from '../../datalayer/knex_config'
import { setClaims } from '../../datalayer/helpers'
import { sendEmail } from '../../utils/sendEmail'
import { ArticleData } from '../../datalayer/article/model'
import { env, homePageURL } from '../../env'
import { ReminderData } from '../../datalayer/reminders/model'
import { UserArticleData } from '../../datalayer/links/model'
import { sendMulticastPushNotifications } from '../../utils/sendNotification'
import { getDeviceTokensByUserId } from '../../services/user_device_tokens'
import { MulticastMessage } from 'firebase-admin/messaging'
import { UserDeviceToken } from '../../entity/user_device_tokens'
import { ContentReader } from '../../generated/graphql'

type Article = {
  title: string
  url: string
  byline: string | undefined | null
  description: string | undefined | null
  image: string | undefined | null
}

export function remindersServiceRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/trigger', async (req, res) => {
    console.log('reminders/trigger')

    const { userId, scheduleTime } = req.body as {
      userId?: string
      scheduleTime?: number
    }

    analytics.track({
      userId: userId,
      event: 'reminder_triggered',
      properties: {
        env: env.server.apiEnv,
      },
    })

    if (!userId || !scheduleTime) {
      res.status(400).send('Bad Request')
      return
    }

    try {
      const remindAt = new Date(scheduleTime)

      // get all reminders by userid and scheduled time
      const models = initModels(kx, false)

      const user = await models.user.get(userId)
      if (!user || !user.email) {
        console.log('user not found', userId)
        res.status(404).send('Not Found')
        return
      }

      const reminders = await models.reminder.getByUserAndRemindAt(
        userId,
        remindAt
      )

      if (!reminders) {
        console.log('reminders not found', userId, scheduleTime)
        res.status(404).send('Not Found')
        return
      }

      console.log('reminders:', reminders)

      const [articlesToNotify, linkIdsToUnarchive] =
        getArticlesToNotifyAndUnarchive(reminders, user.profile.username)

      // If none of the fetch reminders have sendNotification
      // set to true, then we should not send an email or notification
      if (articlesToNotify.length > 0) {
        if (!process.env.SENDGRID_REMINDER_TEMPLATE_ID) {
          console.log('Sendgrid reminder email template_id not set')
          res.status(400).send('Template Id Not Found')
          return
        }

        const dynamicTemplateData = {
          subject: `Omnivore Reminder Service`,
          title: `Hey ${user.name}, you have ${articlesToNotify.length} article(s) to read on Omnivore`,
          articles: articlesToNotify,
        }

        console.log('dynamic template data:', dynamicTemplateData)

        await sendEmail({
          from: 'msgs@omnivore.app',
          dynamicTemplateData: dynamicTemplateData,
          templateId: process.env.SENDGRID_REMINDER_TEMPLATE_ID,
          to: user.email,
        })

        // send push notifications
        const deviceTokens = await getDeviceTokensByUserId(userId)
        if (deviceTokens && deviceTokens.length > 0) {
          const message = messageForLinks(reminders, deviceTokens)
          await sendMulticastPushNotifications(userId, message, 'reminder')
        }

        if (!deviceTokens) {
          console.log('Device tokens not set:', userId)
          res.status(200).send('Device token Not Found')
          return
        }
      }

      // db update
      await kx.transaction(async (tx) => {
        await setClaims(tx, userId)
        // Unarchive all the links and updated saved_at to now, so they
        // appear at the top of the user's list.
        await models.userArticle.updateByIds(
          linkIdsToUnarchive,
          {
            savedAt: new Date(),
            archivedAt: null,
          },
          tx
        )

        await models.reminder.setRemindersComplete(userId, remindAt, tx)
      })

      res.status(200).send('Reminders triggered')
    } catch (e) {
      console.log(e)
      res.status(500).send(e)
    }
  })

  return router
}

const getArticlesToNotifyAndUnarchive = (
  reminders: (ReminderData & ArticleData & UserArticleData)[],
  username: string
): [articles: Article[], linkIds: string[]] => {
  const linkIds: string[] = []
  const articles: Article[] = []
  reminders.forEach((reminder) => {
    linkIds.push(reminder.id)

    reminder.sendNotification &&
      articles.push({
        url: `${homePageURL()}/${username}/${reminder.slug}`,
        title: reminder.title,
        description: reminder.description,
        byline: reminder.author,
        image: reminder.image,
      })
  })

  return [articles, linkIds]
}

const messageForLinks = (
  reminders: (ReminderData & ArticleData & UserArticleData)[],
  deviceTokens: UserDeviceToken[]
): MulticastMessage => {
  const links = reminders.filter((reminder) => reminder.sendNotification)

  // If the user only has one reminder triggered we send a deep
  // link to that link.
  if (links.length === 1) {
    const link = links[0]
    let title = 'Snoozed: You have one snoozed article to read on Omnivore'

    if (link.author) {
      title = `'Snoozed: From ${link.author}`
    }

    const pushData = !link
      ? undefined
      : {
          link: Buffer.from(
            JSON.stringify({
              id: link.articleId,
              url: link.url,
              slug: link.slug,
              title: link.title,
              image: link.image,
              author: link.author,
              isArchived: false,
              contentReader: ContentReader.Web,
              readingProgressPercent: 0,
              readingProgressAnchorIndex: 0,
            })
          ).toString('base64'),
        }

    return {
      notification: {
        title: title,
        body: link.title,
        imageUrl: link.image || undefined,
      },
      data: pushData,
      tokens: deviceTokens.map((token) => token.token),
    }
  }

  const title = `Snoozed: You have ${links.length} articles to read.`
  let description = 'Read them now.'
  const allBylines = links.map((link) => link.author).filter((byline) => byline)
  const bylines = [...new Set(allBylines)].splice(0, 5)
  if (bylines.length > 0) {
    description = 'From ' + bylines.map((byline) => byline).join(', ')
  }

  return {
    notification: {
      title: title,
      body: description,
    },
    tokens: deviceTokens.map((token) => token.token),
  }
}
