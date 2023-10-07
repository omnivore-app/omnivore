import { expect } from 'chai'
import 'mocha'
import { LibraryItem } from '../../src/entity/library_item'
import { User } from '../../src/entity/user'
import { deleteUser } from '../../src/services/user'
import { createTestLibraryItem, createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

describe('Update API', () => {
  let user: User
  let authToken: string
  let item: LibraryItem

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
    item = await createTestLibraryItem(user.id)
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('update page', () => {
    let query: string
    const title = 'New Title'
    const description = 'New Description'
    const previewImage = 'https://omnivore.app/image.png'

    beforeEach(() => {
      query = `
        mutation {
          updatePage(
            input: {
              pageId: "${item.id}"
              title: "${title}"
              description: "${description}"
              previewImage: "${previewImage}"
            }
          ) {
            ... on UpdatePageSuccess {
              updatedPage {
                title
                description
                image
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
      expect(updatedPage?.image).to.eql(previewImage)
    })
  })
})
