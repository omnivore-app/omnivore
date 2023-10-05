import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import * as chai from 'chai'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import chaiString from 'chai-string'
import { deleteUser } from '../../src/services/user'

chai.use(chaiString)

const uploadImportFile = async (
  authToken: string,
  fileType: string,
  contentType: string
) => {
  const query = `
  mutation {
    uploadImportFile(type:${fileType}, contentType:"${contentType}") {
      ... on UploadImportFileError {
        errorCodes
      }
      ... on UploadImportFileSuccess {
        uploadSignedUrl
      }
    }
  }`

  return graphqlRequest(query, authToken).expect(200)
}

describe('uploadImportFile API', () => {
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

  describe('UploadImportFile', () => {
    context('when it is a pocket file', () => {
      xit('should create an upload URL', async () => {
        const res = await uploadImportFile(authToken, 'POCKET', 'text/csv')
        expect(res.body.data.uploadImportFile.uploadSignedUrl).to.not.be.null
      })
    })
    context('when it is a pocket file', () => {
      xit('should create an upload URL', async () => {
        const res = await uploadImportFile(authToken, 'URL_LIST', 'text/csv')
        expect(res.body.data.uploadImportFile.uploadSignedUrl).to.not.be.null
      })
    })
  })
})
