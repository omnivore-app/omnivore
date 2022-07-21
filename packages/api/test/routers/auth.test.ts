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
import { hashPassword } from '../../src/utils/auth'

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
            '/email-signup?errorCodes=INVALID_EMAIL'
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
          '/email-signup?errorCodes=USER_EXISTS'
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
          '/email-signup?errorCodes=INVALID_USERNAME'
        )
      })
    })
  })

  describe('login', () => {
    const loginRequest = (email: string, password: string): supertest.Test => {
      return request.post(`${route}/email-login`).send({
        email,
        password,
      })
    }
    const correctPassword = 'correctPassword'

    let user: User
    let email: string
    let password: string

    before(async () => {
      const hashedPassword = await hashPassword(correctPassword)
      user = await createTestUser('login_test_user', undefined, hashedPassword)
    })

    after(async () => {
      await deleteTestUser(user.name)
    })

    context('when email and password are valid', () => {
      before(() => {
        email = user.email
        password = correctPassword
      })

      it('redirects to waitlist page', async () => {
        const res = await loginRequest(email, password).expect(302)
        expect(res.header.location).to.endWith('/waitlist')
      })
    })

    context('when user not exists', () => {
      before(() => {
        email = 'Some email'
      })

      it('redirects with error code UserNotFound', async () => {
        const res = await loginRequest(email, password).expect(302)
        expect(res.header.location).to.endWith(
          '/email-login?errorCodes=USER_NOT_FOUND'
        )
      })
    })

    context('when user has no password stored in db', () => {
      before(async () => {
        const anotherUser = await createTestUser('another_user')
        email = anotherUser.email
        password = 'Some password'
      })

      after(async () => {
        await deleteTestUser('another_user')
      })

      it('redirects with error code WrongSource', async () => {
        const res = await loginRequest(email, password).expect(302)
        expect(res.header.location).to.endWith(
          '/email-login?errorCodes=WRONG_SOURCE'
        )
      })
    })

    context('when password is wrong', () => {
      before(() => {
        email = user.email
        password = 'Wrong password'
      })

      it('redirects with error code InvalidCredentials', async () => {
        const res = await loginRequest(email, password).expect(302)
        expect(res.header.location).to.endWith(
          '/email-login?errorCodes=INVALID_CREDENTIALS'
        )
      })
    })
  })
})
