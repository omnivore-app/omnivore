import { DateTime } from 'luxon'

const validScheduleTime = (str: string): Date | undefined => {
  const scheduleTime = DateTime.fromISO(str, { setZone: true }).set({
    minute: 0,
    second: 0,
    millisecond: 0,
  })
  if (scheduleTime <= DateTime.now()) {
    return undefined
  }
  return scheduleTime.toJSDate()
}

// export const createReminderResolver = authorized<
//   CreateReminderSuccess,
//   CreateReminderError,
//   MutationCreateReminderArgs
// >(async (_, { input }, { models, claims: { uid }, log }) => {
//   log.info('createReminderResolver')

//   const { clientRequestId, linkId, archiveUntil, sendNotification } = input

//   const scheduledTime = validScheduleTime(input.remindAt)
//   if (!scheduledTime) {
//     log.error('Invalid scheduled time', input.remindAt)
//     return {
//       errorCodes: [CreateReminderErrorCode.BadRequest],
//     }
//   }

//   const pageId = linkId || clientRequestId
//   if (!pageId) {
//     log.error('client request id or link id is required')
//     return {
//       errorCodes: [CreateReminderErrorCode.BadRequest],
//     }
//   }

//   analytics.capture({
//     userId: uid,
//     event: 'reminder_created',
//     properties: {
//       clientRequestId,
//       remindAt: scheduledTime,
//       archiveUntil,
//       sendNotification,
//       linkId,
//       env: env.server.apiEnv,
//     },
//   })

//   try {
//     // saving from web
//     const page = await getPageById(pageId)
//     if (!page) {
//       log.error('page not found', pageId)

//       return {
//         errorCodes: [CreateReminderErrorCode.NotFound],
//       }
//     }

//     if (page.userId !== uid) {
//       log.error('user not authorized', uid)

//       return {
//         errorCodes: [CreateReminderErrorCode.Unauthorized],
//       }
//     }
//     if (archiveUntil) {
//       await archivePage(uid, page)
//     }

//     const taskName = await groupReminders(scheduledTime, uid, models)
//     log.info('scheduled task name', taskName)

//     // insert reminder to db
//     const reminder = await models.reminder.create({
//       userId: uid,
//       taskName: taskName,
//       archiveUntil: archiveUntil,
//       sendNotification: sendNotification,
//       createdAt: new Date(),
//       remindAt: scheduledTime,
//       elasticPageId: pageId,
//     })
//     log.info('created reminder', reminder)

//     return {
//       reminder: {
//         id: reminder.id,
//         archiveUntil,
//         sendNotification,
//         remindAt: scheduledTime,
//       },
//     }
//   } catch (e) {
//     log.info('error creating reminder', e)

//     return {
//       errorCodes: [CreateReminderErrorCode.BadRequest],
//     }
//   }
// })

// // Attempts to find a link and archive it if it exists.
// // It is possible that the link has not been created
// // yet if it is still in the saving process. In that
// // case it will be archived when the link is created.
// const archivePage = async (uid: string, page: Page) => {
//   try {
//     await setLinkArchived(uid, page.id, true)
//   } catch (e) {
//     logger.info('error archiving link', e)
//   }
// }

// export const reminderResolver = authorized<
//   ReminderSuccess,
//   ReminderError,
//   QueryReminderArgs
// >(async (_, { linkId: pageId }, { models, claims: { uid }, log }) => {
//   log.info('reminderResolver')

//   analytics.capture({
//     userId: uid,
//     event: 'reminder',
//     properties: {
//       linkId: pageId,
//       env: env.server.apiEnv,
//     },
//   })

//   try {
//     // get page from articleId
//     const page = await getPageById(pageId)
//     if (!page) {
//       return {
//         errorCodes: [ReminderErrorCode.NotFound],
//       }
//     }
//     if (page.userId !== uid) {
//       return {
//         errorCodes: [ReminderErrorCode.Unauthorized],
//       }
//     }
//     const reminder = await models.reminder.getCreatedByParameters(uid, {
//       elasticPageId: page.id,
//     })

//     if (!reminder) {
//       log.error('reminder not found: pageId: ', pageId)

//       return {
//         errorCodes: [ReminderErrorCode.NotFound],
//       }
//     }

