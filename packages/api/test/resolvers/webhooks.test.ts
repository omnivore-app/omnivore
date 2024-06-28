import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import { Webhook } from '../../src/entity/webhook'
import { WebhookEvent } from '../../src/generated/graphql'
import { deleteUser } from '../../src/services/user'
import {
  createWebhook,
  createWebhooks,
  findWebhookById,
  findWebhooks,
} from '../../src/services/webhook'
import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

describe('Webhooks API', () => {
  let user: User
  let authToken: string

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken as string

    // create test webhooks
    await createWebhooks(
      [
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
      ],
      user.id
    )
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('Get webhook', () => {
    let webhook: Webhook

    before(async () => {
      // create test webhooks
      webhook = await createWebhook(
        {
          url: 'http://localhost:3000/webhooks/test',
          user: { id: user.id },
          eventTypes: [WebhookEvent.PageDeleted],
        },
        user.id
      )
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

      const res = await graphqlRequest(query, authToken).expect(200)

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

      const res = await graphqlRequest(query, authToken).expect(200)
      const webhooks = await findWebhooks(user.id)

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

    beforeEach(() => {
      query = `
        mutation {
          setWebhook(
            input: {
              id: "${webhookId}",
              url: "${webhookUrl}",
              eventTypes: [${eventTypes.toString()}],
              enabled: ${enabled.toString()}
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
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.setWebhook.webhook).to.be.an('object')
        expect(res.body.data.setWebhook.webhook.url).to.eql(webhookUrl)
        expect(res.body.data.setWebhook.webhook.eventTypes).to.eql(eventTypes)
        expect(res.body.data.setWebhook.webhook.enabled).to.be.true
      })
    })

    context('when id is there', () => {
      before(async () => {
        const webhook = await createWebhook(
          {
            url: 'http://localhost:3000/webhooks/test',
            user: { id: user.id },
            eventTypes: [WebhookEvent.HighlightUpdated],
          },
          user.id
        )

        webhookId = webhook.id
        webhookUrl = 'http://localhost:3000/webhooks/test_2'
        eventTypes = [
          WebhookEvent.HighlightUpdated,
          WebhookEvent.HighlightCreated,
        ]
        enabled = false
      })

      it('should update a webhook', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

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

    beforeEach(() => {
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
        const webhook = await createWebhook(
          {
            url: 'http://localhost:3000/webhooks/test',
            user: { id: user.id },
            eventTypes: [WebhookEvent.LabelCreated],
          },
          user.id
        )
        webhookId = webhook.id
      })

      it('should delete a webhook', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        const webhook = await findWebhookById(webhookId, user.id)

        expect(res.body.data.deleteWebhook.webhook).to.be.an('object')
        expect(res.body.data.deleteWebhook.webhook.id).to.eql(webhookId)
        expect(webhook).to.be.null
      })
    })
  })
})
