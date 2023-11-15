import { expect } from 'chai'
import 'mocha'
import { LibraryItem } from '../../src/entity/library_item'
import { ContentDisplayReport } from '../../src/entity/reports/content_display_report'
import { User } from '../../src/entity/user'
import { ReportType } from '../../src/generated/graphql'
import { getRepository } from '../../src/repository'
import { deleteUser } from '../../src/services/user'
import { createTestLibraryItem, createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

describe('Report API', () => {
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

    // create a page
    item = await createTestLibraryItem(user.id)
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('reportItem', () => {
    let pageId: string
    let reportTypes: ReportType[]
    let query: string

    beforeEach(() => {
      query = `
        mutation {
          reportItem(
            input: {
              pageId: "${pageId}",
              itemUrl: "test url"
              reportTypes: [${reportTypes}],
              reportComment: "test comment"
            }
          ) {
            message
          }
        }
      `
    })

    context('when page exists and report is content display', () => {
      before(() => {
        pageId = item.id
        reportTypes = [ReportType.ContentDisplay]
      })

      it('should report an item', async () => {
        await graphqlRequest(query, authToken).expect(200)

        const report = await getRepository(ContentDisplayReport).findOneBy({
          libraryItemId: item.id,
        })
        expect(report).to.exist
      })
    })
  })
})
