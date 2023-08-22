import {
  createTestLabel,
  createTestUser,
  deleteTestLabels,
  deleteTestUser,
} from '../db'
import {
  createTestElasticPage,
  generateFakeUuid,
  graphqlRequest,
  request,
} from '../util'
import { Label } from '../../src/entity/label'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import {
  Highlight,
  HighlightType,
  Page,
  PageContext,
} from '../../src/elastic/types'
import { getRepository } from '../../src/entity'
import { deletePage, getPageById } from '../../src/elastic/pages'
import { createPubSubClient } from '../../src/datalayer/pubsub'
import {
  addHighlightToPage,
  getHighlightById,
} from '../../src/elastic/highlights'
import { refreshIndex } from '../../src/elastic'

describe('Labels API', () => {
  let user: User
  let authToken: string
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
    // clean up
    await deleteTestUser(user.id)
  })

  describe('GET labels', () => {
    let labels: Label[]
    let query: string

    before(async () => {
      //  create testing labels
      const label1 = await createTestLabel(user, 'label_1', '#ffffff')
      const label2 = await createTestLabel(user, 'label_2', '#eeeeee')
      labels = [label1, label2]
    })

    after(async () => {
      // clean up
      await deleteTestLabels(
        user.id,
        labels.map((l) => l.id)
      )
    })

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

      const labels = await getRepository(Label).findBy({
        user: { id: user.id },
      })
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

      after(async () => {
        // clean up
        await deleteTestLabels(user.id, { name })
      })

      it('should create label', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        const label = await getRepository(Label).findOneBy({
          id: res.body.data.createLabel.label.id,
        })
        expect(label).to.exist
      })
    })

    context('when name exists', () => {
      let existingLabel: Label

      before(async () => {
        existingLabel = await createTestLabel(user, 'label3', '#ffffff')
        name = existingLabel.name
      })

      after(async () => {
        await deleteTestLabels(user.id, [existingLabel.id])
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
      let toDeleteLabel: Label

      context('when label is not used', () => {
        before(async () => {
          toDeleteLabel = await createTestLabel(
            user,
            'label not in use',
            '#ffffff'
          )
          labelId = toDeleteLabel.id
        })

        it('should delete label', async () => {
          await graphqlRequest(query, authToken).expect(200)
          const label = await getRepository(Label).findOneBy({ id: labelId })
          expect(label).not.exist
        })
      })

      context('when a page has this label', () => {
        let page: Page

        before(async () => {
          toDeleteLabel = await createTestLabel(user, 'page label', '#ffffff')
          labelId = toDeleteLabel.id
          page = await createTestElasticPage(user.id, [toDeleteLabel])
        })

        after(async () => {
          await deletePage(page.id, ctx)
        })

        it('should update page', async () => {
          await graphqlRequest(query, authToken).expect(200)
          await refreshIndex()

          const updatedPage = await getPageById(page.id)
          expect(updatedPage?.labels).not.deep.include(toDeleteLabel)
        })
      })

      context('when a highlight has this label', () => {
        const highlightId = generateFakeUuid()
        let page: Page

        before(async () => {
          page = await createTestElasticPage(user.id)
          toDeleteLabel = await createTestLabel(
            user,
            'highlight label',
            '#ffffff'
          )
          labelId = toDeleteLabel.id
          const highlight: Highlight = {
            id: highlightId,
            patch: 'test patch',
            quote: 'test quote',
            shortId: 'test shortId',
            userId: user.id,
            createdAt: new Date(),
            labels: [toDeleteLabel],
            updatedAt: new Date(),
            type: HighlightType.Highlight,
          }
          await addHighlightToPage(page.id, highlight, ctx)
        })

        after(async () => {
          await deletePage(page.id, ctx)
        })

        it('should update highlight', async () => {
          await graphqlRequest(query, authToken).expect(200)
          await refreshIndex()

          const updatedHighlight = await getHighlightById(highlightId)
          expect(updatedHighlight?.labels).not.deep.include(toDeleteLabel)
        })
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

  describe('Set labels', () => {
    let query: string
    let pageId: string
    let labelIds: string[] = []
    let labels: Label[]
    let page: Page

    before(async () => {
      //  create testing labels
      const label1 = await createTestLabel(user, 'label_1', '#ffffff')
      const label2 = await createTestLabel(user, 'label_2', '#eeeeee')
      labels = [label1, label2]
      page = await createTestElasticPage(user.id)
    })

    after(async () => {
      // clean up
      await deleteTestLabels(
        user.id,
        labels.map((l) => l.id)
      )
      await deletePage(page.id, ctx)
    })

    beforeEach(() => {
      query = `
        mutation {
          setLabels(
            input: {
              pageId: "${pageId}",
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

    context('when labels exists', () => {
      before(() => {
        pageId = page.id
        labelIds = [labels[0].id, labels[1].id]
      })

      it('should set labels', async () => {
        await graphqlRequest(query, authToken).expect(200)
        const page = await getPageById(pageId)
        expect(page?.labels?.map((l) => l.id)).to.eql(labelIds)
      })
    })

    context('when labels not exist', () => {
      before(() => {
        pageId = page.id
        labelIds = [generateFakeUuid(), generateFakeUuid()]
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.setLabels.errorCodes).to.eql(['NOT_FOUND'])
      })
    })

    context('when page not exist', () => {
      before(() => {
        pageId = generateFakeUuid()
        labelIds = [labels[0].id, labels[1].id]
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.setLabels.errorCodes).to.eql(['NOT_FOUND'])
      })
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

  describe('Update label', () => {
    let query: string
    let labelId: string
    let name: string
    let color: string

    beforeEach(() => {
      query = `
        mutation {
          updateLabel(
            input: {
              labelId: "${labelId}",
              name: "${name}",
              color: "${color}"
            }
          ) {
            ... on UpdateLabelSuccess {
              label {
                id
                name
                color
              }
            }
            ... on UpdateLabelError {
              errorCodes
            }
          }
        }
      `
    })

    context('when labels exists', () => {
      let toUpdateLabel: Label

      before(async () => {
        toUpdateLabel = await createTestLabel(user, 'label5', '#ffffff')
        labelId = toUpdateLabel.id
        name = 'Updated label'
        color = '#aabbcc'
      })

      after(async () => {
        await deleteTestLabels(user.id, [toUpdateLabel.id])
      })

      it('should return the updated label', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.updateLabel.label).to.eql({
          id: labelId,
          name,
          color,
        })
      })

      it('should update the label in db', async () => {
        await graphqlRequest(query, authToken).expect(200)
        const updatedLabel = await getRepository(Label).findOne({
          where: { id: labelId },
        })

        expect(updatedLabel?.name).to.eql(name)
        expect(updatedLabel?.color).to.eql(color)
      })

      context('when a page has the label', () => {
        let page: Page

        before(async () => {
          page = await createTestElasticPage(user.id, [toUpdateLabel])
        })

        after(async () => {
          await deletePage(page.id, ctx)
        })

        it('should update the page with the label', async () => {
          await graphqlRequest(query, authToken).expect(200)

          const updatedPage = await getPageById(page.id)
          const updatedLabel = updatedPage?.labels?.filter(
            (l) => l.id === labelId
          )?.[0]

          expect(updatedLabel?.name).to.eql(name)
          expect(updatedLabel?.color).to.eql(color)
        })
      })
    })

    context('when labels not exist', () => {
      before(() => {
        labelId = generateFakeUuid()
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.updateLabel.errorCodes).to.eql(['NOT_FOUND'])
      })
    })
  })

  describe('Set labels for highlight', () => {
    let query: string
    let highlightId: string
    let labelIds: string[] = []
    let labels: Label[]
    let page: Page

    before(async () => {
      //  create testing labels
      const label1 = await createTestLabel(user, 'label_1', '#ffffff')
      const label2 = await createTestLabel(user, 'label_2', '#eeeeee')
      labels = [label1, label2]
      page = await createTestElasticPage(user.id)
    })

    after(async () => {
      // clean up
      await deleteTestLabels(
        user.id,
        labels.map((l) => l.id)
      )
      await deletePage(page.id, ctx)
    })

    beforeEach(() => {
      query = `
        mutation {
          setLabelsForHighlight(
            input: {
              highlightId: "${highlightId}",
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

    context('when labels exists', () => {
      before(async () => {
        highlightId = generateFakeUuid()
        const highlight: Highlight = {
          createdAt: new Date(),
          id: highlightId,
          patch: 'test patch',
          quote: 'test quote',
          shortId: 'test shortId',
          userId: user.id,
          updatedAt: new Date(),
          type: HighlightType.Highlight,
        }
        await addHighlightToPage(page.id, highlight, ctx)
        labelIds = [labels[0].id, labels[1].id]
      })

      it('should set labels for highlight', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(
          res.body.data.setLabelsForHighlight.labels.map((l: any) => l.id)
        ).to.eql(labelIds)
      })
    })

    context('when labels not exist', () => {
      before(async () => {
        highlightId = generateFakeUuid()
        const highlight: Highlight = {
          createdAt: new Date(),
          id: highlightId,
          patch: 'test patch',
          quote: 'test quote',
          shortId: 'test shortId',
          userId: user.id,
          updatedAt: new Date(),
          type: HighlightType.Highlight,
        }
        await addHighlightToPage(page.id, highlight, ctx)
        labelIds = [generateFakeUuid(), generateFakeUuid()]
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.setLabelsForHighlight.errorCodes).to.eql([
          'NOT_FOUND',
        ])
      })
    })

    context('when highlight not exist', () => {
      before(() => {
        highlightId = generateFakeUuid()
        labelIds = [labels[0].id, labels[1].id]
      })

      it('should return error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.setLabelsForHighlight.errorCodes).to.eql([
          'NOT_FOUND',
        ])
      })
    })
  })

  describe('Move label', () => {
    const query = (labelId: string, afterLabelId: string): string => `
        mutation {
          moveLabel(
            input: {
              labelId: "${labelId}",
              afterLabelId: "${afterLabelId}"
            }
          ) {
            ... on MoveLabelSuccess {
              label {
                id
                position
              }
            }
            ... on MoveLabelError {
              errorCodes
            }
          }
        }
      `
    let labelId: string
    let afterLabelId: string
    let labels: Label[] = []

    before(async () => {
      //  create testing labels
      for (let i = 0; i < 5; i++) {
        const label = await createTestLabel(user, `label_${i}`, '#ffffff')
        labels.push(label)
      }
    })

    after(async () => {
      // clean up
      await deleteTestLabels(
        user.id,
        labels.map((l) => l.id)
      )
    })

    context('when label exists', () => {
      before(async () => {
        labelId = labels[1].id
        afterLabelId = labels[4].id
      })

      after(async () => {
        await graphqlRequest(query(labelId, labels[0].id), authToken).expect(
          200
        )
      })

      it('moves label after the pointed label', async () => {
        const res = await graphqlRequest(
          query(labelId, afterLabelId),
          authToken
        ).expect(200)
        expect(res.body.data.moveLabel.label.position).to.eql(
          labels[4].position
        )
        const reorderedLabels = await getRepository(Label).find({
          where: {
            user: { id: user.id },
          },
          order: { position: 'ASC' },
        })
        expect(reorderedLabels.map((l) => l.id)).to.eql([
          labels[0].id,
          labels[2].id,
          labels[3].id,
          labels[4].id,
          labels[1].id,
        ])
      })
    })

    context('when afterLabelId is null', () => {
      before(() => {
        labelId = labels[4].id
      })

      after(async () => {
        await graphqlRequest(query(labelId, labels[3].id), authToken).expect(
          200
        )
      })

      it('moves the label to the top', async () => {
        const res = await graphqlRequest(query(labelId, ''), authToken).expect(
          200
        )
        expect(res.body.data.moveLabel.label.position).to.eql(1)
      })
    })

    context('when label not exist', () => {
      before(() => {
        labelId = generateFakeUuid()
      })

      it('returns error code NOT_FOUND', async () => {
        const res = await graphqlRequest(query(labelId, ''), authToken).expect(
          200
        )
        expect(res.body.data.moveLabel.errorCodes).to.eql(['NOT_FOUND'])
      })
    })

    context('when after label not exist', () => {
      before(() => {
        labelId = labels[4].id
        afterLabelId = generateFakeUuid()
      })

      it('returns error code NOT_FOUND', async () => {
        const res = await graphqlRequest(
          query(labelId, afterLabelId),
          authToken
        ).expect(200)
        expect(res.body.data.moveLabel.errorCodes).to.eql(['NOT_FOUND'])
      })
    })
  })
})
