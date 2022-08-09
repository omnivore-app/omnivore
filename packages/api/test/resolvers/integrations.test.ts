import 'mocha'
import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'
import {
  IntegrationType,
  SetIntegrationErrorCode,
} from '../../src/generated/graphql'
import { expect } from 'chai'
import { getRepository } from '../../src/entity/utils'
import {
  Integration,
  IntegrationType as DataIntegrationType,
} from '../../src/entity/integration'
import nock from 'nock'
import { READWISE_API_URL } from '../../src/services/integrations'

describe('Integrations resolvers', () => {
  let loginUser: User
  let authToken: string

  before(async () => {
    // create test user and login
    loginUser = await createTestUser('loginUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: loginUser.email })

    authToken = res.body.authToken
  })

  after(async () => {
    await deleteTestUser(loginUser.name)
  })

  describe('setIntegration API', () => {
    const validToken = 'valid-token'
    const query = (
      id = '',
      type: IntegrationType = IntegrationType.Readwise,
      token: string = 'test token',
      enabled = true
    ) => `
      mutation {
        setIntegration(input: {
          id: "${id}",
          type: ${type},
          token: "${token}",
          enabled: ${enabled},
        }) {
          ... on SetIntegrationSuccess {
            integration {
              id
              enabled
            }
          }
          ... on SetIntegrationError {
            errorCodes
          }
        }
      }
    `
    let integrationId: string
    let token: string
    let integrationType: IntegrationType
    let enabled: boolean
    let scope: nock.Scope

    // mock Readwise Auth API
    before(() => {
      scope = nock(READWISE_API_URL, {
        reqheaders: { Authorization: `Token ${validToken}` },
      })
        .get('/auth')
        .reply(204)
        .persist()
    })

    after(() => {
      scope.persist(false)
    })

    context('when id is not in the request', () => {
      before(() => {
        integrationId = ''
      })

      context('when integration exists', () => {
        let existingIntegration: Integration

        before(async () => {
          existingIntegration = await getRepository(Integration).save({
            user: loginUser,
            type: DataIntegrationType.Readwise,
            token: 'fakeToken',
          })
          integrationType = existingIntegration.type
        })

        after(async () => {
          await getRepository(Integration).delete({
            id: existingIntegration.id,
          })
        })

        it('returns AlreadyExists error code', async () => {
          const res = await graphqlRequest(
            query(integrationId, integrationType),
            authToken
          )
          expect(res.body.data.setIntegration.errorCodes).to.eql([
            SetIntegrationErrorCode.AlreadyExists,
          ])
        })
      })

      context('when integration does not exist', () => {
        context('when token is invalid', () => {
          before(() => {
            token = 'invalid token'
          })

          it('returns InvalidToken error code', async () => {
            const res = await graphqlRequest(
              query(integrationId, integrationType, token),
              authToken
            )
            expect(res.body.data.setIntegration.errorCodes).to.eql([
              SetIntegrationErrorCode.InvalidToken,
            ])
          })
        })

        context('when token is valid', () => {
          before(() => {
            token = validToken
          })

          afterEach(async () => {
            await getRepository(Integration).delete({
              user: loginUser,
              type: integrationType,
            })
          })

          it('creates new integration', async () => {
            const res = await graphqlRequest(
              query(integrationId, integrationType, token),
              authToken
            )
            expect(res.body.data.setIntegration.integration.enabled).to.be.true
          })

          it('creates new cloud task to sync all existing articles and highlights', async () => {
            const res = await graphqlRequest(
              query(integrationId, integrationType, token),
              authToken
            )
            const integration = await getRepository(Integration).findOneBy({
              id: res.body.data.setIntegration.integration.id,
            })
            expect(integration?.taskName).not.to.be.null
          })
        })
      })
    })

    context('when id is in the request', () => {
      let existingIntegration: Integration

      context('when integration does not exist', () => {
        before(() => {
          integrationId = generateFakeUuid()
        })

        it('returns NotFound error code', async () => {
          const res = await graphqlRequest(
            query(integrationId, integrationType),
            authToken
          )
          expect(res.body.data.setIntegration.errorCodes).to.eql([
            SetIntegrationErrorCode.NotFound,
          ])
        })
      })

      context('when integration exists', () => {
        context('when integration does not belong to the user', () => {
          let otherUser: User

          before(async () => {
            otherUser = await createTestUser('otherUser')
            existingIntegration = await getRepository(Integration).save({
              user: otherUser,
              type: DataIntegrationType.Readwise,
              token: 'fakeToken',
            })
            integrationId = existingIntegration.id
          })

          after(async () => {
            await deleteTestUser(otherUser.name)
            await getRepository(Integration).delete({
              id: existingIntegration.id,
            })
          })

          it('returns Unauthorized error code', async () => {
            const res = await graphqlRequest(
              query(integrationId, integrationType),
              authToken
            )
            expect(res.body.data.setIntegration.errorCodes).to.eql([
              SetIntegrationErrorCode.Unauthorized,
            ])
          })
        })

        context('when integration belongs to the user', () => {
          before(async () => {
            existingIntegration = await getRepository(Integration).save({
              user: loginUser,
              type: DataIntegrationType.Readwise,
              token: 'fakeToken',
            })
            integrationId = existingIntegration.id
          })

          after(async () => {
            await getRepository(Integration).delete({
              id: existingIntegration.id,
            })
          })

          context('when enable is false', () => {
            before(() => {
              enabled = false
            })

            afterEach(async () => {
              await getRepository(Integration).update(existingIntegration.id, {
                taskName: 'some task name',
                enabled: true,
              })
            })

            it('disables integration', async () => {
              const res = await graphqlRequest(
                query(integrationId, integrationType, token, enabled),
                authToken
              )
              expect(res.body.data.setIntegration.integration.enabled).to.be
                .false
            })

            it('deletes cloud task', async () => {
              const res = await graphqlRequest(
                query(integrationId, integrationType, token, enabled),
                authToken
              )
              const integration = await getRepository(Integration).findOneBy({
                id: res.body.data.setIntegration.integration.id,
              })
              expect(integration?.taskName).to.be.null
            })
          })

          context('when enable is true', () => {
            before(() => {
              enabled = true
            })

            afterEach(async () => {
              await getRepository(Integration).update(existingIntegration.id, {
                taskName: null,
                enabled: false,
              })
            })

            it('enables integration', async () => {
              const res = await graphqlRequest(
                query(integrationId, integrationType, token, enabled),
                authToken
              )
              expect(res.body.data.setIntegration.integration.enabled).to.be
                .true
            })

            it('creates new cloud task to sync all existing articles and highlights', async () => {
              const res = await graphqlRequest(
                query(integrationId, integrationType, token, enabled),
                authToken
              )
              const integration = await getRepository(Integration).findOneBy({
                id: res.body.data.setIntegration.integration.id,
              })
              expect(integration?.taskName).not.to.be.null
            })
          })
        })
      })
    })
  })

  describe('integrations API', () => {
    const query = `
      query {
        integrations {
          ... on IntegrationsSuccess {
            integrations {
              id
              type
              enabled
            }
          }
        }
      }
    `

    let existingIntegration: Integration

    before(async () => {
      existingIntegration = await getRepository(Integration).save({
        user: loginUser,
        type: DataIntegrationType.Readwise,
        token: 'fakeToken',
      })
    })

    after(async () => {
      await getRepository(Integration).delete(existingIntegration.id)
    })

    it('returns all integrations', async () => {
      const res = await graphqlRequest(query, authToken)
      expect(res.body.data.integrations.integrations).to.have.length(1)
      expect(res.body.data.integrations.integrations[0].id).to.equal(
        existingIntegration.id
      )
      expect(res.body.data.integrations.integrations[0].type).to.equal(
        existingIntegration.type
      )
      expect(res.body.data.integrations.integrations[0].enabled).to.equal(
        existingIntegration.enabled
      )
    })
  })

  describe('deleteIntegration API', () => {
    const query = (id: string) => `
      mutation {
        deleteIntegration(id: "${id}") {
          ... on DeleteIntegrationSuccess {
            integration {
              id
            }
          }
          ... on DeleteIntegrationError {
            errorCodes
          }
        }
      }
    `

    context('when integration exists', () => {
      let existingIntegration: Integration

      beforeEach(async () => {
        existingIntegration = await getRepository(Integration).save({
          user: loginUser,
          type: DataIntegrationType.Readwise,
          token: 'fakeToken',
          taskName: 'some task name',
        })
      })

      it('deletes the integration and cloud task', async () => {
        const res = await graphqlRequest(
          query(existingIntegration.id),
          authToken
        )
        const integration = await getRepository(Integration).findOneBy({
          id: existingIntegration.id,
        })

        expect(res.body.data.deleteIntegration.integration).to.be.an('object')
        expect(res.body.data.deleteIntegration.integration.id).to.eql(
          existingIntegration.id
        )
        expect(integration).to.be.null
      })
    })
  })
})
