import { expect } from 'chai'
import * as jwt from 'jsonwebtoken'
import 'mocha'
import { User } from '../../src/entity/user'
import { findLibraryItemById } from '../../src/services/library_item'
import { createNewsletterEmail } from '../../src/services/newsletters'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { request } from '../util'

describe('PDF attachments Router', () => {
  const newsletterEmail = 'fakeEmail@omnivore.app'

  let user: User
  let authToken: string

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')

    await createNewsletterEmail(user.id, newsletterEmail)
    authToken = jwt.sign(newsletterEmail, process.env.JWT_SECRET || '')
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('upload', () => {
    xit('create upload file request and return id and url', async () => {
      const testFile = 'testFile.pdf'

      const res = await request
        .post('/svc/pdf-attachments/upload')
        .set('Authorization', `${authToken}`)
        .send({
          email: newsletterEmail,
          fileName: testFile,
        })
        .expect(200)

      expect(res.body.id).to.be.a('string')
      expect(res.body.url).to.be.a('string')
    })
  })

  describe('create article', () => {
    let uploadFileId: string

    before(async () => {
      // upload file first
      const testFile = 'testFile.pdf'
      const res = await request
        .post('/svc/pdf-attachments/upload')
        .set('Authorization', `${authToken}`)
        .send({
          email: newsletterEmail,
          fileName: testFile,
        })
      uploadFileId = res.body.id
    })

    xit('create article with uploaded file id and url', async () => {
      // create article
      const res2 = await request
        .post('/svc/pdf-attachments/create-article')
        .send({
          email: newsletterEmail,
          uploadFileId: uploadFileId,
        })
        .set('Authorization', `${authToken}`)
        .expect(200)

      expect(res2.body.id).to.be.a('string')
      const item = await findLibraryItemById(res2.body.id, user.id)

      expect(item).to.exist
    })
  })
})
