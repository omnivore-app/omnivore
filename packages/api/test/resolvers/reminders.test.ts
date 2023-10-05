import { expect } from 'chai'
import { DateTime } from 'luxon'
import 'mocha'
import { LibraryItem } from '../../src/entity/library_item'
import { Reminder } from '../../src/entity/reminder'
import { User } from '../../src/entity/user'
import {
  CreateReminderErrorCode,
  ReminderErrorCode,
  UpdateReminderErrorCode,
} from '../../src/generated/graphql'
import { deleteUser } from '../../src/services/user'
import {
  createTestLibraryItem,
  createTestReminder,
  createTestUser,
  getReminder,
} from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'

xdescribe('Reminders API', () => {
  let authToken: string
  let item: LibraryItem
  let reminder: Reminder
  let user: User

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    // create page, link and reminders test data
    item = await createTestLibraryItem(user.id)
    reminder = await createTestReminder(user, item.id)
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('Get reminder', () => {
    let linkId: string
    let query: string

    beforeEach(() => {
      query = `
        query {
          reminder(linkId: "${linkId}") {
            ... on ReminderSuccess {
              reminder {
                id
                remindAt
              }
            }
            ... on ReminderError {
              errorCodes
            }
          }
        }
      `
    })

    context('when reminder is found', () => {
      before(() => {
        // existing page id
        linkId = item.id
      })

      it('responds with the reminder', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)

        expect(response.body.data.reminder.reminder.id).to.eql(reminder.id)
      })
    })

    context('when reminder is not found', () => {
      before(() => {
        // fake page id
        linkId = generateFakeUuid()
      })

      it('responds error code NOT_FOUND', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)

        expect(response.body.data.reminder.errorCodes).to.eql([
          ReminderErrorCode.NotFound,
        ])
      })
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
      query {
        reminder {
        }
      }
    `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
  })

  describe('Create reminder', () => {
    const remindAt = DateTime.now().plus({ days: 1 }).toISODate()
    let linkId = 'Link id'
    let query: string

    beforeEach(() => {
      query = `
        mutation {
          createReminder(
            input: {
              linkId: "${linkId}"
              remindAt: "${remindAt}"
              sendNotification: true
              archiveUntil: false
            }
          ) {
            ... on CreateReminderSuccess {
              reminder {
                id
                remindAt
              }
            }
            ... on CreateReminderError {
              errorCodes
            }
          }
        }
      `
    })

    context('when link is valid', () => {
      before(() => {
        linkId = item.id
      })

      it('responds with status code 200', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        const reminder = await getReminder(response.body.data.createReminder.id)
        expect(reminder).not.to.be.undefined
      })
    })

    context('when no link id and client request id', () => {
      before(() => {
        linkId = ''
      })

      it('responds with error code BAD_REQUEST', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.createReminder.errorCodes).to.eql([
          CreateReminderErrorCode.BadRequest,
        ])
      })
    })

    context('when no article found', () => {
      before(() => {
        // fake page id
        linkId = generateFakeUuid()
      })

      it('responds with error code NOT_FOUND', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.createReminder.errorCodes).to.eql([
          CreateReminderErrorCode.NotFound,
        ])
      })
    })

    it('responds with status code 400 if invalid query', async () => {
      const invalidQuery = `
        mutation {
          createReminder()
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds with status code 400 if invalid user', async () => {
      const fakeToken = 'Fake token'
      return graphqlRequest(query, fakeToken).expect(500)
    })
  })

  describe('Update reminder', () => {
    const remindAt = DateTime.now().plus({ days: 1 }).toISODate()
    let query: string
    let reminderId = 'Reminder id'

    beforeEach(() => {
      query = `
        mutation {
          updateReminder(
            input: {
              id: "${reminderId}"
              remindAt: "${remindAt}"
              sendNotification: true
              archiveUntil: false
            }
          ) {
            ... on UpdateReminderSuccess {
              reminder {
                id
                remindAt
              }
            }
            ... on UpdateReminderError {
              errorCodes
            }
          }
        }
      `
    })

    context('when reminder exists', () => {
      before(() => {
        reminderId = reminder.id
      })

      it('responds with status code 200', async () => {
        await graphqlRequest(query, authToken).expect(200)
        const reminder = await getReminder(reminderId)
        expect(reminder?.sendNotification).to.be.true
      })
    })

    context('when reminder is not found', () => {
      before(() => {
        // fake reminder id
        reminderId = generateFakeUuid()
      })

      it('responds with error code NOT_FOUND', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.updateReminder.errorCodes).to.eql([
          UpdateReminderErrorCode.NotFound,
        ])
      })
    })

    it('responds with status code 400 if invalid query', async () => {
      const invalidQuery = `
        mutation {
          updateReminder()
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds with status code 500 if invalid user', async () => {
      const fakeToken = 'Fake token'
      return graphqlRequest(query, fakeToken).expect(500)
    })
  })

  describe('Delete reminder', () => {
    let reminderId = 'reminderId'
    let query: string

    beforeEach(() => {
      query = `
        mutation {
          deleteReminder(id: "${reminderId}") {
            ... on DeleteReminderSuccess {
              reminder {
                id
                remindAt
              }
            }
            ... on DeleteReminderError {
              errorCodes
            }
          }
        }
      `
    })

    context('when reminder exists', () => {
      before(() => {
        reminderId = reminder.id
      })

      it('responds status code 200', async () => {
        await graphqlRequest(query, authToken).expect(200)
        const reminder = await getReminder(reminderId)
        expect(reminder?.status).to.eql('DELETED')
      })
    })

    context('when reminders is not found', () => {
      before(() => {
        // fake reminder id
        reminderId = generateFakeUuid()
      })

      it('responds error code NOT_FOUND', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.deleteReminder.errorCodes).to.eql([
          ReminderErrorCode.NotFound,
        ])
      })
    })

    it('responds status code 400 if invalid query', async () => {
      const invalidQuery = `
        mutation {
          deleteReminder()
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 if invalid user', async () => {
      const fakeToken = 'Fake token'
      return graphqlRequest(query, fakeToken).expect(500)
    })
  })
})