//     return {
//       reminder: {
//         id: reminder.id,
//         archiveUntil: reminder.archiveUntil || false,
//         sendNotification: reminder.sendNotification || true,
//         remindAt: reminder.remindAt,
//       },
//     }
//   } catch (e) {
//     log.error(e)

//     return {
//       errorCodes: [ReminderErrorCode.BadRequest],
//     }
//   }
// })

// export const updateReminderResolver = authorized<
//   UpdateReminderSuccess,
//   UpdateReminderError,
//   MutationUpdateReminderArgs
// >(async (_, { input }, { models, claims: { uid }, log, authTrx }) => {
//   log.info('updateReminderResolver')

//   const { id, archiveUntil, sendNotification } = input

//   const scheduledTime = validScheduleTime(input.remindAt)
//   if (!scheduledTime) {
//     log.error('Invalid scheduled time', input.remindAt)
//     return {
//       errorCodes: [UpdateReminderErrorCode.BadRequest],
//     }
//   }

//   analytics.capture({
//     userId: uid,
//     event: 'reminder_updated',
//     properties: {
//       id,
//       remindAt: scheduledTime,
//       archiveUntil,
//       sendNotification,
//       env: env.server.apiEnv,
//     },
//   })

//   try {
//     const reminder = await models.reminder.getCreated(id)

//     if (!reminder) {
//       log.error('reminder not found:', id)

//       return {
//         errorCodes: [UpdateReminderErrorCode.NotFound],
//       }
//     }

//     if (reminder.userId !== uid) {
//       return {
//         errorCodes: [UpdateReminderErrorCode.Unauthorized],
//       }
//     }

//     // delete old google cloud task
//     if (reminder.taskName) {
//       await deleteTask(reminder.taskName)
//     }

//     const taskName = await groupReminders(scheduledTime, uid, models)

//     // update db
//     await authTrx((tx) =>
//       models.reminder.update(
//         id,
//         {
//           taskName: taskName,
//           archiveUntil,
//           sendNotification,
//           remindAt: scheduledTime,
//         },
//         tx
//       )
//     )

//     return {
//       reminder: {
//         id: reminder.id,
//         archiveUntil,
//         sendNotification,
//         remindAt: scheduledTime,
//       },
//     }
//   } catch (e) {
//     log.error(e)

//     return {
//       errorCodes: [UpdateReminderErrorCode.BadRequest],
//     }
//   }
// })

// export const deleteReminderResolver = authorized<
//   DeleteReminderSuccess,
//   DeleteReminderError,
//   MutationDeleteReminderArgs
// >(async (_, { id }, { models, claims: { uid }, log, authTrx }) => {
//   log.info('deleteReminderResolver')

//   analytics.capture({
//     userId: uid,
//     event: 'reminder_deleted',
//     properties: {
//       id: id,
//       env: env.server.apiEnv,
//     },
//   })

//   try {
//     const reminder = await models.reminder.getCreated(id)

//     if (!reminder) {
//       log.error('reminder not found:', id)

//       return {
//         errorCodes: [DeleteReminderErrorCode.NotFound],
//       }
//     }

//     if (reminder.userId !== uid) {
//       return {
//         errorCodes: [DeleteReminderErrorCode.Unauthorized],
//       }
//     }

//     // update db
//     await authTrx((tx) => models.reminder.delete(id, tx))

//     return {
//       reminder: {
//         id: reminder.id,
//         archiveUntil: reminder.archiveUntil || false,
//         sendNotification: reminder.sendNotification || true,
//         remindAt: reminder.remindAt,
//       },
//     }
//   } catch (e) {
//     log.error(e)

//     return {
//       errorCodes: [DeleteReminderErrorCode.BadRequest],
//     }
//   }
// })

// // check if there exists reminders for the same user at the same time
// // create a Google cloud task if no existing task and return task name
// const groupReminders = async (
//   scheduledTime: Date,
//   userId: string,
//   models: DataModels
// ): Promise<string | undefined> => {
//   const exists = await models.reminder.existByUserAndRemindAt(
//     userId,
//     scheduledTime
//   )

//   if (!exists) {
//     return enqueueReminder(userId, scheduledTime.getTime())
//   }

//   return undefined
// }
