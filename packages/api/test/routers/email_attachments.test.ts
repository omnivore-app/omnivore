import { expect } from 'chai'
import * as jwt from 'jsonwebtoken'
import 'mocha'
import sinon from 'sinon'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { User } from '../../src/entity/user'
import { getRepository } from '../../src/repository'
import { findLibraryItemById } from '../../src/services/library_item'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { request } from '../util'

xdescribe('Email attachments Router', () => {
  const newsletterEmailAddress = 'fakeEmail@omnivore.app'

  let user: User
  let authToken: string

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')

    await getRepository(NewsletterEmail).save({
      address: newsletterEmailAddress,
      user: { id: user.id },
    })
    authToken = jwt.sign(newsletterEmailAddress, process.env.JWT_SECRET || '')
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
    sinon.restore()
  })

  describe('upload', () => {
    it('create upload file request and return id and url', async () => {
      const testFile = 'testFile.pdf'

      const res = await request
        .post('/svc/email-attachment/upload')
        .set('Authorization', `${authToken}`)
        .send({
          email: newsletterEmailAddress,
          fileName: testFile,
          contentType: 'application/pdf',
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
        .post('/svc/email-attachment/upload')
        .set('Authorization', `${authToken}`)
        .send({
          email: newsletterEmailAddress,
          fileName: testFile,
          contentType: 'application/pdf',
        })
      uploadFileId = res.body.id as string
    })

    it('create article with uploaded file id and url', async () => {
      // create article
      const res2 = await request
        .post('/svc/email-attachment/create-article')
        .send({
          email: newsletterEmailAddress,
          uploadFileId,
        })
        .set('Authorization', `${authToken}`)
        .expect(200)

      expect(res2.body.id).to.be.a('string')
      const item = await findLibraryItemById(res2.body.id, user.id)

      expect(item).to.exist
      expect(item?.contentReader).to.eq('PDF')
    })
  })
})
