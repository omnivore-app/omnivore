import { expect } from 'chai'
import sinon, { SinonFakeTimers } from 'sinon'
import supertest from 'supertest'
import { StatusType, User } from '../../src/entity/user'
import { getRepository } from '../../src/repository'
import { userRepository } from '../../src/repository/user'
import { isValidSignupRequest } from '../../src/routers/auth/auth_router'
import { AuthProvider } from '../../src/routers/auth/auth_types'
import { createPendingUserToken } from '../../src/routers/auth/jwt_helpers'
import { searchAndCountLibraryItems } from '../../src/services/library_item'
import { deleteUser, updateUser } from '../../src/services/user'
import {
  comparePassword,
  generateVerificationToken,
  hashPassword,
} from '../../src/utils/auth'
import { createTestUser } from '../db'
import { generateFakeUuid, request } from '../util'

describe('auth router', () => {
  const route = '/api/auth'

  describe('email signup', () => {
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
    const validPassword = 'validPassword'

    let email: string
    let password: string
    let username: string
    let name: string

    context('when inputs are valid and user not exists', () => {
      before(() => {
        password = validPassword
        username = 'Some_username'
        email = `${username}@omnivore.app ` // space at the end is intentional
        name = 'Some name'
      })

      afterEach(async () => {
        const user = await userRepository.findOneBy({ name })
        await deleteUser(user!.id)
      })

      context('when confirmation email sent', () => {
        it('redirects to verify email', async () => {
          const res = await signupRequest(
            email,
            password,
            name,
            username
          ).expect(302)
          expect(res.header.location).to.endWith(
            '/verify-email?message=SIGNUP_SUCCESS'
          )
        })

        it('creates the user with pending status and correct name', async () => {
          await signupRequest(email, password, name, username).expect(302)
          const user = await userRepository.findOneBy({ name })

          expect(user?.status).to.eql(StatusType.Pending)
          expect(user?.name).to.eql(name)
        })
      })
    })

    context('when user exists', () => {
      let user: User

      before(async () => {
        username = 'Some_username'
        user = await createTestUser(username)
        email = user.email
        password = 'Some password'
      })

      after(async () => {
        await deleteUser(user.id)
      })

      it('redirects to sign up page with error code UNKNOWN', async () => {
        const res = await signupRequest(email, password, name, username).expect(
          302
        )
        expect(res.header.location).to.endWith(
          '/email-signup?errorCodes=UNKNOWN'
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

    context('when password is over max length', () => {
      before(() => {
        email = 'Some_email'
        password = 'badpass'.repeat(100)
        username = 'omnivore_admin'
      })

      it('redirects to sign up page with error code INVALID_CREDENTIALS', async () => {
        const res = await signupRequest(email, password, name, username).expect(
          302
        )
        expect(res.header.location).to.endWith(
          '/email-signup?errorCodes=INVALID_CREDENTIALS'
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
      await deleteUser(user.id)
    })

    context('when email and password are valid', () => {
      before(() => {
        email = user.email + ' ' // space at the end is intentional
        password = correctPassword
      })

      it('redirects to sso page', async () => {
        const res = await loginRequest(email, password).expect(302)
        expect(res.header.location).to.contain('/api/client/auth?tok')
      })

      it('set auth token in cookie', async () => {
        const res = await loginRequest(email, password).expect(302)
        expect(res.header['set-cookie']).to.be.an('array')
        expect(res.header['set-cookie'][0]).to.contain('auth')
      })
    })

    context('when user is not confirmed', () => {
      beforeEach(async () => {
        await updateUser(user.id, { status: StatusType.Pending })
        email = user.email
        password = correctPassword
      })

      afterEach(async () => {
        await updateUser(user.id, { status: StatusType.Active })
      })

      it('redirects with error code PendingVerification', async () => {
        const res = await loginRequest(email, password).expect(302)
        expect(res.header.location).to.endWith(
          '/email-login?errorCodes=PENDING_VERIFICATION'
        )
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
        await updateUser(user.id, { password: '' })
        email = user.email
        password = user.password!
      })

      after(async () => {
        await updateUser(user.id, { password })
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
      user = await createTestUser('pendingUser', undefined, 'password', true)
    })

    after(async () => {
      await deleteUser(user.id)
    })

    context('when token is valid', () => {
      beforeEach(async () => {
        token = await generateVerificationToken({ id: user.id })
      })

      it('set auth token in cookie', async () => {
        const res = await confirmEmailRequest(token).expect(302)
        expect(res.header['set-cookie']).to.be.an('array')
        expect(res.header['set-cookie'][0]).to.contain('auth')
      })

      it('redirects to sso page', async () => {
        const res = await confirmEmailRequest(token).expect(302)
        expect(res.header.location).to.contain('/api/client/auth?tok')
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
      let clock: SinonFakeTimers

      before(async () => {
        clock = sinon.useFakeTimers()
        token = await generateVerificationToken({ id: user.id })
        // advance time by 1 hour
        clock.tick(60 * 60 * 1000)
      })

      after(() => {
        clock.restore()
      })

      it('redirects to confirm-email page with error code TokenExpired', async () => {
        const res = await confirmEmailRequest(token).expect(302)
        expect(res.header.location).to.endWith(
          '/confirm-email?errorCodes=TOKEN_EXPIRED'
        )
      })
    })

    context('when user is not found', () => {
      before(async () => {
        const nonExistsUserId = generateFakeUuid()
        token = await generateVerificationToken({ id: nonExistsUserId })
      })

      it('redirects to confirm-email page with error code UserNotFound', async () => {
        const res = await confirmEmailRequest(token).expect(302)
        expect(res.header.location).to.endWith(
          '/confirm-email?errorCodes=USER_NOT_FOUND'
        )
      })
    })
  })

  describe('forgot-password', () => {
    const emailResetPasswordReq = (email: string): supertest.Test => {
      return request.post(`${route}/forgot-password`).send({
        email,
      })
    }

    let email: string

    context('when email is not empty', () => {
      before(() => {
        email = `some_email@domain.app`
      })

      context('when user exists', () => {
        let user: User

        before(async () => {
          user = await createTestUser('test_user')
          email = user.email
        })

        after(async () => {
          await deleteUser(user.id)
        })

        context('when email is verified', () => {
          before(async () => {
            await updateUser(user.id, { status: StatusType.Active })
          })

          context('when reset password email sent', () => {
            it('redirects to forgot-password page with success message', async () => {
              const res = await emailResetPasswordReq(email).expect(302)
              expect(res.header.location).to.endWith('/auth/reset-sent')
            })
          })
        })

        context('when email is not verified', () => {
          before(async () => {
            await updateUser(user.id, { status: StatusType.Pending })
          })

          it('redirects to email-login page with error code PENDING_VERIFICATION', async () => {
            const res = await emailResetPasswordReq(email).expect(302)
            expect(res.header.location).to.endWith('/auth/reset-sent')
          })
        })
      })

      context('when user does not exist', () => {
        before(() => {
          email = 'non_exists_email@domain.app'
        })

        it('redirects to forgot-password page with error code USER_NOT_FOUND', async () => {
          const res = await emailResetPasswordReq(email).expect(302)
          expect(res.header.location).to.endWith('/auth/reset-sent')
        })
      })
    })

    context('when email is empty', () => {
      before(() => {
        email = ''
      })

      it('redirects to forgot-password page with error code INVALID_EMAIL', async () => {
        const res = await emailResetPasswordReq(email).expect(302)
        expect(res.header.location).to.endWith(
          '/forgot-password?errorCodes=INVALID_EMAIL'
        )
      })
    })
  })

  describe('reset-password', () => {
    const resetPasswordRequest = (
      token: string,
      password: string
    ): supertest.Test => {
      return request.post(`${route}/reset-password`).send({
        token,
        password,
      })
    }

    let user: User
    let token: string

    before(async () => {
      user = await createTestUser('test_user', undefined, 'test_password')
    })

    after(async () => {
      await deleteUser(user.id)
    })

    context('when token is valid', () => {
      beforeEach(async () => {
        token = await generateVerificationToken({ id: user.id })
      })

      context('when password is not empty', () => {
        it('redirects to reset-password page with success message', async () => {
          const res = await resetPasswordRequest(token, 'new_password').expect(
            302
          )
          expect(res.header.location).to.contain('/api/client/auth?tok')
        })

        it('resets password', async () => {
          const password = 'test_reset_password'
          await resetPasswordRequest(token, password).expect(302)
          const updatedUser = await getRepository(User).findOneBy({
            id: user?.id,
          })
          const newPassword = updatedUser?.password || ''
          expect(await comparePassword(password, newPassword)).to.be.true
        })
      })

      context('when password is empty', () => {
        it('redirects to reset-password page with error code INVALID_PASSWORD', async () => {
          const res = await resetPasswordRequest(token, '').expect(302)
          expect(res.header.location).to.match(
            /.*\/auth\/reset-password\/(.*)?\?errorCodes=INVALID_PASSWORD/g
          )
        })
      })
    })

    context('when token is invalid', () => {
      it('redirects to reset-password page with error code InvalidToken', async () => {
        const res = await resetPasswordRequest(
          'invalid_token',
          'new_password'
        ).expect(302)
        expect(res.header.location).to.match(
          /.*\/auth\/reset-password\/(.*)?\?errorCodes=INVALID_TOKEN/g
        )
      })

      context('when token is expired', () => {
        let clock: SinonFakeTimers

        before(async () => {
          clock = sinon.useFakeTimers()
          token = await generateVerificationToken({ id: user.id })
          // advance time by 1 hour
          clock.tick(60 * 60 * 1000)
        })

        after(() => {
          clock.restore()
        })

        it('redirects to reset-password page with error code ExpiredToken', async () => {
          const res = await resetPasswordRequest(token, 'new_password').expect(
            302
          )
          expect(res.header.location).to.endWith(
            '/auth/reset-password/?errorCodes=TOKEN_EXPIRED'
          )
        })
      })
    })
  })

  describe('create account', () => {
    const createAccountRequest = (
      bio: string,
      name: string,
      username: string,
      pendingUserAuth: string,
      client: string
    ): supertest.Test => {
      return request
        .post(`${route}/create-account`)
        .set('X-OmnivoreClient', client)
        .set('User-Agent', 'chrome')
        .set('Cookie', [`pendingUserAuth=${pendingUserAuth}`])
        .send({
          name,
          bio,
          username,
        })
    }

    context('when inputs are valid and user not exists', () => {
      const name = 'test_user'
      const username = 'test_user'
      const sourceUserId = 'test_source_user_id'
      const email = 'test_user@omnivore.app'
      const bio = 'test_bio'
      const provider: AuthProvider = 'EMAIL'

      afterEach(async () => {
        const user = await userRepository.findOneByOrFail({ name })
        await deleteUser(user.id)
      })

      it('adds popular reads to the continue reading section', async () => {
        const pendingUserToken = await createPendingUserToken({
          sourceUserId,
          email,
          provider,
          name,
          username,
        })
        await createAccountRequest(
          bio,
          name,
          username,
          pendingUserToken!,
          'web'
        ).expect(200)
        const user = await userRepository.findOneByOrFail({ name })
        const { count } = await searchAndCountLibraryItems(
          { query: 'in:inbox sort:read-desc is:reading' },
          user.id
        )

        expect(count).to.eql(3)
      })

      it('adds iOS popular reads to the library if provider is iOS', async () => {
        const pendingUserToken = await createPendingUserToken({
          sourceUserId,
          email,
          provider,
          name,
          username,
        })
        await createAccountRequest(
          bio,
          name,
          username,
          pendingUserToken!,
          'ios'
        ).expect(200)
        const user = await userRepository.findOneByOrFail({ name })
        const { count } = await searchAndCountLibraryItems(
          { query: 'in:all' },
          user.id
        )

        expect(count).to.eql(4)
      })
    })
  })
})

describe('isValidSignupRequest', () => {
  it('returns true for normal looking requests', () => {
    const result = isValidSignupRequest({
      email: 'email@omnivore.app',
      password: 'superDuperPassword',
      name: "The User's Name",
      username: 'foouser',
    })
    expect(result).to.be.true
  })
  it('returns false for requests w/missing info', () => {
    let result = isValidSignupRequest({
      password: 'superDuperPassword',
      name: "The User's Name",
      username: 'foouser',
    })
    expect(result).to.be.false

    result = isValidSignupRequest({
      email: 'email@omnivore.app',
      name: "The User's Name",
      username: 'foouser',
    })
    expect(result).to.be.false

    result = isValidSignupRequest({
      email: 'email@omnivore.app',
      password: 'superDuperPassword',
      username: 'foouser',
    })
    expect(result).to.be.false

    result = isValidSignupRequest({
      email: 'email@omnivore.app',
      password: 'superDuperPassword',
      name: "The User's Name",
    })
    expect(result).to.be.false
  })

  it('returns false for requests w/malicious info', () => {
    const result = isValidSignupRequest({
      password: 'superDuperPassword',
      name: "You've won a cake sign up here: https://foo.bar",
      username: 'foouser',
    })
    expect(result).to.be.false
  })
})
