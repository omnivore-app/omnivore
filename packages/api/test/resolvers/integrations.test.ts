import chai, { expect } from 'chai'
import 'mocha'
import nock from 'nock'
import sinonChai from 'sinon-chai'
import { Integration } from '../../src/entity/integration'
import { User } from '../../src/entity/user'
import { SetIntegrationErrorCode } from '../../src/generated/graphql'
import {
  deleteIntegrations,
  findIntegration,
  saveIntegration,
  updateIntegration,
} from '../../src/services/integrations'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'

chai.use(sinonChai)

describe('Integrations resolvers', () => {
  const READWISE_API_URL = 'https://readwise.io/api/v2'
  
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
    await deleteUser(loginUser.id)
  })

  describe('setIntegration API', () => {
    const validToken = 'valid-token'
    const query = (
      id = '',
      name = 'READWISE',
      token: string = 'test token',
      enabled = true
    ) => `
      mutation {
        setIntegration(input: {
          id: "${id}",
          name: "${name}",
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
    let integrationName: string
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
      integrationName = 'READWISE'
    })

    after(() => {
      scope.persist(false)
    })

    context('when id is not in the request', () => {
      before(() => {
        integrationId = ''
      })

      context('when token is invalid', () => {
        before(() => {
          token = 'invalid token'
          nock(READWISE_API_URL, {
            reqheaders: { Authorization: `Token ${token}` },
          })
            .get('/auth')
            .reply(401)
        })

        it('returns InvalidToken error code', async () => {
          const res = await graphqlRequest(
            query(integrationId, integrationName, token),
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
          await deleteIntegrations(loginUser.id, {
            user: { id: loginUser.id },
            name: integrationName,
          })
        })

        it('creates new integration', async () => {
          const res = await graphqlRequest(
            query(integrationId, integrationName, token),
            authToken
          )
          expect(res.body.data.setIntegration.integration.enabled).to.be.true
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
            query(integrationId, integrationName),
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
            existingIntegration = await saveIntegration(
              {
                user: { id: otherUser.id },
                name: 'READWISE',
                token: 'fakeToken',
              },
              otherUser.id
            )
            integrationId = existingIntegration.id
          })

          after(async () => {
            await deleteUser(otherUser.id)
            await deleteIntegrations(otherUser.id, [existingIntegration.id])
          })

          it('returns Unauthorized error code', async () => {
            const res = await graphqlRequest(
              query(integrationId, integrationName),
              authToken
            )
            expect(res.body.data.setIntegration.errorCodes).to.eql([
              SetIntegrationErrorCode.NotFound,
            ])
          })
        })

        context('when integration belongs to the user', () => {
          before(async () => {
            existingIntegration = await saveIntegration(
              {
                user: { id: loginUser.id },
                name: 'READWISE',
                token: 'fakeToken',
              },
              loginUser.id
            )
            integrationId = existingIntegration.id
          })

          after(async () => {
            await deleteIntegrations(loginUser.id, [existingIntegration.id])
          })

          context('when enable is false', () => {
            before(() => {
              enabled = false
            })

            afterEach(async () => {
              await updateIntegration(existingIntegration.id, {
                taskName: 'some task name',
                enabled: true,
              }, loginUser.id)
            })

            it('disables integration', async () => {
              const res = await graphqlRequest(
                query(integrationId, integrationName, token, enabled),
                authToken
              )
              expect(res.body.data.setIntegration.integration.enabled).to.be
                .false
            })
          })

          context('when enable is true', () => {
            before(() => {
              enabled = true
            })

            afterEach(async () => {
              await updateIntegration(existingIntegration.id, {
                taskName: null,
                enabled: false,
              }, loginUser.id)
            })

            it('enables integration', async () => {
              const res = await graphqlRequest(
                query(integrationId, integrationName, token, enabled),
                authToken
              )
              expect(res.body.data.setIntegration.integration.enabled).to.be
                .true
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
      existingIntegration = await saveIntegration(
        {
          user: { id: loginUser.id },
          name: 'READWISE',
          token: 'fakeToken',
        },
        loginUser.id
      )
    })

    after(async () => {
      await deleteIntegrations(loginUser.id, [existingIntegration.id])
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
        existingIntegration = await saveIntegration(
          {
            user: { id: loginUser.id },
            name: 'READWISE',
            token: 'fakeToken',
            taskName: 'some task name',
          },
          loginUser.id
        )
      })

      it('deletes the integration and cloud task', async () => {
        const res = await graphqlRequest(
          query(existingIntegration.id),
          authToken
        )
        const integration = await findIntegration({
          id: existingIntegration.id,
        }, loginUser.id)

        expect(res.body.data.deleteIntegration.integration).to.be.an('object')
        expect(res.body.data.deleteIntegration.integration.id).to.eql(
          existingIntegration.id
        )
        expect(integration).to.be.null
      })
    })
  })

  describe('importFromIntegration API', () => {
    const query = (integrationId: string) => `
      mutation {
        importFromIntegration(integrationId: "${integrationId}") {
          ... on ImportFromIntegrationSuccess {
            success
          }
          ... on ImportFromIntegrationError {
            errorCodes
          }
        }
      }
    `
    let existingIntegration: Integration

    context('when integration exists', () => {
      before(async () => {
        existingIntegration = await saveIntegration(
          {
            user: { id: loginUser.id },
            name: 'POCKET',
            token: 'fakeToken',
          },
          loginUser.id
        )
      })

      after(async () => {
        await deleteIntegrations(loginUser.id, [existingIntegration.id])
      })

      it('returns success and starts cloud task', async () => {
        const res = await graphqlRequest(
          query(existingIntegration.id),
          authToken
        ).expect(200)
        expect(res.body.data.importFromIntegration.success).to.be.true
        const integration = await findIntegration({
          id: existingIntegration.id,
        }, loginUser.id)
        expect(integration?.taskName).not.to.be.null
      })
    })

    context('when integration does not exist', () => {
      it('returns error', async () => {
        const invalidIntegrationId = generateFakeUuid()
        const res = await graphqlRequest(
          query(invalidIntegrationId),
          authToken
        ).expect(200)
        expect(res.body.data.importFromIntegration.errorCodes).to.eql([
          'UNAUTHORIZED',
        ])
      })
    })
  })

  describe('integration API', () => {
    const query = `
      query Integration ($name: String!) {
        integration(name: $name) {
          ... on IntegrationSuccess {
            integration {
              id
              type
              enabled
            }
          }
          ... on IntegrationError {
            errorCodes
          }
        }
      }
    `

    let existingIntegration: Integration

    before(async () => {
      existingIntegration = await saveIntegration(
        {
          user: { id: loginUser.id },
          name: 'READWISE',
          token: 'fakeToken',
        },
        loginUser.id
      )
    })

    after(async () => {
      await deleteIntegrations(loginUser.id, [existingIntegration.id])
    })

    it('returns the integration', async () => {
      const res = await graphqlRequest(query, authToken, {
        name: existingIntegration.name,
      })
      expect(res.body.data.integration.integration.id).to.equal(
        existingIntegration.id
      )
      expect(res.body.data.integration.integration.type).to.equal(
        existingIntegration.type
      )
      expect(res.body.data.integration.integration.enabled).to.equal(
        existingIntegration.enabled
      )
    })
  })
})
