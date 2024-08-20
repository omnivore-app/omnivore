import { expect } from 'chai'
import 'mocha'
import { In } from 'typeorm'
import { StatusType, User } from '../../src/entity/user'
import {
  createUsers,
  deleteUser,
  deleteUsers,
  findUsersByIds,
} from '../../src/services/user'
import { request } from '../util'
import { createTestUser } from '../db'
import { v4 as uuid } from 'uuid'

import {
  getShortcuts,
  setShortcuts,
} from '../../src/services/user_personalization'

describe('Shortcuts Router', () => {
  const token = process.env.PUBSUB_VERIFICATION_TOKEN || ''
  let user: User

  describe('default', () => {
    before(async () => {
      user = await createTestUser('fakeUser')
    })

    after(async () => {
      await deleteUser(user.id)
    })

    it('gets the default shortcuts', async () => {
      const shortcuts = await getShortcuts(user.id)
      expect(shortcuts.length).to.eq(3) // labels, subscriptions, searches
    })

    it('can set the shortcuts', async () => {
      const shortcuts = await setShortcuts(user.id, [
        {
          id: uuid(),
          type: 'folder',
          section: 'library',
          name: 'test folder',
        },
      ])
      const result = await getShortcuts(user.id)
      expect(result.length).to.eq(1)
    })

    it('can modify shortcuts', async () => {
      await setShortcuts(user.id, [
        {
          id: uuid(),
          type: 'folder',
          section: 'library',
          name: 'test folder',
        },
      ])
      await setShortcuts(user.id, [
        {
          id: uuid(),
          type: 'folder',
          section: 'library',
          name: 'test folder',
        },
        {
          id: uuid(),
          type: 'folder',
          section: 'library',
          name: 'test folder 2',
        },
      ])
      const result = await getShortcuts(user.id)
      expect(result.length).to.eq(2)
    })
  })
})
