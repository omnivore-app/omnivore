interface PageToNotify {
  title: string
  url: string
  byline: string | undefined | null
  description: string | undefined | null
  image: string | undefined | null
}

// export function remindersServiceRouter() {
//   const router = express.Router()

//   // eslint-disable-next-line @typescript-eslint/no-misused-promises
//   router.post('/trigger', async (req, res) => {
//     logger.info('reminders/trigger')

//     const { userId, scheduleTime } = req.body as {
//       userId?: string
//       scheduleTime?: number
//     }

//     analytics.track({
//       userId: userId,
//       event: 'reminder_triggered',
//       properties: {
//         env: env.server.apiEnv,
//       },
//     })

//     if (!userId || !scheduleTime) {
//       res.status(400).send('Bad Request')
//       return
//     }

//     try {
//       const remindAt = new Date(scheduleTime)

//       // get all reminders by userid and scheduled time
//       const models = initModels(kx, false)

//       const user = await models.user.get(userId)
//       if (!user || !user.email) {
//         logger.info('user not found', userId)
//         res.status(400).send('User Not Found')
//         return
//       }

//       const pageReminders = await getPagesWithReminder(userId, remindAt)

//       if (!pageReminders) {
//         logger.info('pages with reminders not found', userId, scheduleTime)
//         res.status(200).send('Reminders Not Found')
//         return
//       }

//       logger.info('page with reminders:', pageReminders)

//       const [pagesToNotify, pagesToUnarchive] = getPagesToNotifyAndUnarchive(
//         pageReminders,
//         user.profile.username
//       )

//       // If none of the fetch reminders have sendNotification
//       // set to true, then we should not send an email or notification
//       if (pagesToNotify.length > 0) {
//         // we have configured Sendgrid to send a template
//         if (!process.env.SENDGRID_REMINDER_TEMPLATE_ID) {
//           logger.info('Sendgrid reminder email template_id not set')

//           await updateRemindersStatus(
//             models,
//             userId,
//             pagesToUnarchive,
//             remindAt
//           )
//           res.status(200).send('Template Id Not Found')
//           return
//         }

//         const dynamicTemplateData = {
//           subject: `Omnivore Reminder Service`,
//           title: `Hey ${user.name}, you have ${pagesToNotify.length} article(s) to read on Omnivore`,
//           articles: pagesToNotify,
//         }

//         logger.info('dynamic template data:', dynamicTemplateData)

//         await sendEmail({
//           from: env.sender.message,
//           dynamicTemplateData: dynamicTemplateData,
//           templateId: env.sendgrid.reminderTemplateId,
//           to: user.email,
//         })

//         // send push notifications
//         const deviceTokens = await getDeviceTokensByUserId(userId)
//         if (deviceTokens && deviceTokens.length > 0) {
//           const message = messageForPages(pageReminders, deviceTokens)
//           await sendMulticastPushNotifications(userId, message, 'reminder')
//         }

//         if (!deviceTokens) {
//           logger.info('Device tokens not set:', userId)

//           res.status(400).send('Device token Not Found')
//           return
//         }
//       }

//       await updateRemindersStatus(models, userId, pagesToUnarchive, remindAt)
//       res.status(200).send('Reminders triggered')
//     } catch (e) {
//       logger.info(e)
//       res.status(500).send(e)
//     }
//   })

//   return router
// }

// const getPagesToNotifyAndUnarchive = (
//   pageReminders: PageReminder[],
//   username: string
// ): [pages: PageToNotify[], linkIds: string[]] => {
//   const pageIds: string[] = []
//   const pages: PageToNotify[] = []
//   pageReminders.forEach((pageReminder) => {
//     pageIds.push(pageReminder.pageId)

//     pageReminder.sendNotification &&
//       pages.push({
//         url: `${homePageURL()}/${username}/${pageReminder.slug}`,
//         title: pageReminder.title,
//         description: pageReminder.description,
//         byline: pageReminder.author,
//         image: pageReminder.image,
//       })
//   })

//   return [pages, pageIds]
// }

// const messageForPages = (
//   pageReminders: PageReminder[],
//   deviceTokens: UserDeviceToken[]
// ): MulticastMessage => {
//   const pages = pageReminders.filter((reminder) => reminder.sendNotification)

//   // If the user only has one reminder triggered we send a deep
//   // link to that link.
//   if (pages.length === 1) {
//     const page = pages[0]
//     let title = 'Snoozed: You have one snoozed article to read on Omnivore'

//     if (page.author) {
//       title = `'Snoozed: From ${page.author}`
//     }

//     const pushData = !page
//       ? undefined
//       : {
//           link: Buffer.from(
//             JSON.stringify({
//               id: page.pageId,
//               url: page.url,
//               slug: page.slug,
//               title: page.title,
//               image: page.image,
//               author: page.author,
//               isArchived: false,
//               contentReader: ContentReader.Web,
//               readingProgressPercent: 0,
//               readingProgressAnchorIndex: 0,
//             })
//           ).toString('base64'),
//         }

//     return {
//       notification: {
//         title,
//         body: page.title,
//         imageUrl: page.image || undefined,
//       },
//       data: pushData,
//       tokens: deviceTokens.map((token) => token.token),
//     }
//   }

//   const title = `Snoozed: You have ${pages.length} articles to read.`
//   let description = 'Read them now.'
//   const allBylines = pages.map((page) => page.author).filter((byline) => byline)
//   const bylines = [...new Set(allBylines)].splice(0, 5)
//   if (bylines.length > 0) {
//     description = 'From ' + bylines.map((byline) => byline).join(', ')
//   }

//   return {
//     notification: {
//       title: title,
//       body: description,
//     },
//     tokens: deviceTokens.map((token) => token.token),
//   }
// }

// const updateRemindersStatus = async (
//   userId: string,
//   pagesToUnarchive: string[],
//   remindAt: Date
// ): Promise<void> => {
//   // Unarchive all the links and updated saved_at to now, so they
//   // appear at the top of the user's list.
//   for (const pageId of pagesToUnarchive) {
//     await updatePage(
//       pageId,
//       {
//         savedAt: new Date(),
//         archivedAt: null,
//       },
//       {
//         pubsub: createPubSubClient(),
//         uid: userId,
//       }
//     )
//   }

//   // db update
//   await appDataSource.transaction(async (tx) => {
//     await setClaims(tx, userId)
//     await setRemindersComplete(tx, userId, remindAt)
//   })
// }
