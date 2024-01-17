import chai, { expect } from 'chai'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { User } from '../../src/entity/user'
import { SubscriptionType } from '../../src/generated/graphql'
import * as refreshAllFeeds from '../../src/jobs/rss/refreshAllFeeds'
import { createRssSubscriptions } from '../../src/services/subscriptions'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { request } from '../util'

chai.use(sinonChai)

describe('Rss feeds Router', () => {
  const token = process.env.PUBSUB_VERIFICATION_TOKEN || ''

  let user: User
  let user1: User
  let user2: User

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    user1 = await createTestUser('fakeUser1')
    user2 = await createTestUser('fakeUser2')
    // create test subscriptions
    const name1 = 'NPR'
    const url1 = 'https://www.npr.org/rss/rss.php?id=1001'
    const name2 = 'BBC'
    const url2 = 'http://feeds.bbci.co.uk/news/rss.xml'
    await createRssSubscriptions([
      {
        name: name1,
        user: { id: user1.id },
        scheduledAt: new Date(),
        url: url1,
        type: SubscriptionType.Rss,
      },
      {
        name: name1,
        user: { id: user2.id },
        scheduledAt: new Date(),
        url: url1,
        type: SubscriptionType.Rss,
      },
      {
        name: name2,
        user: { id: user1.id },
        url: url2,
        type: SubscriptionType.Rss,
      },
      {
        name: name2,
        user: { id: user2.id },
        // 1 hour in the future
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
        url: url2,
        type: SubscriptionType.Rss,
      },
    ])
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
    await deleteUser(user1.id)
    await deleteUser(user2.id)
  })

  it('fetches all scheduled RSS feeds', async () => {
    const data = {
      message: {
        data: Buffer.from('').toString('base64'),
        publishTime: new Date().toISOString(),
      },
    }

    // fake queueRSSRefreshAllFeedsJob function
    const fake = sinon.replace(
      refreshAllFeeds,
      'queueRSSRefreshAllFeedsJob',
      sinon.fake()
    )

    const res = await request
      .post('/svc/pubsub/rss-feed/fetchAll?token=' + token)
      .send(data)
      .expect(200)
    expect(res.text).to.eql('OK')

    // check if enqueueRssFeedFetch is called
    expect(fake).to.have.been.called

    sinon.restore()
  })
})
