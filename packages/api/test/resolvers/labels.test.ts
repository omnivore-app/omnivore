import {
  createTestLink,
  createTestPage,
  createTestUser,
  deleteTestUser,
} from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'
import { Link } from '../../src/entity/link'
import { Label } from '../../src/entity/label'
import { expect } from 'chai'
import { Page } from '../../src/entity/page'
import { getRepository } from 'typeorm'
import 'mocha'

describe('Labels API', () => {
  const username = 'fakeUser'

  let authToken: string
  let page: Page
  let link: Link
  let labels: Label[]

  before(async () => {
    // create test user and login
    const user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    //  create test label
    page = await createTestPage()
    link = await createTestLink(user, page)
    const label1 = await getRepository(Label)
      .create({
        name: 'label1',
        user: user,
        link: link,
      })
      .save()
    const label2 = await getRepository(Label)
      .create({
        name: 'label2',
        user: user,
        link: link,
      })
      .save()
    labels = [label1, label2]
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
  })

  describe('GET labels', () => {
    let query: string
    let linkId: string

    beforeEach(() => {
      query = `
        query {
          labels(linkId: "${linkId}") {
            ... on LabelsSuccess {
              labels {
                id
                name
              }
            }
            ... on LabelsError {
              errorCodes
            }
          }
        }
      `
    })

    context('when link exists', () => {
      before(() => {
        linkId = link.id
      })

      it('should return labels', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.labels.labels).to.eql(
          labels.map((label) => ({
            id: label.id,
            name: label.name,
          }))
        )
      }).timeout(5000)
    })

    context('when link not exist', () => {
      before(() => {
        linkId = generateFakeUuid()
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.labels.errorCodes).to.eql(['NOT_FOUND'])
      }).timeout(5000)
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        query {
          labels {}
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    }).timeout(5000)

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    }).timeout(5000)
  })

  describe('Create label', () => {
    let query: string
    let linkId: string

    beforeEach(() => {
      query = `
        mutation {
          createLabel(
            input: {
              linkId: "${linkId}",
              name: "label3"
            }
          ) {
            ... on CreateLabelSuccess {
              label {
                id
                name
              }
            }
            ... on CreateLabelError {
              errorCodes
            }
          }
        }
      `
    })

    context('when link exists', () => {
      before(() => {
        linkId = link.id
      })

      it('should create label', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        const label = await getRepository(Label).findOne(
          res.body.data.createLabel.label.id
        )
        expect(label).to.exist
      }).timeout(5000)
    })

    context('when link not exist', () => {
      before(() => {
        linkId = generateFakeUuid()
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.createLabel.errorCodes).to.eql(['NOT_FOUND'])
      }).timeout(5000)
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        mutation {
          createLabel {}
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    }).timeout(5000)

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    }).timeout(5000)
  })

  describe('Delete label', () => {
    let query: string
    let labelId: string

    beforeEach(() => {
      query = `
        mutation {
          deleteLabel(id: "${labelId}") {
            ... on DeleteLabelSuccess {
              label {
                id
                name
              }
            }
            ... on DeleteLabelError {
              errorCodes
            }
          }
        }
      `
    })

    context('when label exists', () => {
      before(() => {
        labelId = labels[0].id
      })

      it('should delete label', async () => {
        await graphqlRequest(query, authToken).expect(200)
        const label = await getRepository(Label).findOne(labelId)
        expect(label).to.not.exist
      }).timeout(5000)
    })

    context('when label not exist', () => {
      before(() => {
        labelId = generateFakeUuid()
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.deleteLabel.errorCodes).to.eql(['NOT_FOUND'])
      }).timeout(5000)
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        mutation {
          deleteLabel {}
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    }).timeout(5000)

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    }).timeout(5000)
  })
})
