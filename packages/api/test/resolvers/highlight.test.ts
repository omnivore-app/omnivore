import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import 'mocha'
import { User } from '../../src/entity/user'
import { createHighlight } from '../../src/services/highlights'
import { updateLibraryItem } from '../../src/services/library_item'
import { deleteUser } from '../../src/services/user'
import { createTestLibraryItem, createTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'

chai.use(chaiString)

const createHighlightQuery = (
  linkId: string,
  highlightId: string,
  shortHighlightId: string,
  highlightPositionPercent = 0.0,
  highlightPositionAnchorIndex = 0,
  annotation = '_annotation',
  html: string | null = null,
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
        html: "${html}"
      }
    ) {
      ... on CreateHighlightSuccess {
        highlight {
          id
          highlightPositionPercent
          highlightPositionAnchorIndex
          annotation
          html
        }
      }
      ... on CreateHighlightError {
        errorCodes
      }
    }
  }
  `
}

const createHighlightQueryWithNoPositionInfo = (
  linkId: string,
  highlightId: string,
  shortHighlightId: string,
  annotation = '_annotation',
  html: string | null = null,
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
        annotation: "${annotation}"
        html: "${html}"
      }
    ) {
      ... on CreateHighlightSuccess {
        highlight {
          id
          highlightPositionPercent
          highlightPositionAnchorIndex
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

const updateHighlightQuery = ({
  highlightId,
  annotation = null,
  quote = null,
}: {
  highlightId: string
  annotation?: string | null
  quote?: string | null
}) => {
  return `
  mutation {
    updateHighlight(
      input: {
        annotation: "${annotation}",
        highlightId: "${highlightId}",
        quote: "${quote}"
      }
    ) {
      ... on UpdateHighlightSuccess {
        highlight {
          id
          annotation
          quote
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
  let itemId: string

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
    itemId = (await createTestLibraryItem(user.id)).id
  })

  after(async () => {
    await deleteUser(user.id)
  })

  context('createHighlightMutation', () => {
    it('does not fail', async () => {
      const highlightId = generateFakeUuid()
      const shortHighlightId = '_short_id'
      const highlightPositionPercent = 35.0
      const highlightPositionAnchorIndex = 15
      const html = '<p>test</p>'
      const query = createHighlightQuery(
        itemId,
        highlightId,
        shortHighlightId,
        highlightPositionPercent,
        highlightPositionAnchorIndex,
        '_annotation',
        html
      )
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.createHighlight.highlight.id).to.eq(highlightId)
      expect(
        res.body.data.createHighlight.highlight.highlightPositionPercent
      ).to.eq(highlightPositionPercent)
      expect(
        res.body.data.createHighlight.highlight.highlightPositionAnchorIndex
      ).to.eq(highlightPositionAnchorIndex)
      expect(res.body.data.createHighlight.highlight.html).to.eq(html)
    })

    context('when the annotation has HTML reserved characters', () => {
      it('unescapes the annotation and creates', async () => {
        const newHighlightId = generateFakeUuid()
        const newShortHighlightId = '_short_id_4'
        const highlightPositionPercent = 50.0
        const highlightPositionAnchorIndex = 25
        const query = createHighlightQuery(
          itemId,
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

    context('when no position info is sent', () => {
      it('nulls the position info', async () => {
        const newHighlightId = generateFakeUuid()
        const newShortHighlightId = '_short_id_4'
        const query = createHighlightQueryWithNoPositionInfo(
          itemId,
          newHighlightId,
          newShortHighlightId,
          '-> <-'
        )
        const res = await graphqlRequest(query, authToken).expect(200)
        console.log('nulls the position info: ', JSON.stringify(res.body.data))
        expect(res.body.data.createHighlight.id.to.eq(newHighlightId))
        expect(
          res.body.data.createHighlight.highlightPositionPercent.pos.to.be.null
        )
        expect(
          res.body.data.createHighlight.highlightPositionAnchorIndex.pos.to.be
            .null
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
      const query = createHighlightQuery(itemId, highlightId, shortHighlightId)
      await graphqlRequest(query, authToken).expect(200)
    })

    it('should not fail', async () => {
      const newHighlightId = generateFakeUuid()
      const newShortHighlightId = '_short_id_2'
      const highlightPositionPercent = 50.0
      const highlightPositionAnchorIndex = 25
      const query = mergeHighlightQuery(
        itemId,
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
      const highlight = await createHighlight(
        {
          libraryItem: { id: itemId },
          shortId: '_short_id_3',
          user,
        },
        itemId,
        user.id
      )
      highlightId = highlight.id
    })

    it('updates the quote when the quote is in HTML format when the annotation has HTML reserved characters', async () => {
      const quote = '> This is a test'
      const query = updateHighlightQuery({ highlightId, quote })
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(res.body.data.updateHighlight.highlight.quote).to.eql(quote)
    })

    it('updates the quote when the quote is in plain text format', async () => {
      const quote = 'This is a test'
      const query = updateHighlightQuery({ highlightId, quote })
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(res.body.data.updateHighlight.highlight.quote).to.eql(quote)
    })

    it('unescapes the annotation and updates the annotation when the annotation has HTML reserved characters', async () => {
      const annotation = '> This is a test'
      const query = updateHighlightQuery({
        highlightId,
        annotation,
      })
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(res.body.data.updateHighlight.highlight.annotation).to.eql(
        annotation
      )
    })
  })
})
