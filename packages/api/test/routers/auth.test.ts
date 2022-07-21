import { createTestUser, deleteTestUser } from '../db'
import { request } from '../util'
import { expect } from 'chai'
import { StatusType } from '../../src/datalayer/user/model'
import { getRepository } from '../../src/entity/utils'
import { User } from '../../src/entity/user'
import { MailDataRequired } from '@sendgrid/helpers/classes/mail'
import sinon from 'sinon'
import * as util from '../../src/utils/sendEmail'
import supertest from 'supertest'

describe('auth router', () => {
  const route = '/api/auth'
  const signupRequest = (
    email: string,
    password: string,
    name: string,
    username: string
  ): supertest.Test => {
    return request.post(`${route}/email-signup`).send({
      email,
      password,
      name,
      username,
    })
  }

  describe('email signup', () => {
    const validPassword = 'validPassword'

    let email: string
    let password: string
    let username: string
    let name: string

    context('when inputs are valid and user not exists', () => {
      let fake: (msg: MailDataRequired) => Promise<boolean>

      before(() => {
        password = validPassword
        username = 'Some_username'
        email = `${username}@fake.com`
        name = 'Some name'
      })

      afterEach(async () => {
        await deleteTestUser(username)
      })

      context('when confirmation email sent', () => {
        beforeEach(() => {
          fake = sinon.replace(util, 'sendEmail', sinon.fake.resolves(true))
        })

        afterEach(() => {
          sinon.restore()
        })

        it('redirects to login page', async () => {
          const res = await signupRequest(
            email,
            password,
            name,
            username
          ).expect(302)
          expect(res.header.location).to.endWith(
            '/email-login?message=SIGNUP_SUCCESS'
          )
        })

        it('creates the user with pending status and correct name', async () => {
          await signupRequest(email, password, name, username).expect(302)
          const user = await getRepository(User).findOneBy({ name })

          expect(user?.status).to.eql(StatusType.Pending)
          expect(user?.name).to.eql(name)
        })
      })

      context('when confirmation email not sent', () => {
        before(() => {
          fake = sinon.replace(util, 'sendEmail', sinon.fake.resolves(false))
        })

        after(() => {
          sinon.restore()
        })

        it('redirects to sign up page with error code INVALID_EMAIL', async () => {
          const res = await signupRequest(
            email,
            password,
            name,
            username
          ).expect(302)
          expect(res.header.location).to.endWith(
            '/email-registration?errorCodes=INVALID_EMAIL'
          )
        })
      })
    })

    context('when user exists', () => {
      before(async () => {
        username = 'Some_username'
        const user = await createTestUser(username)
        email = user.email
        password = 'Some password'
      })

      after(async () => {
        await deleteTestUser(username)
      })

      it('redirects to sign up page with error code USER_EXISTS', async () => {
        const res = await signupRequest(email, password, name, username).expect(
          302
        )
        expect(res.header.location).to.endWith(
          '/email-registration?errorCodes=USER_EXISTS'
        )
      })
    })

    context('when username is invalid', () => {
      before(() => {
        email = 'Some_email'
        password = validPassword
        username = 'omnivore_admin'
      })

      it('redirects to sign up page with error code INVALID_USERNAME', async () => {
        const res = await signupRequest(email, password, name, username).expect(
          302
        )
        expect(res.header.location).to.endWith(
          '/email-registration?errorCodes=INVALID_USERNAME'
        )
      })
    })
  })
})
