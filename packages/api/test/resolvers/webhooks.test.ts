import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import { WebhookEvent } from '../../src/generated/graphql'
import { Webhook } from '../../src/entity/webhook'
import { getRepository } from '../../src/entity'

describe('Webhooks API', () => {
  let user: User
  let authToken: string

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    // create test webhooks
    await getRepository(Webhook).save([
      {
        url: 'http://localhost:3000/webhooks/test',
        user: { id: user.id },
        eventTypes: [WebhookEvent.PageCreated],
      },
      {
        url: 'http://localhost:3000/webhooks/test',
        user: { id: user.id },
        eventTypes: [WebhookEvent.PageUpdated],
      },
    ])
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
  })

  describe('Get webhook', () => {
    let webhook: Webhook

    before(async () => {
      // create test webhooks
      webhook = await getRepository(Webhook).save({
        url: 'http://localhost:3000/webhooks/test',
        user: { id: user.id },
        eventTypes: [WebhookEvent.PageDeleted],
      })
    })

    it('should return a webhook', async () => {
      const query = `
        query {
          webhook(id: "${webhook.id}") {
            ... on WebhookSuccess {
              webhook {
                id
                url
                eventTypes
                enabled
              }
            }
          }
        }
      `

      const res = await graphqlRequest(query, authToken)

      expect(res.body.data.webhook.webhook.id).to.eql(webhook.id)
      expect(res.body.data.webhook.webhook.url).to.eql(webhook.url)
      expect(res.body.data.webhook.webhook.eventTypes).to.eql(
        webhook.eventTypes
      )
      expect(res.body.data.webhook.webhook.enabled).to.eql(webhook.enabled)
    })
  })

  describe('List webhooks', () => {
    it('should return a list of webhooks', async () => {
      const query = `
        query {
          webhooks {
            ... on WebhooksSuccess {
              webhooks {
                id
                url
                eventTypes
                enabled
              }
            }
          }
        }
      `

      const res = await graphqlRequest(query, authToken)
      const webhooks = await getRepository(Webhook).findBy({
        user: { id: user.id },
      })

      expect(res.body.data.webhooks.webhooks).to.eql(
        webhooks.map((w) => ({
          id: w.id,
          url: w.url,
          eventTypes: w.eventTypes,
          enabled: w.enabled,
        }))
      )
    })
  })

  describe('Set webhook', () => {
    let eventTypes: WebhookEvent[]
    let query: string
    let webhookUrl: string
    let webhookId: string
    let enabled: boolean

    beforeEach(async () => {
      query = `
        mutation {
          setWebhook(
            input: {
              id: "${webhookId}",
              url: "${webhookUrl}",
              eventTypes: [${eventTypes}],
              enabled: ${enabled}
            }
          ) {
            ... on SetWebhookSuccess {
              webhook {
                id
                url
                eventTypes
                enabled
              }
            }
            ... on SetWebhookError {
              errorCodes
            }
          }
        }
      `
    })

    context('when id is not set', () => {
      before(() => {
        webhookId = ''
        webhookUrl = 'http://localhost:3000/webhooks/test'
        eventTypes = [WebhookEvent.HighlightCreated]
        enabled = true
      })

      it('should create a webhook', async () => {
        const res = await graphqlRequest(query, authToken)

        expect(res.body.data.setWebhook.webhook).to.be.an('object')
        expect(res.body.data.setWebhook.webhook.url).to.eql(webhookUrl)
        expect(res.body.data.setWebhook.webhook.eventTypes).to.eql(eventTypes)
        expect(res.body.data.setWebhook.webhook.enabled).to.be.true
      })
    })

    context('when id is there', () => {
      before(async () => {
        const webhook = await getRepository(Webhook).save({
          url: 'http://localhost:3000/webhooks/test',
          user: { id: user.id },
          eventTypes: [WebhookEvent.HighlightUpdated],
        })
        webhookId = webhook.id
        webhookUrl = 'http://localhost:3000/webhooks/test_2'
        eventTypes = [
          WebhookEvent.HighlightUpdated,
          WebhookEvent.HighlightCreated,
        ]
        enabled = false
      })

      it('should update a webhook', async () => {
        const res = await graphqlRequest(query, authToken)

        expect(res.body.data.setWebhook.webhook).to.be.an('object')
        expect(res.body.data.setWebhook.webhook.url).to.eql(webhookUrl)
        expect(res.body.data.setWebhook.webhook.eventTypes).to.eql(eventTypes)
        expect(res.body.data.setWebhook.webhook.enabled).to.be.false
      })
    })
  })

  describe('Delete webhook', () => {
    let query: string
    let webhookId: string

    beforeEach(async () => {
      query = `
        mutation {
          deleteWebhook(id: "${webhookId}") {
            ... on DeleteWebhookSuccess {
              webhook {
                id
              }
            }
            ... on DeleteWebhookError {
              errorCodes
            }
          }
        }
      `
    })

    context('when webhook exists', () => {
      before(async () => {
        const webhook = await getRepository(Webhook).save({
          url: 'http://localhost:3000/webhooks/test',
          user: { id: user.id },
          eventTypes: [WebhookEvent.LabelCreated],
        })
        webhookId = webhook.id
      })

      it('should delete a webhook', async () => {
        const res = await graphqlRequest(query, authToken)
        const webhook = await getRepository(Webhook).findOneBy({
          id: webhookId,
        })

        expect(res.body.data.deleteWebhook.webhook).to.be.an('object')
        expect(res.body.data.deleteWebhook.webhook.id).to.eql(webhookId)
        expect(webhook).to.be.null
      })
    })
  })
})
