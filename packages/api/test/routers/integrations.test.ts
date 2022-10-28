import 'mocha'
import { createTestElasticPage, request } from '../util'
import { expect } from 'chai'
import { DateTime } from 'luxon'
import {
  createPubSubClient,
  PubSubRequestBody,
} from '../../src/datalayer/pubsub'
import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'
import { Integration, IntegrationType } from '../../src/entity/integration'
import { getRepository } from '../../src/entity/utils'
import { Highlight, Page, PageContext } from '../../src/elastic/types'
import nock from 'nock'
import { READWISE_API_URL } from '../../src/services/integrations'
import { addHighlightToPage } from '../../src/elastic/highlights'
import { getHighlightUrl } from '../../src/services/highlights'
import { deletePage } from '../../src/elastic/pages'

describe('Integrations routers', () => {
  let token: string

  describe('sync with integrations', () => {
    const endpoint = (token: string, type = 'type', action = 'action') =>
      `/svc/pubsub/integrations/${type}/${action}?token=${token}`
    let action: string
    let data: PubSubRequestBody
    let integrationType: string

    context('when token is invalid', () => {
      before(() => {
        token = 'invalid-token'
      })

      it('returns 400', async () => {
        return request.post(endpoint(token)).send(data).expect(400)
      })
    })

    context('when token is valid', () => {
      before(() => {
        token = process.env.PUBSUB_VERIFICATION_TOKEN!
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

        it('returns 400', async () => {
          return request.post(endpoint(token)).send(data).expect(400)
        })
      })

      context('when user exists', () => {
        let user: User

        before(async () => {
          user = await createTestUser('fakeUser')
        })

        after(async () => {
          await deleteTestUser(user.name)
        })

        context('when integration not found', () => {
          before(() => {
            integrationType = IntegrationType.Readwise
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
              .post(endpoint(token, integrationType))
              .send(data)
              .expect(200)
            expect(res.text).to.eql('No integration found')
          })
        })

        context('when integration is readwise and enabled', () => {
          let integration: Integration
          let ctx: PageContext
          let page: Page
          let highlight: Highlight
          let highlightsData: string

          before(async () => {
            integration = await getRepository(Integration).save({
              user: { id: user.id },
              type: IntegrationType.Readwise,
              token: 'token',
            })
            integrationType = integration.type
            // create page
            page = await createTestElasticPage(user.id)
            ctx = {
              uid: user.id,
              pubsub: createPubSubClient(),
              refresh: true,
            }
            // create highlight
            const highlightPositionPercent = 25
            highlight = {
              createdAt: new Date(),
              id: 'test id',
              patch: 'test patch',
              quote: 'test quote',
              shortId: 'test shortId',
              updatedAt: new Date(),
              userId: user.id,
              highlightPositionPercent,
            }
            await addHighlightToPage(page.id, highlight, ctx)
            // create highlights data for integration request
            highlightsData = JSON.stringify({
              highlights: [
                {
                  text: highlight.quote,
                  title: page.title,
                  author: page.author,
                  highlight_url: getHighlightUrl(page.slug, highlight.id),
                  highlighted_at: highlight.createdAt.toISOString(),
                  category: 'articles',
                  image_url: page.image,
                  location: highlightPositionPercent,
                  location_type: 'order',
                  note: highlight.annotation,
                  source_type: 'omnivore',
                  source_url: page.url,
                },
              ],
            })
          })

          after(async () => {
            await getRepository(Integration).delete(integration.id)
            await deletePage(page.id, ctx)
          })

          context('when action is sync_updated', () => {
            before(async () => {
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
                        id: page.id,
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
                  .post(endpoint(token, integrationType, action))
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
                    .post(endpoint(token, integrationType, action))
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
                        articleId: page.id,
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
                  .post(endpoint(token, integrationType, action))
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
              await getRepository(Integration).update(integration.id, {
                syncedAt: null,
                taskName: 'some task name',
              })
            })

            it('returns 200 with OK', async () => {
              const res = await request
                .post(endpoint(token, integrationType, action))
                .send(data)
                .expect(200)
              expect(res.text).to.eql('OK')
            })
          })
        })
      })
    })
  })
})
