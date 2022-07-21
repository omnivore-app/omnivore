import { createTestUser, deleteTestUser } from '../db'
import { generateFakeUuid, request } from '../util'
import { expect } from 'chai'
import { StatusType } from '../../src/datalayer/user/model'
import { getRepository } from '../../src/entity/utils'
import { User } from '../../src/entity/user'
import { MailDataRequired } from '@sendgrid/helpers/classes/mail'
import sinon from 'sinon'
import * as util from '../../src/utils/sendEmail'
import supertest from 'supertest'
import { generateVerificationToken, hashPassword } from '../../src/utils/auth'

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

      it('set auth token in cookie', async () => {
        const res = await loginRequest(email, password).expect(302)
        expect(res.header['set-cookie']).to.be.an('array')
        expect(res.header['set-cookie'][0]).to.contain('auth')
      })
    })

    context('when user is not confirmed', async () => {
      const pendingUser = await createTestUser(
        'pending_user',
        undefined,
        correctPassword,
        true
      )

      before(async () => {
        email = pendingUser.email
        password = correctPassword
      })

      after(async () => {
        await deleteTestUser(pendingUser.name)
      })

      it('redirects with error code PendingVerification', async () => {
        const res = await loginRequest(email, password).expect(302)
        expect(res.header.location).to.endWith(
          '/email-login?errorCodes=PENDING_VERIFICATION'
        )
      })

      it('sends a verification email', async () => {
        const fake = sinon.replace(util, 'sendEmail', sinon.fake.resolves(true))
        await loginRequest(email, password).expect(302)
        sinon.restore()
        expect(fake).to.have.been.calledOnce
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

    context('when user has no password stored in db', async () => {
      const socialAccountUser = await createTestUser('social_account_user')

      before(() => {
        email = socialAccountUser.email
        password = 'Some password'
      })

      after(async () => {
        await deleteTestUser(socialAccountUser.name)
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

  describe('confirm-email', () => {
    const confirmEmailRequest = (token: string): supertest.Test => {
      return request.post(`${route}/confirm-email`).send({ token })
    }

    let user: User
    let token: string

    before(async () => {
      sinon.replace(util, 'sendEmail', sinon.fake.resolves(true))
      user = await createTestUser('pendingUser', undefined, 'password', true)
    })

    after(async () => {
      sinon.restore()
      await deleteTestUser(user.name)
    })

    context('when token is valid', () => {
      before(() => {
        token = generateVerificationToken(user.id)
      })

      it('redirects to email-login page', async () => {
        const res = await confirmEmailRequest(token).expect(302)
        expect(res.header.location).to.endWith(
          '/email-login?message=EMAIL_VERIFIED'
        )
      })

      it('sets user as active', async () => {
        await confirmEmailRequest(token).expect(302)
        const updatedUser = await getRepository(User).findOneBy({
          name: user.name,
        })
        expect(updatedUser?.status).to.eql(StatusType.Active)
      })
    })

    context('when token is invalid', () => {
      it('redirects to confirm-email with error code InvalidToken', async () => {
        const res = await confirmEmailRequest('invalid_token').expect(302)
        expect(res.header.location).to.endWith(
          '/confirm-email?errorCodes=INVALID_TOKEN'
        )
      })
    })

    context('when token is expired', () => {
      before(() => {
        token = generateVerificationToken(user.id, -1)
      })

      it('redirects to confirm-email page with error code TokenExpired', async () => {
        const res = await confirmEmailRequest(token).expect(302)
        expect(res.header.location).to.endWith(
          '/confirm-email?errorCodes=TOKEN_EXPIRED'
        )
      })
    })

    context('when user is not found', () => {
      before(() => {
        const nonExistsUserId = generateFakeUuid()
        token = generateVerificationToken(nonExistsUserId)
      })

      it('redirects to confirm-email page with error code UserNotFound', async () => {
        const res = await confirmEmailRequest(token).expect(302)
        expect(res.header.location).to.endWith(
          '/confirm-email?errorCodes=USER_NOT_FOUND'
        )
      })
    })
  })
})
