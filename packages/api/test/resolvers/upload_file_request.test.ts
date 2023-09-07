import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import 'mocha'
import { User } from '../../src/entity/user'
import {
  deleteLibraryItemById,
  findLibraryItemById,
} from '../../src/services/library_item'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'

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

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    await deleteUser(user.id)
  })

  describe('UploadFileRequest', () => {
    context('when create article is true', () => {
      const clientRequestId = generateFakeUuid()

      after(async () => {
        await deleteLibraryItemById(clientRequestId)
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
        const item = await findLibraryItemById(clientRequestId, user.id)
        expect(item).to.be
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
        const item = await findLibraryItemById(clientRequestId, user.id)
        expect(item?.originalUrl).to.startWith('https://')
      })
    })
  })
})
