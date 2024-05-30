import { expect } from 'chai'
import { User } from '../../src/entity/user'
import { createTestUser } from '../db'
import {
  createHomeFeedback,
  findHomeFeedbackByUserId,
} from '../../src/services/home_feedback'
import { HomeFeedbackType } from '../../src/entity/home_feedback'
import { deleteUser } from '../../src/services/user'

describe('homeFeedback', () => {
  let user: User

  before(async () => {
    user = await createTestUser('fakeUser')
  })

  after(async () => {
    await deleteUser(user.id)
  })

  context('create and list home feedback', () => {
    it('adds feedback for the user', async () => {
      const newItem = await createHomeFeedback(user.id, {
        site: 'omnivore.app',
        author: undefined,
        subscription: undefined,
        feedbackType: HomeFeedbackType.More,
      })

      const items = await findHomeFeedbackByUserId(user.id)
      expect(newItem).not.to.be.empty
      expect(items).not.to.be.empty
      expect(items.length).to.eq(1)
    })
    it('does not fail for duplicate feedback', async () => {
      await createHomeFeedback(user.id, {
        site: undefined,
        author: undefined,
        subscription: 'THE_SUBSCRIPTION',
        feedbackType: HomeFeedbackType.More,
      })

      await createHomeFeedback(user.id, {
        site: undefined,
        author: undefined,
        subscription: 'THE_SUBSCRIPTION',
        feedbackType: HomeFeedbackType.More,
      })

      const items = await findHomeFeedbackByUserId(user.id)
      expect(
        items.filter((item) => item.subscription == 'THE_SUBSCRIPTION').length
      ).to.eq(1)
    })
    it('records feedback if diff for same item', async () => {
      await createHomeFeedback(user.id, {
        site: undefined,
        author: 'THE_AUTHOR',
        subscription: undefined,
        feedbackType: HomeFeedbackType.More,
      })
      await createHomeFeedback(user.id, {
        site: undefined,
        author: 'THE_AUTHOR',
        subscription: undefined,
        feedbackType: HomeFeedbackType.Less,
      })

      const items = await findHomeFeedbackByUserId(user.id)
      expect(items.filter((item) => item.author == 'THE_AUTHOR').length).to.eq(
        2
      )
    })
  })
})
