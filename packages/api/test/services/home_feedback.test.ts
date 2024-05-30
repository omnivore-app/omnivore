import { expect } from 'chai'
import { User } from '../../src/entity/user'
import { createTestUser } from '../db'
import {
  createHomeFeedback,
  deleteHomeFeedback,
  findHomeFeedbackByUserId,
} from '../../src/services/home_feedback'
import { HomeFeedbackType } from '../../src/entity/home_feedback'
import { deleteUser } from '../../src/services/user'

describe('homeFeedback', () => {
  let user: User

  context('create and list home feedback', () => {
    before(async () => {
      user = await createTestUser('fakeUser')
    })
    after(async () => {
      await deleteUser(user.id)
    })
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
    it('handles offset and limit', async () => {
      // Create a new user to clear data
      await deleteUser(user.id)
      user = await createTestUser('fakeUser')

      await createHomeFeedback(user.id, {
        site: undefined,
        author: 'THE_AUTHOR_1',
        subscription: undefined,
        feedbackType: HomeFeedbackType.More,
      })
      await createHomeFeedback(user.id, {
        site: undefined,
        author: 'THE_AUTHOR_2',
        subscription: undefined,
        feedbackType: HomeFeedbackType.Less,
      })
      await createHomeFeedback(user.id, {
        site: undefined,
        author: 'THE_AUTHOR_3',
        subscription: undefined,
        feedbackType: HomeFeedbackType.Less,
      })
      await createHomeFeedback(user.id, {
        site: undefined,
        author: 'THE_AUTHOR_4',
        subscription: undefined,
        feedbackType: HomeFeedbackType.Less,
      })

      const items = await findHomeFeedbackByUserId(user.id, 1, 2)

      expect(items.length).to.eq(2)
      expect(items[0].author).to.eq('THE_AUTHOR_2')
      expect(items[1].author).to.eq('THE_AUTHOR_3')
    })
  })
  context('delete feedback', () => {
    before(async () => {
      user = await createTestUser('fakeUser')
    })
    after(async () => {
      await deleteUser(user.id)
    })
    it('deletes the item if it exists', async () => {
      const feedback = await createHomeFeedback(user.id, {
        site: undefined,
        author: 'THE_AUTHOR_1',
        subscription: undefined,
        feedbackType: HomeFeedbackType.More,
      })

      let items = await findHomeFeedbackByUserId(user.id)
      expect(items.length).to.eq(1)

      await deleteHomeFeedback(user.id, feedback.id)

      items = await findHomeFeedbackByUserId(user.id)
      expect(items.length).to.eq(0)
    })
  })
})
