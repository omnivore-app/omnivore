// import {
//   createTestReminder,
//   createTestUser,
//   deleteTestUser,
//   getReminder,
// } from '../db'
// import { request } from '../util'
// import { User } from '../../src/entity/user'
// import { Reminder } from '../../src/entity/reminder'
// import { expect } from 'chai'
// import 'mocha'

// xdescribe('Reminders Router', () => {
//   let authToken: string
//   let user: User
//   let reminder: Reminder

//   before(async () => {
//     // create test user and login
//     user = await createTestUser('fakeUser')
//     const res = await request
//       .post('/local/debug/fake-user-login')
//       .send({ fakeEmail: user.email })

//     authToken = res.body.authToken

//     const page = await createTestPage()
//     const link = await createTestLink(user, page)
//     reminder = await createTestReminder(user, link.id)
//   })

//   after(async () => {
//     // clean up
//     await deleteTestUser(user.id)
//   })

//   describe('trigger reminders', () => {
//     it('should trigger reminders and update status to Complete', async () => {
//       await request
//         .post('/svc/reminders/trigger')
//         .send({
//           userId: user.id,
//           scheduleTime: reminder.remindAt,
//         })
//         .set('Authorization', `${authToken}`)
//         .expect(200)

//       const completed = await getReminder(reminder.id)
//       expect(completed?.status).to.eql('COMPLETED')
//     })
//   })
// })
