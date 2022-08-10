import { createTestUser, deleteTestUser } from '../db'
import { createTestElasticPage, graphqlRequest, request } from '../util'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import { Page } from '../../src/elastic/types'

describe('Update API', () => {
  const username = 'fakeUser'

  let user: User
  let authToken: string
  let page: Page

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
    page = await createTestElasticPage(user.id)
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
  })

  describe('update page', () => {
    let query: string
    let title = 'New Title'
    let description = 'New Description'

    beforeEach(() => {
      query = `
        mutation {
          updatePage(
            input: {
              pageId: "${page.id}"
              title: "${title}"
              description: "${description}"
            }
          ) {
            ... on UpdatePageSuccess {
              updatedPage {
                title
                description
              }
            }
            ... on UpdatePageError {
              errorCodes
            }
          }
        }
      `
    })

    it('should update page', async () => {
      const res = await graphqlRequest(query, authToken).expect(200)

      const updatedPage = res?.body.data.updatePage.updatedPage
      expect(updatedPage?.title).to.eql(title)
      expect(updatedPage?.description).to.eql(description)
    })
  })
})
