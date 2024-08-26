import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import 'mocha'
import sinon from 'sinon'
import { DeepPartial } from 'typeorm'
import { Group } from '../../src/entity/groups/group'
import { Highlight } from '../../src/entity/highlight'
import { Label } from '../../src/entity/label'
import {
  DirectionalityType,
  LibraryItem,
  LibraryItemState,
} from '../../src/entity/library_item'
import { UploadFile } from '../../src/entity/upload_file'
import { User } from '../../src/entity/user'
import {
  ArticleSavingRequestStatus,
  BulkActionType,
  HighlightType,
  PageType,
  SyncUpdatedItemEdge,
  UpdateReason,
  UploadFileStatus,
} from '../../src/generated/graphql'
import { getRepository } from '../../src/repository'
import { createGroup, deleteGroup } from '../../src/services/groups'
import { createLabel, deleteLabels } from '../../src/services/labels'
import {
  countLibraryItems,
  createLibraryItems,
  createOrUpdateLibraryItem,
  CreateOrUpdateLibraryItemArgs,
  deleteLibraryItemById,
  deleteLibraryItemByUrl,
  deleteLibraryItems,
  deleteLibraryItemsByUserId,
  findLibraryItemById,
  findLibraryItemByUrl,
  softDeleteLibraryItem,
  updateLibraryItem,
} from '../../src/services/library_item'
import { deleteUser } from '../../src/services/user'
import * as createTask from '../../src/utils/createTask'
import * as uploads from '../../src/utils/uploads'
import {
  createHighlight,
  createTestLibraryItem,
  createTestUser,
  saveLabelsInLibraryItem,
} from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'

chai.use(chaiString)

