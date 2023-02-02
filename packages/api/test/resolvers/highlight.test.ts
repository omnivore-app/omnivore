import { createTestUser, deleteTestUser } from '../db'
import {
  createTestElasticPage,
  generateFakeUuid,
  graphqlRequest,
  request,
} from '../util'
import * as chai from 'chai'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import chaiString from 'chai-string'
import { createPubSubClient } from '../../src/datalayer/pubsub'
import { PageContext } from '../../src/elastic/types'
import { deletePage, updatePage } from '../../src/elastic/pages'

chai.use(chaiString)

const createHighlightQuery = (
  authToken: string,
  linkId: string,
  highlightId: string,
  shortHighlightId: string,
  highlightPositionPercent = 0.0,
  highlightPositionAnchorIndex = 0,
  annotation = '_annotation',
  prefix = '_prefix',
  suffix = '_suffix',
  quote = '_quote',
  patch = '_patch'
) => {
  return `
  mutation {
    createHighlight(
      input: {
        prefix: "${prefix}",
        suffix: "${suffix}",
        quote: "${quote}",
        id: "${highlightId}",
        shortId: "${shortHighlightId}",
        patch: "${patch}",
        articleId: "${linkId}",
        highlightPositionPercent: ${highlightPositionPercent},
        highlightPositionAnchorIndex: ${highlightPositionAnchorIndex}
        annotation: "${annotation}"
      }
    ) {
      ... on CreateHighlightSuccess {
        highlight {
          id
          highlightPositionPercent
          highlightPositionAnchorIndex
          annotation
        }
      }
      ... on CreateHighlightError {
        errorCodes
      }
    }
  }
  `
}

const mergeHighlightQuery = (
  pageId: string,
  highlightId: string,
  shortHighlightId: string,
  overlapHighlightIdList: string[],
  highlightPositionPercent = 0.0,
  highlightPositionAnchorIndex = 0,
  prefix = '_prefix',
  suffix = '_suffix',
  quote = '_quote',
  patch = '_patch'
) => {
  return `
  mutation {
    mergeHighlight(
      input: {
        prefix: "${prefix}",
        suffix: "${suffix}",
        quote: "${quote}",
        id: "${highlightId}",
        shortId: "${shortHighlightId}",
        patch: "${patch}",
        articleId: "${pageId}",
        overlapHighlightIdList: "${overlapHighlightIdList}",
        highlightPositionPercent: ${highlightPositionPercent},
        highlightPositionAnchorIndex: ${highlightPositionAnchorIndex}
      }
    ) {
      ... on MergeHighlightSuccess {
        highlight {
          id
          highlightPositionPercent
          highlightPositionAnchorIndex
        }
      }
      ... on MergeHighlightError {
        errorCodes
      }
    }
  }
  `
}

const updateHighlightQuery = (
  authToken: string,
  highlightId: string,
  annotation = '_annotation'
) => {
  return `
  mutation {
    updateHighlight(
      input: {
        annotation: "${annotation}",
        highlightId: "${highlightId}",
      }
    ) {
      ... on UpdateHighlightSuccess {
        highlight {
          id
          annotation
        }
      }
      ... on UpdateHighlightError {
        errorCodes
      }
    }
  }
  `
}

describe('Highlights API', () => {
  let authToken: string
  let user: User
  let pageId: string
  let ctx: PageContext

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
    pageId = (await createTestElasticPage(user.id)).id
    ctx = { pubsub: createPubSubClient(), uid: user.id, refresh: true }
  })

  after(async () => {
    await deleteTestUser(user.id)
    if (pageId) {
      await deletePage(pageId, ctx)
    }
  })

  context('createHighlightMutation', () => {
    it('should not fail', async () => {
      const highlightId = generateFakeUuid()
      const shortHighlightId = '_short_id'
      const highlightPositionPercent = 35.0
      const highlightPositionAnchorIndex = 15
      const query = createHighlightQuery(
        authToken,
        pageId,
        highlightId,
        shortHighlightId,
        highlightPositionPercent,
        highlightPositionAnchorIndex
      )
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.createHighlight.highlight.id).to.eq(highlightId)
      expect(
        res.body.data.createHighlight.highlight.highlightPositionPercent
      ).to.eq(highlightPositionPercent)
      expect(
        res.body.data.createHighlight.highlight.highlightPositionAnchorIndex
      ).to.eq(highlightPositionAnchorIndex)
    })

    context('when the annotation has HTML reserved characters', () => {
      it('unescapes the annotation and creates', async () => {
        const newHighlightId = generateFakeUuid()
        const newShortHighlightId = '_short_id_4'
        const highlightPositionPercent = 50.0
        const highlightPositionAnchorIndex = 25
        const query = createHighlightQuery(
          authToken,
          pageId,
          newHighlightId,
          newShortHighlightId,
          highlightPositionPercent,
          highlightPositionAnchorIndex,
          '-> <-'
        )
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.createHighlight.highlight.annotation).to.eql(
          '-> <-'
        )
      })
    })
  })

  context('mergeHighlightMutation', () => {
    let highlightId: string

    before(async () => {
      // create test highlight
      highlightId = generateFakeUuid()
      const shortHighlightId = '_short_id_1'
      const query = createHighlightQuery(
        authToken,
        pageId,
        highlightId,
        shortHighlightId
      )
      await graphqlRequest(query, authToken).expect(200)
    })

    it('should not fail', async () => {
      const newHighlightId = generateFakeUuid()
      const newShortHighlightId = '_short_id_2'
      const highlightPositionPercent = 50.0
      const highlightPositionAnchorIndex = 25
      const query = mergeHighlightQuery(
        pageId,
        newHighlightId,
        newShortHighlightId,
        [highlightId],
        highlightPositionPercent,
        highlightPositionAnchorIndex
      )
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.mergeHighlight.highlight.id).to.eq(newHighlightId)
      expect(
        res.body.data.mergeHighlight.highlight.highlightPositionPercent
      ).to.eq(highlightPositionPercent)
      expect(
        res.body.data.mergeHighlight.highlight.highlightPositionAnchorIndex
      ).to.eq(highlightPositionAnchorIndex)
    })
  })

  describe('updateHighlightMutation', () => {
    let highlightId: string

    before(async () => {
      // create test highlight
      highlightId = generateFakeUuid()
      await updatePage(
        pageId,
        {
          highlights: [
            {
              id: highlightId,
              shortId: '_short_id_3',
              annotation: '',
              userId: user.id,
              patch: '',
              quote: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
        ctx
      )
    })

    context('when the annotation has HTML reserved characters', () => {
      it('unescapes the annotation and updates', async () => {
        const annotation = '> This is a test'
        const query = updateHighlightQuery(authToken, highlightId, annotation)
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.updateHighlight.highlight.annotation).to.eql(
          '> This is a test'
        )
      })
    })
  })
})
