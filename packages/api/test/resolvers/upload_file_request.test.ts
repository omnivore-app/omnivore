import { createTestUser, deleteTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'
import * as chai from 'chai'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import chaiString from 'chai-string'
import { PageContext } from '../../src/elastic/types'
import { createPubSubClient } from '../../src/pubsub'
import { deletePage, getPageById } from '../../src/elastic/pages'

chai.use(chaiString)

// INPUT
// clientRequestId?: InputMaybe<Scalars['String']>;
// contentType: Scalars['String'];
// createPageEntry?: InputMaybe<Scalars['Boolean']>;
// url: Scalars['String'];

const uploadFileRequest = async (
  authToken: string,
  inputUrl: string,
  clientRequestId: string,
  createPageEntry = true
) => {
  const query = `
  mutation {
    uploadFileRequest(
      input: {
        contentType: "application/pdf",
        clientRequestId: "${clientRequestId}",
        createPageEntry: ${createPageEntry},
        url: "${inputUrl}"
      }
    ) {
      ... on ArchiveLinkSuccess {
        linkId
      }
      ... on ArchiveLinkError {
        errorCodes
      }
    }
  }
  `
  return graphqlRequest(query, authToken).expect(200)
}

describe('uploadFileRequest API', () => {
  let authToken: string
  let user: User
  let ctx: PageContext

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    ctx = {
      pubsub: createPubSubClient(),
      refresh: true,
      uid: user.id,
    }
  })

  after(async () => {
    await deleteTestUser(user.id)
  })

  describe('UploadFileRequest', () => {
    context('when create article is true', () => {
      const clientRequestId = generateFakeUuid()

      after(async () => {
        await deletePage(clientRequestId, ctx)
      })

      xit('should create an article if create article is true', async () => {
        const res = await uploadFileRequest(
          authToken,
          'https://www.google.com',
          clientRequestId,
          true
        )
        expect(res.body.data.uploadFileRequest.createdPageId).to.eql(
          clientRequestId
        )
        const page = await getPageById(clientRequestId)
        expect(page).to.be
      })

      xit('should not save a file:// URL', async () => {
        const res = await uploadFileRequest(
          authToken,
          'file://foo.bar',
          clientRequestId,
          true
        )
        expect(res.body.data.uploadFileRequest.createdPageId).to.eql(
          clientRequestId
        )
        const page = await getPageById(clientRequestId)
        expect(page?.url).to.startWith('https://')
      })
    })
  })
})
