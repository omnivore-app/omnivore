import { Storage } from '@google-cloud/storage'
import { expect } from 'chai'
import { DateTime } from 'luxon'
import 'mocha'
import nock from 'nock'
import sinon from 'sinon'
import { Highlight } from '../../src/entity/highlight'
import { Integration, IntegrationType } from '../../src/entity/integration'
import { LibraryItem } from '../../src/entity/library_item'
import { User } from '../../src/entity/user'
import { env } from '../../src/env'
import { PubSubRequestBody } from '../../src/pubsub'
import { createHighlight, getHighlightUrl } from '../../src/services/highlights'
import {
  deleteIntegrations,
  saveIntegration,
  updateIntegration,
} from '../../src/services/integrations'
import { READWISE_API_URL } from '../../src/services/integrations/readwise'
import { deleteLibraryItemById } from '../../src/services/library_item'
import { deleteUser } from '../../src/services/user'
import { createTestLibraryItem, createTestUser } from '../db'
import { MockBucket } from '../mock_storage'
import { request } from '../util'

describe('Integrations routers', () => {
  const baseUrl = '/svc/pubsub/integrations'
  let token: string
  let user: User
  let authToken: string

  before(async () => {
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    const body = res.body as { authToken: string }
    authToken = body.authToken
  })

  after(async () => {
    await deleteUser(user.id)
  })

  describe('sync with integrations', () => {
    const endpoint = (token: string, name = 'name', action = 'action') =>
      `${baseUrl}/${name}/${action}?token=${token}`
    let action: string
    let data: PubSubRequestBody
    let integrationName: string

    context('when token is invalid', () => {
      before(() => {
        token = 'invalid-token'
      })

      it('returns 200', async () => {
        return request.post(endpoint(token)).send(data).expect(200)
      })
    })

    context('when token is valid', () => {
      before(() => {
        token = process.env.PUBSUB_VERIFICATION_TOKEN as string
      })

      context('when data is expired', () => {
        before(() => {
          data = {
            message: {
              data: Buffer.from(
                JSON.stringify({ userId: 'userId', type: 'page' })
              ).toString('base64'),
              publishTime: DateTime.now().minus({ hours: 12 }).toISO(),
            },
          }
        })

        it('returns 200 with Expired', async () => {
          const res = await request.post(endpoint(token)).send(data).expect(200)
          expect(res.text).to.eql('Expired')
        })
      })

      context('when userId is empty', () => {
        before(() => {
          data = {
            message: {
              data: Buffer.from(
                JSON.stringify({ userId: '', type: 'page' })
              ).toString('base64'),
              publishTime: new Date().toISOString(),
            },
          }
        })

        it('returns 200', async () => {
          return request.post(endpoint(token)).send(data).expect(200)
        })
      })

      context('when user exists', () => {
        context('when integration not found', () => {
          before(() => {
            integrationName = 'READWISE'
            data = {
              message: {
                data: Buffer.from(
                  JSON.stringify({ userId: user.id, type: 'page' })
                ).toString('base64'),
                publishTime: new Date().toISOString(),
              },
            }
          })

          it('returns 200 with No integration found', async () => {
            const res = await request
              .post(endpoint(token, integrationName))
              .send(data)
              .expect(200)
            expect(res.text).to.eql('No integration found')
          })
        })

        context('when integration is readwise and enabled', () => {
          let integration: Integration
          let item: LibraryItem
          let highlight: Highlight
          let highlightsData: string

          before(async () => {
            integration = await saveIntegration(
              {
                user: { id: user.id },
                name: 'READWISE',
                token: 'token',
              },
              user.id
            )
            integrationName = integration.name
            // create page
            item = await createTestLibraryItem(user.id)

            // create highlight
            const highlightPositionPercent = 25
            highlight = await createHighlight(
              {
                patch: 'test patch',
                quote: 'test quote',
                shortId: 'test shortId',
                highlightPositionPercent,
                user,
              },
              item.id,
              user.id
            )
            // create highlights data for integration request
            highlightsData = JSON.stringify({
              highlights: [
                {
                  text: highlight.quote,
                  title: item.title,
                  author: item.author,
                  highlight_url: getHighlightUrl(item.slug, highlight.id),
                  highlighted_at: highlight.createdAt.toISOString(),
                  category: 'articles',
                  image_url: item.thumbnail,
                  // location: highlightPositionPercent,
                  location_type: 'order',
                  note: highlight.annotation,
                  source_type: 'omnivore',
                  source_url: item.originalUrl,
                },
              ],
            })
          })

          after(async () => {
            await deleteIntegrations(user.id, [integration.id])
            await deleteLibraryItemById(item.id)
          })

          context('when action is sync_updated', () => {
            before(() => {
              action = 'sync_updated'
            })

            context('when entity type is page', () => {
              before(() => {
                data = {
                  message: {
                    data: Buffer.from(
                      JSON.stringify({
                        userId: user.id,
                        type: 'page',
                        id: item.id,
                      })
                    ).toString('base64'),
                    publishTime: new Date().toISOString(),
                  },
                }
                // mock Readwise Highlight API
                nock(READWISE_API_URL, {
                  reqheaders: {
                    Authorization: `Token ${integration.token}`,
                    ContentType: 'application/json',
                  },
                })
                  .post('/highlights', highlightsData)
                  .reply(200)
              })

              it('returns 200 with OK', async () => {
                const res = await request
                  .post(endpoint(token, integrationName, action))
                  .send(data)
                  .expect(200)
                expect(res.text).to.eql('OK')
              })

              context('when readwise highlight API reaches rate limits', () => {
                before(() => {
                  // mock Readwise Highlight API with rate limits
                  // retry after 1 second
                  nock(READWISE_API_URL, {
                    reqheaders: {
                      Authorization: `Token ${integration.token}`,
                      ContentType: 'application/json',
                    },
                  })
                    .post('/highlights')
                    .reply(429, 'Rate Limited', { 'Retry-After': '1' })
                  // mock Readwise Highlight API after 1 second
                  nock(READWISE_API_URL, {
                    reqheaders: {
                      Authorization: `Token ${integration.token}`,
                      ContentType: 'application/json',
                    },
                  })
                    .post('/highlights')
                    .delay(1000)
                    .reply(200)
                })

                it('returns 200 with OK', async () => {
                  const res = await request
                    .post(endpoint(token, integrationName, action))
                    .send(data)
                    .expect(200)
                  expect(res.text).to.eql('OK')
                })
              })
            })

            context('when entity type is highlight', () => {
              before(() => {
                data = {
                  message: {
                    data: Buffer.from(
                      JSON.stringify({
                        userId: user.id,
                        type: 'highlight',
                        articleId: item.id,
                      })
                    ).toString('base64'),
                    publishTime: new Date().toISOString(),
                  },
                }
                // mock Readwise Highlight API
                nock(READWISE_API_URL, {
                  reqheaders: {
                    Authorization: `Token ${integration.token}`,
                    ContentType: 'application/json',
                  },
                })
                  .post('/highlights', highlightsData)
                  .reply(200)
              })

              it('returns 200 with OK', async () => {
                const res = await request
                  .post(endpoint(token, integrationName, action))
                  .send(data)
                  .expect(200)
                expect(res.text).to.eql('OK')
              })
            })
          })

          context('when action is sync_all', () => {
            before(async () => {
              action = 'sync_all'
              data = {
                message: {
                  data: Buffer.from(
                    JSON.stringify({
                      userId: user.id,
                    })
                  ).toString('base64'),
                  publishTime: new Date().toISOString(),
                },
              }
              // mock Readwise Highlight API
              nock(READWISE_API_URL, {
                reqheaders: {
                  Authorization: `Token ${integration.token}`,
                  ContentType: 'application/json',
                },
              })
                .post('/highlights', highlightsData)
                .reply(200)
              await updateIntegration(
                integration.id,
                {
                  syncedAt: null,
                  taskName: 'some task name',
                },
                user.id
              )
            })

            it('returns 200 with OK', async () => {
              const res = await request
                .post(endpoint(token, integrationName, action))
                .send(data)
                .expect(200)
              expect(res.text).to.eql('OK')
            })
          })
        })
      })
    })
  })

  describe('import from integrations router', () => {
    let integration: Integration

    before(async () => {
      token = 'test token'
      // create integration
      integration = await saveIntegration(
        {
          user: { id: user.id },
          name: 'POCKET',
          token,
          type: IntegrationType.Import,
        },
        user.id
      )

      // mock Pocket API
      const reqBody = {
        access_token: token,
        consumer_key: env.pocket.consumerKey,
        state: 'all',
        detailType: 'complete',
        since: 0,
        sort: 'oldest',
        count: 100,
        offset: 0,
      }
      nock('https://getpocket.com', {
        reqheaders: {
          'content-type': 'application/json',
          'x-accept': 'application/json',
        },
      })
        .post('/v3/get', reqBody)
        .reply(200, {
          complete: 1,
          list: {
            '123': {
              given_url: 'https://omnivore.app/pocket-import-test,test',
              state: '0',
              tags: {
                '1234': {
                  tag: 'test',
                },
                '1235': {
                  tag: 'new',
                },
              },
            },
          },
          since: Date.now() / 1000,
        })
        .post('/v3/get', {
          ...reqBody,
          offset: 1,
        })
        .reply(200, {
          list: {},
        })

      // mock cloud storage
      const mockBucket = new MockBucket('test')
      sinon.replace(
        Storage.prototype,
        'bucket',
        sinon.fake.returns(mockBucket as never)
      )
    })

    after(async () => {
      sinon.restore()
      await deleteIntegrations(user.id, [integration.id])
    })

    context('when integration is pocket', () => {
      it('returns 200 with OK', async () => {
        return request
          .post(`${baseUrl}/import`)
          .send({
            integrationId: integration.id,
          })
          .set('Cookie', `auth=${authToken}`)
          .expect(200)
      })
    })
  })
})
