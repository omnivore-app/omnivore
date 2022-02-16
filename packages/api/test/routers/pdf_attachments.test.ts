import {
  createTestNewsletterEmail,
  createTestUser,
  deleteTestUser,
} from '../db'
import { request } from '../util'
import { User } from '../../src/entity/user'
import 'mocha'
import * as jwt from 'jsonwebtoken'
import { expect } from 'chai'

describe('PDF attachments Router', () => {
  const username = 'fakeUser'
  const newsletterEmail = 'fakeEmail'

  let user: User
  let authToken: string

  before(async () => {
    // create test user and login
    user = await createTestUser(username)

    await createTestNewsletterEmail(user, newsletterEmail)
    authToken = jwt.sign(newsletterEmail, process.env.JWT_SECRET || '')
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
  })

  describe('upload', () => {
    it('create upload file request and return id and url', async () => {
      const testFile = 'testFile.pdf'

      const res = await request
        .post('/svc/pdf-attachments/upload')
        .send({
          email: newsletterEmail,
          fileName: testFile,
        })
        .set('Authorization', `${authToken}`)
        .expect(200)

      expect(res.body.id).to.be.a('string')
      expect(res.body.url).to.be.a('string')
    })
  })
})
