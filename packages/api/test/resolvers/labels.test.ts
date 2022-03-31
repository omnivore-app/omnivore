import { createTestLabel, createTestUser, deleteTestUser } from '../db'
import {
  createTestElasticPage,
  generateFakeUuid,
  graphqlRequest,
  request,
} from '../util'
import { Label } from '../../src/entity/label'
import { expect } from 'chai'
import { getRepository } from 'typeorm'
import 'mocha'
import { User } from '../../src/entity/user'
import { Page } from '../../src/elastic/types'
import { getPageById } from '../../src/elastic'

describe('Labels API', () => {
  const username = 'fakeUser'

  let user: User
  let authToken: string
  let page: Page
  let labels: Label[]

  before(async () => {
    try {
      // create test user and login
      user = await createTestUser(username)
      const res = await request
        .post('/local/debug/fake-user-login')
        .send({ fakeEmail: user.email })

      authToken = res.body.authToken

      //  create testing labels
      const label1 = await createTestLabel(user, 'label_1', '#ffffff')
      const label2 = await createTestLabel(user, 'label_2', '#eeeeee')
      labels = [label1, label2]

      // create a page with label
      const existingLabelOfLink = await createTestLabel(
        user,
        'different_label',
        '#dddddd'
      )
      page = await createTestElasticPage(user, [existingLabelOfLink])
      console.log('created elastic page', page)
    } catch (err) {
      console.log('error in setup', err)
    }
  })

  after(async () => {
    // clean up
    try {
      await deleteTestUser(username)
    } catch (err) {
      console.log('error in cleanup', err)
    }
  })

  describe('GET labels', () => {
    let query: string

    beforeEach(() => {
      query = `
        query {
          labels {
            ... on LabelsSuccess {
              labels {
                id
                name
                color
                description
                createdAt
              }
            }
            ... on LabelsError {
              errorCodes
            }
          }
        }
      `
    })

    it('should return labels', async () => {
      const res = await graphqlRequest(query, authToken).expect(200)

      const labels = await getRepository(Label).find({ where: { user } })
      expect(res.body.data.labels.labels).to.eql(
        labels.map((label) => ({
          id: label.id,
          name: label.name,
          color: label.color,
          description: label.description,
          createdAt: new Date(label.createdAt.setMilliseconds(0)).toISOString(),
        }))
      )
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        query {
          labels {}
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
  })

  describe('Create label', () => {
    let query: string
    let name: string

    beforeEach(() => {
      query = `
        mutation {
          createLabel(
            input: {
              color: "#ffffff"
              name: "${name}"
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

    context('when name not exists', () => {
      before(() => {
        name = 'label3'
      })

      it('should create label', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        const label = await getRepository(Label).findOne(
          res.body.data.createLabel.label.id
        )
        expect(label).to.exist
      })
    })

    context('when name exists', () => {
      before(() => {
        name = labels[0].name
      })

      it('should return error code LABEL_ALREADY_EXISTS', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.createLabel.errorCodes).to.eql([
          'LABEL_ALREADY_EXISTS',
        ])
      })
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        mutation {
          createLabel {}
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
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
      before(async () => {
        const toDeleteLabel = await createTestLabel(user, 'label4', '#ffffff')
        labelId = toDeleteLabel.id
      })

      it('should delete label', async () => {
        await graphqlRequest(query, authToken).expect(200)
        const label = await getRepository(Label).findOne(labelId)
        expect(label).to.not.exist
      })
    })

    context('when label not exist', () => {
      before(() => {
        labelId = generateFakeUuid()
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.deleteLabel.errorCodes).to.eql(['NOT_FOUND'])
      })
    })

    context('error states', () => {
      it('responds status code 400 when invalid query', async () => {
        const invalidQuery = `
          mutation {
            deleteLabel {}
          }
        `
        return graphqlRequest(invalidQuery, authToken).expect(400)
      })

      it('responds status code 500 when invalid user', async () => {
        const invalidAuthToken = 'Fake token'
        return graphqlRequest(query, invalidAuthToken).expect(500)
      })
    })
  })

  describe('Set labels', () => {
    let query: string
    let pageId: string
    let labelIds: string[] = []

    beforeEach(() => {
      query = `
        mutation {
          setLabels(
            input: {
              linkId: "${pageId}",
              labelIds: [
                "${labelIds[0]}",
                "${labelIds[1]}"
              ]
            }
          ) {
            ... on SetLabelsSuccess {
              labels {
                id
                name
              }
            }
            ... on SetLabelsError {
              errorCodes
            }
          }
        }
      `
    })

    // context('when labels exists', () => {
    //   before(() => {
    //     pageId = page.id
    //     labelIds = [labels[0].id, labels[1].id]
    //   })

    //   it('should set labels', async () => {
    //     await graphqlRequest(query, authToken).expect(200)
    //     return new Promise((resolve, reject) => {
    //       setTimeout(async () => {
    //         const page = await getPageById(pageId)
    //         console.log('got page', page, pageId)
    //         expect(page?.labels?.map((l) => l.id)).to.eql(labelIds)
    //         resolve()
    //       }, 1000)
    //     })
    //   })
    // })

    context('when labels not exist', () => {
      before(() => {
        console.log('page id', page)
        pageId = page.id
        labelIds = [generateFakeUuid(), generateFakeUuid()]
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.setLabels.errorCodes).to.eql(['NOT_FOUND'])
      })
    })

    context('when link not exist', () => {
      before(() => {
        pageId = generateFakeUuid()
        labelIds = [labels[0].id, labels[1].id]
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.setLabels.errorCodes).to.eql(['NOT_FOUND'])
      })
    })

    context('invalid request', () => {
      before(() => {
        pageId = generateFakeUuid()
        labelIds = [labels[0].id, labels[1].id]
      })
      it('responds status code 400 when invalid query', async () => {
        const invalidQuery = `
          mutation {
            setLabels {}
          }
        `
        return graphqlRequest(invalidQuery, authToken).expect(400)
      })

      it('responds status code 500 when invalid user', async () => {
        const invalidAuthToken = 'Fake token'
        return graphqlRequest(query, invalidAuthToken).expect(500)
      })
    })
  })
})