const archiveLink = async (authToken: string, linkId: string) => {
  const query = `
  mutation {
    setLinkArchived(
      input: {
        linkId: "${linkId}",
        archived: true
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

const createArticleQuery = (
  url: string,
  source: string,
  document: string,
  title: string
) => {
  return `
  mutation {
    createArticle(input: {
      url: "${url}"
      source: "${source}"
      preparedDocument: {
        document: "${document}"
        pageInfo: {
          contentType: "text/html"
          title: "${title}"
        }
      }
    }) {
      ... on CreateArticleSuccess {
        createdArticle {
          id
          title
          content
          isArchived
        }
        user {
          id
          name
        }
        created
      }
      ... on CreateArticleError {
        errorCodes
      }
    }
  }
  `
}

const getArticleQuery = (slug: string) => {
  return `
  query {
    article(slug: "${slug}", username: "") {
      ... on ArticleSuccess {
        article {
          id
          slug
          content
          directionality
          highlights {
            id
            shortId
            quote
            prefix
            suffix
            patch
            annotation
            sharedAt
            createdAt
            updatedAt
          }
        }
      }
      ... on ArticleError {
        errorCodes
      }
    }
  }
  `
}

const searchQuery = (keyword = '') => {
  return `
  query {
    search(
      after: ""
      first: 5
      query: "${keyword}") {
      ... on SearchSuccess {
        edges {
          cursor
          node {
            id
            url
            createdAt
            updatedAt
            directionality
            highlights {
              id
            }
            labels {
              id
              name
            }
            recommendations {
              name
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
          totalCount
        }
      }
      ... on SearchError {
        errorCodes
      }
    }
  }
  `
}

const savePageQuery = `
    mutation SavePage($input: SavePageInput!) {
      savePage(input: $input) {
        ... on SaveSuccess {
          url
        }
        ... on SaveError {
          errorCodes
        }
      }
    }`

const saveFileQuery = (
  clientRequestId: string,
  url: string,
  uploadFileId: string
) => {
  return `
    mutation {
      saveFile (
        input: {
          url: "${url}",
          source: "test",
          clientRequestId: "${clientRequestId}",
          uploadFileId: "${uploadFileId}",
        }
      ) {
        ... on SaveSuccess {
          url
        }
        ... on SaveError {
          errorCodes
        }
      }
    }
    `
}

const saveUrlQuery = (
  url: string,
  state: ArticleSavingRequestStatus | null = null,
  labels: string[] | null = null
) => {
  return `
    mutation {
      saveUrl(
        input: {
          url: "${url}",
          source: "test",
          clientRequestId: "${generateFakeUuid()}",
          state: ${state ?? 'null'},
          labels: ${
            labels
              ? '[' +
                labels.map((label) => `{ name: "${label}" }`).join(',') +
                ']'
              : 'null'
          }
        }
      ) {
        ... on SaveSuccess {
          url
        }
        ... on SaveError {
          errorCodes
        }
      }
    }
    `
}

const setBookmarkQuery = (articleId: string, bookmark: boolean) => {
  return `
    mutation {
      setBookmarkArticle(
        input: {
          articleID: "${articleId}",
          bookmark: ${String(bookmark)}
        }
      ) {
        ... on SetBookmarkArticleSuccess {
          bookmarkedArticle {
            id
          }
        }
        ... on SetBookmarkArticleError {
          errorCodes
        }
      }
    }
    `
}

const saveArticleReadingProgressQuery = (
  articleId: string,
  progress: number,
  topPercent: number | null = null,
  force: boolean | null = null
) => {
  return `
    mutation {
      saveArticleReadingProgress(
        input: {
          id: "${articleId}",
          readingProgressPercent: ${progress},
          readingProgressAnchorIndex: 0,
          readingProgressTopPercent: ${topPercent ?? 'null'},
          force: ${String(force) ?? 'null'}
        }
      ) {
        ... on SaveArticleReadingProgressSuccess {
          updatedArticle {
            id
            readingProgressPercent
            readAt
            readingProgressTopPercent
          }
        }
        ... on SaveArticleReadingProgressError {
          errorCodes
        }
      }
    }
    `
}

const typeaheadSearchQuery = (keyword: string) => {
  return `
  query {
    typeaheadSearch(query: "${keyword}") {
      ... on TypeaheadSearchSuccess {
        items {
          id
          slug
          title
          contentReader
        }
      }
      ... on TypeaheadSearchError {
        errorCodes
      }
    }
  }
  `
}

describe('Article API', () => {
  let authToken: string
  let user: User

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken as string
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('CreateArticle', () => {
    let query = ''
    let url = ''
    let source = ''
    let document = ''
    let title = ''
    let itemId = ''

    beforeEach(() => {
      query = createArticleQuery(url, source, document, title)
    })

    context('when saving from document', () => {
      before(() => {
        url = 'https://blog.omnivore.app/p/testing-is-fun-with-omnivore'
        source = 'puppeteer-parse'
        document = '<p>test</p>'
        title = 'new title'
      })

      after(async () => {
        await deleteLibraryItemById(itemId, user.id)
      })

      it('should create an article', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.createArticle.createdArticle.title).to.eql(title)
        itemId = res.body.data.createArticle.createdArticle.id as string
      })
    })

    context('when saving an archived article', () => {
      before(async () => {
        url = 'https://blog.omnivore.app/saving-archived-article.com'
        source = 'puppeteer-parse'
        document = '<p>test</p>'
        title = 'new title'

        const item = await createOrUpdateLibraryItem(
          {
            readableContent: document,
            slug: 'test saving an archived article slug',
            title,
            user: { id: user.id },
            originalUrl: url,
            archivedAt: new Date(),
            state: LibraryItemState.Archived,
          },
          user.id,
          undefined,
          true
        )
        itemId = item.id
      })

      after(async () => {
        await deleteLibraryItemById(itemId, user.id)
      })

      it('unarchives the article', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.createArticle.createdArticle.isArchived).to.false
      })
    })
  })

  describe('GetArticle', () => {
    const realSlug = 'testing-is-really-fun-with-omnivore'

    let query = ''
    let slug = ''
    let itemId: string

    before(async () => {
      const itemToCreate: CreateOrUpdateLibraryItemArgs = {
        title: 'test title',
        slug: realSlug,
        readingProgressTopPercent: 100,
        user,
        originalUrl: 'https://blog.omnivore.app/test-with-omnivore',
        directionality: DirectionalityType.RTL,
      }
      const item = await createOrUpdateLibraryItem(
        itemToCreate,
        user.id,
        undefined,
        true
      )
      itemId = item.id

      // save highlights
      await createHighlight(
        {
          shortId: 'test short id',
          patch: 'test patch',
          quote: 'test quote',
          user,
          libraryItem: item,
        },
        itemId,
        user.id
      )
    })

    after(async () => {
      await deleteLibraryItemById(itemId, user.id)
    })

    beforeEach(() => {
      query = getArticleQuery(slug)
    })

    context('when item exists', () => {
      before(() => {
        slug = realSlug
      })

      it('should return the item', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.article.article.slug).to.eql(slug)
        expect(res.body.data.article.article.directionality).to.eql(
          DirectionalityType.RTL
        )
      })

      it('should return highlights', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.article.article.highlights).to.length(1)
      })

      context('when item is failed to process', () => {
        before(async () => {
          await updateLibraryItem(
            itemId,
            {
              state: LibraryItemState.Processing,
              savedAt: new Date(Date.now() - 1000 * 60),
            },
            user.id
          )
        })

        it('should return unable to parse', async () => {
          const res = await graphqlRequest(query, authToken).expect(200)

          expect(res.body.data.article.article.content).to.eql(
            '<p>We were unable to parse this page.</p>'
          )
        })
      })
    })

    context('query with id instead of slug', () => {
      before(() => {
        slug = itemId
      })

      it('returns the item', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.article.article.id).to.eql(slug)
      })
    })

    context('when item does not exist', () => {
      before(() => {
        slug = 'not-a-real-slug'
      })

      it('should return an error', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.article.errorCodes).to.eql(['NOT_FOUND'])
      })
    })
  })

  describe('SavePage', () => {
    const title = 'Example Title'
    let url = 'https://blog.omnivore.app'
    const originalContent =
      '<html dir="rtl"><body><div>Example Content</div></body></html>'
    const source = 'puppeteer-parse'

    context('when we save a new item', () => {
      after(async () => {
        await deleteLibraryItemByUrl(url, user.id)
      })

      it('should return a slugged url', async () => {
        const res = await graphqlRequest(savePageQuery, authToken, {
          input: {
            url,
            originalContent,
            title,
            clientRequestId: generateFakeUuid(),
            source,
          },
        }).expect(200)
        expect(res.body.data.savePage.url).to.startsWith(
          'http://localhost:3000/fakeUser/example-title-'
        )
      })
    })

    context('when we save a item that is already archived', () => {
      before(() => {
        url = 'https://blog.omnivore.app/new-url'
      })

      after(async () => {
        await deleteLibraryItemByUrl(url, user.id)
      })

      it('it should return that item in the Search Query', async () => {
        const variables = {
          input: {
            url,
            originalContent,
            title,
            clientRequestId: generateFakeUuid(),
            source,
          },
        }
        await graphqlRequest(savePageQuery, authToken, variables).expect(200)

        // Save a link, then archive it
        let allLinks = await graphqlRequest(
          searchQuery('in:inbox'),
          authToken
        ).expect(200)
        const justSavedId = allLinks.body.data.search.edges[0].node.id as string
        await archiveLink(authToken, justSavedId)

        // test the negative case, ensuring the archive link wasn't returned
        allLinks = await graphqlRequest(
          searchQuery('in:inbox'),
          authToken
        ).expect(200)
        expect(allLinks.body.data.search.edges[0]?.node?.url).to.not.eq(url)

        // Now save the link again, and ensure it is returned
        await graphqlRequest(savePageQuery, authToken, variables).expect(200)

        allLinks = await graphqlRequest(
          searchQuery('in:inbox'),
          authToken
        ).expect(200)
        expect(allLinks.body.data.search.edges[0].node.id).to.eq(justSavedId)
        expect(allLinks.body.data.search.edges[0].node.url).to.eq(url)
        expect(allLinks.body.data.search.edges[0].node.directionality).to.eq(
          'RTL'
        )
      })
    })

    context('when we also want to save labels and archives the item', () => {
      before(() => {
        url = 'https://blog.omnivore.app/new-url-2'
      })

      after(async () => {
        await deleteLibraryItemByUrl(url, user.id)
      })

      it('saves the labels and archives the item', async () => {
        const state = ArticleSavingRequestStatus.Archived
        const labels = [{ name: 'test name' }, { name: 'test name 2' }]
        await graphqlRequest(savePageQuery, authToken, {
          input: {
            url,
            state,
            labels,
            originalContent,
            clientRequestId: generateFakeUuid(),
            source,
          },
        }).expect(200)

        const savedItem = await findLibraryItemByUrl(url, user.id)
        expect(savedItem?.archivedAt).to.not.be.null
        expect(savedItem?.labels?.map((l) => l.name)).to.include.members(
          labels.map((l) => l.name)
        )
      })
    })

    context('when the source is rss-feeder and url is from youtube.com', () => {
      const source = 'rss-feeder'
      const stub = sinon.stub(createTask, 'enqueueFetchContentJob')
      sinon.stub(createTask, 'enqueueProcessYouTubeVideo')

      before(() => {
        url = 'https://www.youtube.com/watch?v=123'
      })

      after(async () => {
        await deleteLibraryItemByUrl(url, user.id)
        sinon.restore()
      })

      it('does not parse in the backend', async () => {
        await graphqlRequest(savePageQuery, authToken, {
          input: {
            url,
            source,
            originalContent,
            clientRequestId: generateFakeUuid(),
          },
        }).expect(200)

        expect(stub).not.to.have.been.called
      })
    })
  })

  describe('SaveUrl', () => {
    let query = ''
    const url = 'https://blog.omnivore.app/new-url-1'

    before(() => {
      sinon.replace(
        createTask,
        'enqueueFetchContentJob',
        sinon.fake.resolves('')
      )
    })

    beforeEach(() => {
      query = saveUrlQuery(url)
    })

    after(() => {
      sinon.restore()
    })

    afterEach(async () => {
      await deleteLibraryItemByUrl(url, user.id)
    })

    context('when we save a new url', () => {
      it('should return a slugged url', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.saveUrl.url).to.startsWith(
          'http://localhost:3000/fakeUser/links/'
        )
      })
    })
  })

  describe('setBookmarkArticle', () => {
    let itemId: string

    before(async () => {
      const itemToSave: CreateOrUpdateLibraryItemArgs = {
        user,
        title: 'test title',
        readableContent: '<p>test</p>',
        originalUrl: 'https://blog.omnivore.app/setBookmarkArticle',
        slug: 'test-with-omnivore',
      }
      const item = await createOrUpdateLibraryItem(
        itemToSave,
        user.id,
        undefined,
        true
      )
      itemId = item.id
    })

    after(async () => {
      await deleteLibraryItemById(itemId, user.id)
    })

    it('soft deletes the item', async () => {
      await graphqlRequest(setBookmarkQuery(itemId, false), authToken).expect(
        200
      )
      const item = await findLibraryItemById(itemId, user.id)
      expect(item?.state).to.eql(LibraryItemState.Deleted)
    })
  })

  describe('saveArticleReadingProgressResolver', () => {
    let query = ''
    let itemId = ''
    const progress = 0.5
    const topPercent: number | null = null

    before(async () => {
      itemId = (await createTestLibraryItem(user.id)).id
    })

    after(async () => {
      await deleteLibraryItemById(itemId, user.id)
    })

    it('saves a reading progress on an article', async () => {
      query = saveArticleReadingProgressQuery(itemId, progress, topPercent)
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(
        res.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressPercent
      ).to.eq(progress)
      expect(res.body.data.saveArticleReadingProgress.updatedArticle.readAt).not
        .null
    })

    it('should not allow setting the reading progress lower than current progress', async () => {
      const firstQuery = saveArticleReadingProgressQuery(itemId, 75)
      const firstRes = await graphqlRequest(firstQuery, authToken).expect(200)
      expect(
        firstRes.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressPercent
      ).to.eq(75)

      // Now try to set to a lower value (50), value should not be updated
      const secondQuery = saveArticleReadingProgressQuery(itemId, 50)
      const secondRes = await graphqlRequest(secondQuery, authToken).expect(200)
      expect(
        secondRes.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressPercent
      ).to.eq(75)
    })

    it('does not save topPercent if not undefined', async () => {
      query = saveArticleReadingProgressQuery(itemId, progress, null)
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(
        res.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressTopPercent
      ).to.eq(0)
    })

    it('saves topPercent if defined', async () => {
      const topPercent = 0.2
      query = saveArticleReadingProgressQuery(itemId, progress, topPercent)
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(
        res.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressTopPercent
      ).to.eql(topPercent)
    })

    it('saves topPercent as 0 if defined as 0', async () => {
      const topPercent = 0
      query = saveArticleReadingProgressQuery(
        itemId,
        progress,
        topPercent,
        true
      )
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(
        res.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressTopPercent
      ).to.eql(topPercent)
    })

    it('returns BAD_DATA error if top position is greater than bottom position', async () => {
      query = saveArticleReadingProgressQuery(itemId, 0.5, 0.8)
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(res.body.data.saveArticleReadingProgress.errorCodes).to.eql([
        'BAD_DATA',
      ])
    })

    context('when force is true', () => {
      before(async () => {
        itemId = (
          await createOrUpdateLibraryItem(
            {
              user: { id: user.id },
              originalUrl: 'https://blog.omnivore.app/setBookmarkArticle',
              slug: 'test-with-omnivore',
              readableContent: '<p>test</p>',
              title: 'test title',
              readingProgressBottomPercent: 100,
              readingProgressTopPercent: 80,
            },
            user.id,
            undefined,
            true
          )
        ).id
      })

      after(async () => {
        await deleteLibraryItemById(itemId, user.id)
      })

      it('ignore position check if force is true', async () => {
        query = saveArticleReadingProgressQuery(itemId, 20, 10, true)
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(
          res.body.data.saveArticleReadingProgress.updatedArticle
            .readingProgressPercent
        ).to.eql(20)
        expect(
          res.body.data.saveArticleReadingProgress.updatedArticle
            .readingProgressTopPercent
        ).to.eql(10)
      })
    })
  })

  describe('SaveFile', () => {
    let query = ''
    let url = ''
    let uploadFileId = ''
    let itemId = ''

    before(async () => {
      const item = await createOrUpdateLibraryItem(
        {
          user: { id: user.id },
          originalUrl: 'https://blog.omnivore.app/setBookmarkArticle',
          slug: 'test-with-omnivore',
          readableContent: '<p>test</p>',
          title: 'test title',
          readingProgressBottomPercent: 100,
          readingProgressTopPercent: 80,
        },
        user.id,
        undefined,
        true
      )
      itemId = item.id

      sinon.replace(
        uploads,
        'getStorageFileDetails',
        sinon.fake.resolves({ fileUrl: 'fake url', md5Hash: 'fake hash' })
      )
    })

    beforeEach(() => {
      query = saveFileQuery(itemId, url, uploadFileId)
    })

    after(() => {
      sinon.restore()
    })

    context('when the file is not uploaded', () => {
      before(() => {
        url = 'fake url'
        uploadFileId = generateFakeUuid()
      })

      it('should return Unauthorized error', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.saveFile.errorCodes).to.eql(['UNAUTHORIZED'])
      })
    })

    context('when the file is uploaded', () => {
      before(async () => {
        url = 'https://blog.omnivore.app/'
        const uploadFile = await getRepository(UploadFile).save({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          url: url,
          user: user,
          status: UploadFileStatus.Initialized,
        })
        uploadFileId = uploadFile.id
      })

      it('should return the new url', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.saveFile.url).to.startsWith(
          'http://localhost:3000/fakeUser/links'
        )
      })
    })
  })

  describe('Search API', () => {
    const url = 'https://blog.omnivore.app/p/getting-started-with-omnivore'
    const items: LibraryItem[] = []
    const highlights: Highlight[] = []
    const searchedKeyword = 'aaabbbccc'

    let query = ''
    let keyword = ''

    before(async () => {
      const readingProgressArray = [0, 2, 97, 98, 100]
      // Create some test items
      for (let i = 0; i < 5; i++) {
        const itemToSave: CreateOrUpdateLibraryItemArgs = {
          user,
          title: 'test title',
          readableContent: `<p>test ${searchedKeyword}</p>`,
          slug: 'test slug',
          originalUrl: `${url}/${i}`,
          siteName: 'Example',
          readingProgressBottomPercent: readingProgressArray[i],
        }
        const item = await createOrUpdateLibraryItem(
          itemToSave,
          user.id,
          undefined,
          true
        )
        items.push(item)

        // Create some test highlights
        const highlightToSave: DeepPartial<Highlight> = {
          patch: 'test patch',
          shortId: `test shortId${i}`,
          user,
          quote: '<p>search highlight</p>',
          libraryItem: item,
        }
        const highlight = await createHighlight(
          highlightToSave,
          item.id,
          user.id
        )
        highlights.push(highlight)
      }
    })

    beforeEach(() => {
      query = searchQuery(keyword)
    })

    after(async () => {
      await deleteLibraryItemsByUserId(user.id)
    })

    context('when type:highlights is not in the query', () => {
      before(() => {
        keyword = searchedKeyword
      })

      it('should return items in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.edges.length).to.eql(5)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[4].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(items[3].id)
        expect(res.body.data.search.edges[2].node.id).to.eq(items[2].id)
        expect(res.body.data.search.edges[3].node.id).to.eq(items[1].id)
        expect(res.body.data.search.edges[4].node.id).to.eq(items[0].id)
      })

      it('should return highlights in items', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.edges[0].node.highlights.length).to.eql(1)
        expect(res.body.data.search.edges[0].node.highlights[0].id).to.eq(
          highlights[4].id
        )
      })
    })

    context('when is:unread is in the query', () => {
      before(() => {
        keyword = `'${searchedKeyword}' is:unread`
      })

      it('returns unread articles in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.edges.length).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when is:reading is in the query', () => {
      before(() => {
        keyword = `'${searchedKeyword}' is:reading`
      })

      it('returns reading articles in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.edges.length).to.eq(3)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[3].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(items[2].id)
        expect(res.body.data.search.edges[2].node.id).to.eq(items[1].id)
      })
    })

    context('when is:read is in the query', () => {
      before(() => {
        keyword = `'${searchedKeyword}' is:read`
      })

      it('returns fully read articles in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.edges.length).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[4].id)
      })
    })

    context('when no:label is in the query', () => {
      before(() => {
        keyword = `'${searchedKeyword}' no:label`
      })

      it('returns non-labeled items in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(5)
      })
    })

    context('when no:highlight is in the query', () => {
      before(() => {
        keyword = `'${searchedKeyword}' no:highlight`
      })

      it('returns non-highlighted items in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(0)
      })
    })

    context('when site:${site_name} is in the query', () => {
      before(() => {
        keyword = `'${searchedKeyword}' site:example`
      })

      it('returns items from the site', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(5)
      })
    })

    context("when 'in:archive label:test' is in the query", () => {
      let items: LibraryItem[] = []
      let label: Label

      before(async () => {
        keyword = 'in:archive label:test'
        // Create some test items
        label = await createLabel('test', '', user.id)
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              archivedAt: new Date(),
              state: LibraryItemState.Archived,
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              archivedAt: new Date(),
              state: LibraryItemState.Archived,
            },
            {
              user,
              title: 'test title 3',
              readableContent: '<p>test 3</p>',
              slug: 'test slug 3',
              originalUrl: `${url}/test3`,
            },
          ],
          user.id
        )
        await saveLabelsInLibraryItem([label], items[0].id, user.id)
        await saveLabelsInLibraryItem([label], items[2].id, user.id)
      })

      after(async () => {
        await deleteLabels({ id: label.id }, user.id)
        await deleteLibraryItems(items, user.id)
      })

      it('returns archived items with label test', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when site is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'site:yes-app.com'
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              state: LibraryItemState.Succeeded,
              siteName: 'yes-app.com',
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              state: LibraryItemState.Succeeded,
              siteName: 'no-app.com',
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns item with matching site', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when wildcard site is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'site:app.com'
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              state: LibraryItemState.Succeeded,
              siteName: 'yes-app.com',
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              state: LibraryItemState.Succeeded,
              siteName: 'no-app.com',
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns item with matching search query', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(2)
      })
    })

    context('when in:inbox no:subscription label:test is in the query', () => {
      let items: LibraryItem[] = []
      let label: Label

      before(async () => {
        keyword = 'in:inbox no:subscription label:test'
        // Create some test items
        label = await createLabel('test', '', user.id)
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              subscription: 'test subscription',
            },
            {
              user,
              title: 'test title 3',
              readableContent: '<p>test 3</p>',
              slug: 'test slug 3',
              originalUrl: `${url}/test3`,
              archivedAt: new Date(),
              state: LibraryItemState.Archived,
            },
          ],
          user.id
        )
        await saveLabelsInLibraryItem([label], items[0].id, user.id)
        await saveLabelsInLibraryItem([label], items[1].id, user.id)
        await saveLabelsInLibraryItem([label], items[2].id, user.id)
      })

      after(async () => {
        await deleteLabels({ id: label.id }, user.id)
        await deleteLibraryItems(items, user.id)
      })

      it('returns library items with label test', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when wildcard search for labels', () => {
      const items: LibraryItem[] = []
      let labelIds: string[]

      before(async () => {
        keyword = 'label:test/*'
        // Create some test items
        const label1 = await createLabel('test/one', '', user.id)
        const label2 = await createLabel('test/two', '', user.id)
        labelIds = [label1.id, label2.id]

        const itemsToSave = [
          {
            user,
            title: 'test title wildcard',
            readableContent: '<p>test wildcard</p>',
            slug: 'test slug wildcard',
            originalUrl: `${url}/wildcard`,
          },
          {
            user,
            title: 'test title wildcard 1',
            readableContent: '<p>test wildcard</p>',
            slug: 'test slug wildcard 1',
            originalUrl: `${url}/wildcard_1`,
          },
          {
            user,
            title: 'test title wildcard 2',
            readableContent: '<p>test wildcard</p>',
            slug: 'test slug wildcard 2',
            originalUrl: `${url}/wildcard_2`,
          },
        ]

        for (const item of itemsToSave) {
          const savedItem = await createOrUpdateLibraryItem(
            item,
            user.id,
            undefined,
            true
          )
          items.push(savedItem)
        }

        await saveLabelsInLibraryItem([label1], items[0].id, user.id)
        await saveLabelsInLibraryItem([label2], items[1].id, user.id)
      })

      after(async () => {
        await deleteLabels(labelIds, user.id)
        await deleteLibraryItems(items, user.id)
      })

      it('returns library items with label test/one and test/two', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(2)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[1].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(items[0].id)
      })
    })

    context('when type:file label:test is in the query', () => {
      let items: LibraryItem[] = []
      let label: Label

      before(async () => {
        keyword = 'type:file label:test'
        // Create some test items
        label = await createLabel('test', '', user.id)
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              itemType: PageType.File,
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              itemType: PageType.File,
            },
            {
              user,
              title: 'test title 3',
              readableContent: '<p>test 3</p>',
              slug: 'test slug 3',
              originalUrl: `${url}/test3`,
            },
          ],
          user.id
        )
        await saveLabelsInLibraryItem([label], items[0].id, user.id)
        await saveLabelsInLibraryItem([label], items[2].id, user.id)
      })

      after(async () => {
        await deleteLabels({ id: label.id }, user.id)
        await deleteLibraryItems(items, user.id)
      })

      it('returns files with label test', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when in:archive is:unread is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'in:archive is:unread'
        // Create some test items
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              itemType: PageType.File,
              archivedAt: new Date(),
              state: LibraryItemState.Archived,
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              archivedAt: new Date(),
              state: LibraryItemState.Archived,
              readingProgressBottomPercent: 100,
            },
            {
              user,
              title: 'test title 3',
              readableContent: '<p>test 3</p>',
              slug: 'test slug 3',
              originalUrl: `${url}/test3`,
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns unread archived items', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when rss:feed in:archive is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'rss:feed in:archive'
        // Create some test items
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              subscription: 'feed',
              archivedAt: new Date(),
              state: LibraryItemState.Archived,
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              subscription: 'feed',
            },
            {
              user,
              title: 'test title 3',
              readableContent: '<p>test 3</p>',
              slug: 'test slug 3',
              originalUrl: `${url}/test3`,
              archivedAt: new Date(),
              state: LibraryItemState.Archived,
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns archived feed items', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when in:trash is:unread is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'in:trash is:unread'
        // Create some test items
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              deletedAt: new Date(),
              state: LibraryItemState.Deleted,
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              readingProgressBottomPercent: 100,
              deletedAt: new Date(),
              state: LibraryItemState.Deleted,
            },
            {
              user,
              title: 'test title 3',
              readableContent: '<p>test 3</p>',
              slug: 'test slug 3',
              originalUrl: `${url}/test3`,
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns unfinished deleted items', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when readPosition:>20 readPosition:<50 is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'readPosition:>20 readPosition:<50'
        // Create some test items
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              readingProgressBottomPercent: 40,
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              readingProgressBottomPercent: 10,
            },
            {
              user,
              title: 'test title 3',
              readableContent: '<p>test 3</p>',
              slug: 'test slug 3',
              originalUrl: `${url}/test3`,
              readingProgressBottomPercent: 100,
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns items with reading progress between 20% and 50% exclusively', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context(
      'when wordsCount:>=10000 wordsCount:<=20000 is in the query',
      () => {
        let items: LibraryItem[] = []

        before(async () => {
          keyword = 'wordsCount:>=10000 wordsCount:<=20000'
          // Create some test items
          items = await createLibraryItems(
            [
              {
                user,
                title: 'test title 1',
                readableContent: '<p>test 1</p>',
                slug: 'test slug 1',
                originalUrl: `${url}/test1`,
                wordCount: 10000,
              },
              {
                user,
                title: 'test title 2',
                readableContent: '<p>test 2</p>',
                slug: 'test slug 2',
                originalUrl: `${url}/test2`,
                wordCount: 8000,
              },
              {
                user,
                title: 'test title 3',
                readableContent: '<p>test 3</p>',
                slug: 'test slug 3',
                originalUrl: `${url}/test3`,
                wordCount: 100000,
              },
            ],
            user.id
          )
        })

        after(async () => {
          await deleteLibraryItems(items, user.id)
        })

        it('returns items with words count between 10000 and 20000 inclusively', async () => {
          const res = await graphqlRequest(query, authToken).expect(200)

          expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
          expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
        })
      }
    )

    context('when recommendedBy:* is in the query', () => {
      let items: LibraryItem[] = []
      let group: Group

      before(async () => {
        keyword = 'recommendedBy:*'

        group = (
          await createGroup({
            admin: user,
            name: 'test group',
          })
        )[0]

        // Create some test items
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              recommendations: [
                {
                  recommender: user,
                  group,
                },
              ],
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
        await deleteGroup(group.id)
      })

      it('returns recommended items', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
        expect(
          res.body.data.search.edges[0].node.recommendations[0].name
        ).to.eq(group.name)
      })
    })

    context('when site:youtube.com is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'site:youtube.com'
        // Create some test items
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: 'https://www.youtube.com/watch?v=Omnivore',
              itemType: PageType.Video,
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns youtube videos', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when site:wikipedia is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'site:wikipedia'
        // Create some test items
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: 'https://en.wikipedia.org/wiki/Omnivore',
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns wikipedia pages', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(1)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[0].id)
      })
    })

    context('when label:test1,test2 is in the query', () => {
      let items: LibraryItem[] = []
      let label1: Label
      let label2: Label

      before(async () => {
        keyword = 'label:test1,test2'
        // Create some test items
        label1 = await createLabel('test1', '', user.id)
        label2 = await createLabel('test2', '', user.id)
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              savedAt: new Date(1703880588),
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              savedAt: new Date(1704880589),
            },
            {
              user,
              title: 'test title 3',
              readableContent: '<p>test 3</p>',
              slug: 'test slug 3',
              originalUrl: `${url}/test3`,
              savedAt: new Date(1705880590),
            },
          ],
          user.id
        )
        await saveLabelsInLibraryItem([label1], items[0].id, user.id)
        await saveLabelsInLibraryItem([label2], items[1].id, user.id)
      })

      after(async () => {
        await deleteLabels({ id: label1.id }, user.id)
        await deleteLabels({ id: label2.id }, user.id)
        await deleteLibraryItems(items, user.id)
      })

      it('returns items with label test1 or test2', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(2)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[1].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(items[0].id)
      })
    })

    context('when label:test1 OR label:test2 is in the query', () => {
      let items: LibraryItem[] = []
      let label1: Label
      let label2: Label

      before(async () => {
        keyword = 'label:test1 OR label:test2'
        // Create some test items
        label1 = await createLabel('test1', '', user.id)
        label2 = await createLabel('test2', '', user.id)
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test title 1',
              readableContent: '<p>test 1</p>',
              slug: 'test slug 1',
              originalUrl: `${url}/test1`,
              savedAt: new Date(1703880588),
            },
            {
              user,
              title: 'test title 2',
              readableContent: '<p>test 2</p>',
              slug: 'test slug 2',
              originalUrl: `${url}/test2`,
              savedAt: new Date(1704880589),
            },
            {
              user,
              title: 'test title 3',
              readableContent: '<p>test 3</p>',
              slug: 'test slug 3',
              originalUrl: `${url}/test3`,
              savedAt: new Date(1705880590),
            },
          ],
          user.id
        )
        await saveLabelsInLibraryItem([label1], items[0].id, user.id)
        await saveLabelsInLibraryItem([label2], items[1].id, user.id)
      })

      after(async () => {
        await deleteLabels({ id: label1.id }, user.id)
        await deleteLabels({ id: label2.id }, user.id)
        await deleteLibraryItems(items, user.id)
      })

      it('returns items with label test1 or test2', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(2)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[1].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(items[0].id)
      })
    })

    context('when sort:score is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'sort:score score'
        // Create some test items
        items = await createLibraryItems(
          [
            {
              user,
              title: 'score',
              slug: 'test 1',
              originalUrl: `${url}/test1`,
            },
            {
              user,
              title: 'score score',
              slug: 'test 2',
              originalUrl: `${url}/test2`,
            },
            {
              user,
              title: 'score score score',
              slug: 'test 3',
              originalUrl: `${url}/test3`,
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns items in descending order of score', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eql(3)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[2].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(items[1].id)
        expect(res.body.data.search.edges[2].node.id).to.eq(items[0].id)
      })
    })

    context('when sort:wordscount is in the query', () => {
      let items: LibraryItem[] = []

      before(async () => {
        keyword = 'wordscount:>=10000 sort:wordscount'
        // Create some test items
        items = await createLibraryItems(
          [
            {
              user,
              title: 'test 1',
              slug: 'test 1',
              originalUrl: `${url}/test1`,
              wordCount: 10000,
            },
            {
              user,
              title: 'test 2',
              slug: 'test 2',
              originalUrl: `${url}/test2`,
              wordCount: 20000,
            },
            {
              user,
              title: 'test 3',
              slug: 'test 3',
              originalUrl: `${url}/test3`,
              wordCount: 30000,
            },
          ],
          user.id
        )
      })

      after(async () => {
        await deleteLibraryItems(items, user.id)
      })

      it('returns items in descending order of word count', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eql(3)
        expect(res.body.data.search.edges[0].node.id).to.eq(items[2].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(items[1].id)
        expect(res.body.data.search.edges[2].node.id).to.eq(items[0].id)
      })
    })
  })

  describe('TypeaheadSearch API', () => {
    const items: LibraryItem[] = []

    let query = ''
    const keyword = 'typeahead'

    before(async () => {
      // Create some test items
      for (let i = 0; i < 5; i++) {
        const itemToSave: CreateOrUpdateLibraryItemArgs = {
          user,
          title: 'typeahead search item',
          readableContent: '<p>test</p>',
          slug: '',
          originalUrl: `https://blog.omnivore.app/p/typeahead-search-${i}`,
        }
        const item = await createOrUpdateLibraryItem(
          itemToSave,
          user.id,
          undefined,
          true
        )
        items.push(item)
      }
    })

    beforeEach(() => {
      query = typeaheadSearchQuery(keyword)
    })

    after(async () => {
      await deleteLibraryItemsByUserId(user.id)
    })

    it('returns items with typeahead prefix', async () => {
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.typeaheadSearch.items.length).to.eql(5)
      expect(res.body.data.typeaheadSearch.items[0].id).to.eq(items[4].id)
      expect(res.body.data.typeaheadSearch.items[1].id).to.eq(items[3].id)
      expect(res.body.data.typeaheadSearch.items[2].id).to.eq(items[2].id)
      expect(res.body.data.typeaheadSearch.items[3].id).to.eq(items[1].id)
      expect(res.body.data.typeaheadSearch.items[4].id).to.eq(items[0].id)
    })
  })

  describe('UpdatesSince API', () => {
    const updatesSinceQuery = (since: string) => `
      query {
        updatesSince(
          since: "${since}") {
          ... on UpdatesSinceSuccess {
            edges {
              cursor
              node {
                id
                createdAt
                updatedAt
                pageType
                highlights {
                  id
                  type
                }
              }
              itemID
              updateReason
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
              totalCount
            }
          }
          ... on UpdatesSinceError {
            errorCodes
          }
        }
      }
    `
    let since: string
    const items: LibraryItem[] = []
    const deletedItems: LibraryItem[] = []

    before(async () => {
      // Create some test items
      for (let i = 0; i < 5; i++) {
        const itemToSave: CreateOrUpdateLibraryItemArgs = {
          title: 'test item',
          slug: '',
          readableContent: '<p>test</p>',
          originalUrl: `https://blog.omnivore.app/p/updates-since-${i}`,
          user,
        }
        const item = await createOrUpdateLibraryItem(
          itemToSave,
          user.id,
          undefined,
          true
        )
        items.push(item)
      }

      // set the since to be the timestamp before deletion
      since = items[4].updatedAt.toISOString()

      // Delete some items
      for (let i = 0; i < 3; i++) {
        await softDeleteLibraryItem(items[i].id, user.id)

        deletedItems.push(items[i])
      }
    })

    after(async () => {
      // Delete all items
      await deleteLibraryItemsByUserId(user.id)
    })

    it('returns items deleted after since', async () => {
      const res = await graphqlRequest(
        updatesSinceQuery(since),
        authToken
      ).expect(200)

      expect(
        (res.body.data.updatesSince.edges as SyncUpdatedItemEdge[]).filter(
          (e: SyncUpdatedItemEdge) => e.updateReason === UpdateReason.Deleted
        ).length
      ).to.eql(3)
      expect(res.body.data.updatesSince.edges[0].itemID).to.eq(
        deletedItems[2].id
      )
      expect(res.body.data.updatesSince.edges[1].itemID).to.eq(
        deletedItems[1].id
      )
      expect(res.body.data.updatesSince.edges[2].itemID).to.eq(
        deletedItems[0].id
      )
      expect(res.body.data.updatesSince.edges[0].updateReason).to.eq(
        UpdateReason.Deleted
      )
    })

    context(
      'when since is -1000000000-01-01T00:00:00Z from android app',
      () => {
        before(() => {
          since = '-1000000000-01-01T00:00:00Z'
        })

        it('returns all', async () => {
          const res = await graphqlRequest(
            updatesSinceQuery(since),
            authToken
          ).expect(200)

          expect(res.body.data.updatesSince.edges.length).to.eql(5)
        })
      }
    )

    context('returns highlights', () => {
      let highlight: Highlight

      before(async () => {
        highlight = await createHighlight(
          {
            user,
            shortId: 'test short id',
            quote: 'test',
            libraryItem: items[0],
          },
          items[0].id,
          user.id
        )
      })

      it('returns highlights', async () => {
        const res = await graphqlRequest(
          updatesSinceQuery(since),
          authToken
        ).expect(200)

        expect(res.body.data.updatesSince.edges[0].node.highlights[0].id).to.eq(
          highlight.id
        )
        expect(
          res.body.data.updatesSince.edges[0].node.highlights[0].type
        ).to.eq(HighlightType.Highlight)
      })
    })
  })

  describe('BulkAction API', () => {
    const bulkActionQuery = (action: BulkActionType, query = 'in:all') => `
      mutation {
        bulkAction (action: ${action}, query: "${query}") {
          ... on BulkActionSuccess {
            success
          }
          ... on BulkActionError {
            errorCodes
          }
        }
      }
    `

    xcontext('when action is MarkAsRead and query is in:unread', () => {
      before(async () => {
        // Create some test items
        for (let i = 0; i < 5; i++) {
          await createOrUpdateLibraryItem(
            {
              user,
              itemType: i == 0 ? PageType.Article : PageType.File,
              title: 'test item',
              readableContent: '<p>test</p>',
              slug: '',
              state:
                i == 0 ? LibraryItemState.Failed : LibraryItemState.Succeeded,
              originalUrl: `https://blog.omnivore.app/p/bulk-action-${i}`,
            },
            user.id,
            undefined,
            true
          )
        }
      })

      after(async () => {
        // Delete all items
        await deleteLibraryItemsByUserId(user.id)
      })

      it('marks unread items as read', async () => {
        const res = await graphqlRequest(
          bulkActionQuery(BulkActionType.MarkAsRead, 'is:unread'),
          authToken
        ).expect(200)
        expect(res.body.data.bulkAction.success).to.be.true

        const items = await graphqlRequest(
          searchQuery('is:unread'),
          authToken
        ).expect(200)
        expect(items.body.data.search.pageInfo.totalCount).to.eql(0)
      })
    })

    context(
      'when action is Archive and query is published:*..2023-10-01',
      () => {
        let items: LibraryItem[] = []

        before(async () => {
          items = await createLibraryItems(
            [
              {
                user,
                title: 'test item',
                readableContent: '<p>test</p>',
                slug: 'test-item',
                originalUrl: `https://blog.omnivore.app/p/bulk-action-archive`,
                publishedAt: new Date('2023-10-01'),
              },
              {
                user,
                title: 'test item 2',
                readableContent: '<p>test</p>',
                slug: 'test-item-2',
                originalUrl: `https://blog.omnivore.app/p/bulk-action-archive-2`,
                publishedAt: new Date('2023-10-02'),
              },
            ],
            user.id
          )
        })

        after(async () => {
          // Delete all items
          await deleteLibraryItems(items, user.id)
        })

        it('archives old items', async () => {
          const res = await graphqlRequest(
            bulkActionQuery(BulkActionType.Archive, 'published:*..2023-10-01'),
            authToken
          ).expect(200)
          expect(res.body.data.bulkAction.success).to.be.true

          const response = await graphqlRequest(
            searchQuery('in:archive'),
            authToken
          ).expect(200)
          expect(response.body.data.search.pageInfo.totalCount).to.eql(1)
          expect(response.body.data.search.edges[0].node.id).to.eql(items[0].id)
        })
      }
    )

    context('when action is Delete and query contains item id', () => {
      const items: LibraryItem[] = []

      before(async () => {
        // Create some test items
        for (let i = 0; i < 5; i++) {
          const item = await createOrUpdateLibraryItem(
            {
              user,
              itemType: i == 0 ? PageType.Article : PageType.File,
              title: 'test item',
              readableContent: '<p>test</p>',
              slug: '',
              state:
                i == 0 ? LibraryItemState.Failed : LibraryItemState.Succeeded,
              originalUrl: `https://blog.omnivore.app/p/bulk-action-${i}`,
            },
            user.id,
            undefined,
            true
          )
          items.push(item)
        }
      })

      after(async () => {
        // Delete all items
        await deleteLibraryItemsByUserId(user.id)
      })

      it('deletes all items', async () => {
        const query = `includes:${items.map((i) => i.id).join(',')}`
        const res = await graphqlRequest(
          bulkActionQuery(BulkActionType.Delete, query),
          authToken
        ).expect(200)
        expect(res.body.data.bulkAction.success).to.be.true

        const response = await graphqlRequest(
          searchQuery(query),
          authToken
        ).expect(200)
        expect(response.body.data.search.pageInfo.totalCount).to.eql(0)
      })
    })

    context(
      'when action is MarkAsSeen and query contains a list of item id',
      () => {
        const items: LibraryItem[] = []

        before(async () => {
          // Create some test items
          for (let i = 0; i < 5; i++) {
            const item = await createOrUpdateLibraryItem(
              {
                user,
                title: 'test item',
                slug: '',
                originalUrl: `https://blog.omnivore.app/p/bulk-action-${i}`,
              },
              user.id,
              undefined,
              true
            )

            items.push(item)
          }
        })

        after(async () => {
          // Delete all items
          await deleteLibraryItemsByUserId(user.id)
        })

        it('marks items as seen', async () => {
          const query = `includes:${items.map((i) => i.id).join(',')}`

          const res = await graphqlRequest(
            bulkActionQuery(BulkActionType.MarkAsSeen, query),
            authToken
          ).expect(200)
          expect(res.body.data.bulkAction.success).to.be.true

          const response = await graphqlRequest(
            searchQuery('is:seen'),
            authToken
          ).expect(200)
          expect(response.body.data.search.pageInfo.totalCount).to.eql(5)
        })
      }
    )
  })

  describe('SetFavoriteArticle API', () => {
    const setFavoriteArticleQuery = (articleId: string) => `
      mutation {
        setFavoriteArticle(id: "${articleId}") {
          ... on SetFavoriteArticleSuccess {
            success
          }
          ... on SetFavoriteArticleError {
            errorCodes
          }
        }
      }`

    let articleId = ''

    before(async () => {
      const itemToSave: CreateOrUpdateLibraryItemArgs = {
        user,
        title: 'test setFavoriteArticle',
        slug: '',
        readableContent: '<p>test</p>',
        originalUrl: `https://blog.omnivore.app/p/setFavoriteArticle`,
      }
      const item = await createOrUpdateLibraryItem(
        itemToSave,
        user.id,
        undefined,
        true
      )
      articleId = item.id
    })

    after(async () => {
      // Delete the item
      await deleteLibraryItemById(articleId, user.id)
    })

    it('favorites the article', async () => {
      await graphqlRequest(
        setFavoriteArticleQuery(articleId),
        authToken
      ).expect(200)

      const item = await findLibraryItemById(articleId, user.id, {
        relations: {
          labels: true,
        },
      })
      expect(item?.labels?.map((l) => l.name)).to.eql(['Favorites'])
    })
  })

  describe('EmptyTrash API', () => {
    const emptyTrashQuery = () => `
      mutation {
        emptyTrash {
          ... on EmptyTrashSuccess {
            success
          }
          ... on EmptyTrashError {
            errorCodes
          }
        }
      }`

    const items: LibraryItem[] = []

    before(async () => {
      // Create some test items
      for (let i = 0; i < 5; i++) {
        const itemToSave: CreateOrUpdateLibraryItemArgs = {
          user,
          title: 'test item',
          readableContent: '<p>test</p>',
          slug: '',
          originalUrl: `https://blog.omnivore.app/p/empty-trash-${i}`,
          deletedAt: new Date(),
          state: LibraryItemState.Deleted,
        }
        const item = await createOrUpdateLibraryItem(
          itemToSave,
          user.id,
          undefined,
          true
        )
        items.push(item)
      }
    })

    after(async () => {
      // Delete all items
      await deleteLibraryItemsByUserId(user.id)
    })

    it('empties the trash', async () => {
      await graphqlRequest(emptyTrashQuery(), authToken).expect(200)

      const count = await countLibraryItems(
        {
          query: 'in:trash',
          includeDeleted: true,
        },
        user.id
      )
      expect(count).to.eql(0)
    })
  })
})
