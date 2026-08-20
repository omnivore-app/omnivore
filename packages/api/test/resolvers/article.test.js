"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = __importStar(require("chai"));
const chai_1 = require("chai");
const chai_string_1 = __importDefault(require("chai-string"));
require("mocha");
const sinon_1 = __importDefault(require("sinon"));
const library_item_1 = require("../../src/entity/library_item");
const upload_file_1 = require("../../src/entity/upload_file");
const graphql_1 = require("../../src/generated/graphql");
const repository_1 = require("../../src/repository");
const groups_1 = require("../../src/services/groups");
const labels_1 = require("../../src/services/labels");
const library_item_2 = require("../../src/services/library_item");
const user_1 = require("../../src/services/user");
const createTask = __importStar(require("../../src/utils/createTask"));
const uploads = __importStar(require("../../src/utils/uploads"));
const db_1 = require("../db");
const util_1 = require("../util");
chai.use(chai_string_1.default);
const archiveLink = async (authToken, linkId) => {
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
  `;
    return (0, util_1.graphqlRequest)(query, authToken).expect(200);
};
const createArticleQuery = (url, source, document, title) => {
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
  `;
};
const getArticleQuery = (slug) => {
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
  `;
};
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
  `;
};
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
    }`;
const saveFileQuery = (clientRequestId, url, uploadFileId) => {
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
    `;
};
const saveUrlQuery = (url, state = null, labels = null) => {
    return `
    mutation {
      saveUrl(
        input: {
          url: "${url}",
          source: "test",
          clientRequestId: "${(0, util_1.generateFakeUuid)()}",
          state: ${state ?? 'null'},
          labels: ${labels
        ? '[' +
            labels.map((label) => `{ name: "${label}" }`).join(',') +
            ']'
        : 'null'}
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
    `;
};
const setBookmarkQuery = (articleId, bookmark) => {
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
    `;
};
const saveArticleReadingProgressQuery = (articleId, progress, topPercent = null, force = null) => {
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
    `;
};
const typeaheadSearchQuery = (keyword) => {
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
  `;
};
describe('Article API', () => {
    let authToken;
    let user;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('CreateArticle', () => {
        let query = '';
        let url = '';
        let source = '';
        let document = '';
        let title = '';
        let itemId = '';
        beforeEach(() => {
            query = createArticleQuery(url, source, document, title);
        });
        context('when saving from document', () => {
            before(() => {
                url = 'https://blog.omnivore.work/p/testing-is-fun-with-omnivore';
                source = 'puppeteer-parse';
                document = '<p>test</p>';
                title = 'new title';
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItemById)(itemId, user.id);
            });
            it('should create an article', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.createArticle.createdArticle.title).to.eql(title);
                itemId = res.body.data.createArticle.createdArticle.id;
            });
        });
        context('when saving an archived article', () => {
            before(async () => {
                url = 'https://blog.omnivore.work/saving-archived-article.com';
                source = 'puppeteer-parse';
                document = '<p>test</p>';
                title = 'new title';
                const item = await (0, library_item_2.createOrUpdateLibraryItem)({
                    readableContent: document,
                    slug: 'test saving an archived article slug',
                    title,
                    user: { id: user.id },
                    originalUrl: url,
                    archivedAt: new Date(),
                    state: library_item_1.LibraryItemState.Archived,
                }, user.id, undefined, true);
                itemId = item.id;
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItemById)(itemId, user.id);
            });
            it('unarchives the article', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.createArticle.createdArticle.isArchived).to.false;
            });
        });
    });
    describe('GetArticle', () => {
        const realSlug = 'testing-is-really-fun-with-omnivore';
        let query = '';
        let slug = '';
        let itemId;
        before(async () => {
            const itemToCreate = {
                title: 'test title',
                slug: realSlug,
                readingProgressTopPercent: 100,
                user,
                originalUrl: 'https://blog.omnivore.work/test-with-omnivore',
                directionality: library_item_1.DirectionalityType.RTL,
            };
            const item = await (0, library_item_2.createOrUpdateLibraryItem)(itemToCreate, user.id, undefined, true);
            itemId = item.id;
            // save highlights
            await (0, db_1.createHighlight)({
                shortId: 'test short id',
                patch: 'test patch',
                quote: 'test quote',
                user,
                libraryItem: item,
            }, itemId, user.id);
        });
        after(async () => {
            await (0, library_item_2.deleteLibraryItemById)(itemId, user.id);
        });
        beforeEach(() => {
            query = getArticleQuery(slug);
        });
        context('when item exists', () => {
            before(() => {
                slug = realSlug;
            });
            it('should return the item', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.article.article.slug).to.eql(slug);
                (0, chai_1.expect)(res.body.data.article.article.directionality).to.eql(library_item_1.DirectionalityType.RTL);
            });
            it('should return highlights', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.article.article.highlights).to.length(1);
            });
            context('when item is failed to process', () => {
                before(async () => {
                    await (0, library_item_2.updateLibraryItem)(itemId, {
                        state: library_item_1.LibraryItemState.Processing,
                        savedAt: new Date(Date.now() - 1000 * 60),
                    }, user.id);
                });
                it('should return unable to parse', async () => {
                    const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                    (0, chai_1.expect)(res.body.data.article.article.content).to.eql('<p>We were unable to parse this page.</p>');
                });
            });
        });
        context('query with id instead of slug', () => {
            before(() => {
                slug = itemId;
            });
            it('returns the item', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.article.article.id).to.eql(slug);
            });
        });
        context('when item does not exist', () => {
            before(() => {
                slug = 'not-a-real-slug';
            });
            it('should return an error', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.article.errorCodes).to.eql(['NOT_FOUND']);
            });
        });
    });
    describe('SavePage', () => {
        const title = 'Example Title';
        let url = 'https://blog.omnivore.work';
        const originalContent = '<html dir="rtl"><body><div>Example Content</div></body></html>';
        const source = 'puppeteer-parse';
        context('when we save a new item', () => {
            after(async () => {
                await (0, library_item_2.deleteLibraryItemByUrl)(url, user.id);
            });
            it('should return a slugged url', async () => {
                const res = await (0, util_1.graphqlRequest)(savePageQuery, authToken, {
                    input: {
                        url,
                        originalContent,
                        title,
                        clientRequestId: (0, util_1.generateFakeUuid)(),
                        source,
                    },
                }).expect(200);
                (0, chai_1.expect)(res.body.data.savePage.url).to.startsWith('http://localhost:3000/fakeUser/example-title-');
            });
        });
        context('when we save a item that is already archived', () => {
            before(() => {
                url = 'https://blog.omnivore.work/new-url';
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItemByUrl)(url, user.id);
            });
            it('it should return that item in the Search Query', async () => {
                const variables = {
                    input: {
                        url,
                        originalContent,
                        title,
                        clientRequestId: (0, util_1.generateFakeUuid)(),
                        source,
                    },
                };
                await (0, util_1.graphqlRequest)(savePageQuery, authToken, variables).expect(200);
                // Save a link, then archive it
                let allLinks = await (0, util_1.graphqlRequest)(searchQuery('in:inbox'), authToken).expect(200);
                const justSavedId = allLinks.body.data.search.edges[0].node.id;
                await archiveLink(authToken, justSavedId);
                // test the negative case, ensuring the archive link wasn't returned
                allLinks = await (0, util_1.graphqlRequest)(searchQuery('in:inbox'), authToken).expect(200);
                (0, chai_1.expect)(allLinks.body.data.search.edges[0]?.node?.url).to.not.eq(url);
                // Now save the link again, and ensure it is returned
                await (0, util_1.graphqlRequest)(savePageQuery, authToken, variables).expect(200);
                allLinks = await (0, util_1.graphqlRequest)(searchQuery('in:inbox'), authToken).expect(200);
                (0, chai_1.expect)(allLinks.body.data.search.edges[0].node.id).to.eq(justSavedId);
                (0, chai_1.expect)(allLinks.body.data.search.edges[0].node.url).to.eq(url);
                (0, chai_1.expect)(allLinks.body.data.search.edges[0].node.directionality).to.eq('RTL');
            });
        });
        context('when we also want to save labels and archives the item', () => {
            before(() => {
                url = 'https://blog.omnivore.work/new-url-2';
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItemByUrl)(url, user.id);
            });
            it('saves the labels and archives the item', async () => {
                const state = graphql_1.ArticleSavingRequestStatus.Archived;
                const labels = [{ name: 'test name' }, { name: 'test name 2' }];
                await (0, util_1.graphqlRequest)(savePageQuery, authToken, {
                    input: {
                        url,
                        state,
                        labels,
                        originalContent,
                        clientRequestId: (0, util_1.generateFakeUuid)(),
                        source,
                    },
                }).expect(200);
                const savedItem = await (0, library_item_2.findLibraryItemByUrl)(url, user.id);
                (0, chai_1.expect)(savedItem?.archivedAt).to.not.be.null;
                (0, chai_1.expect)(savedItem?.labels?.map((l) => l.name)).to.include.members(labels.map((l) => l.name));
            });
        });
        context('when the source is rss-feeder and url is from youtube.com', () => {
            const source = 'rss-feeder';
            const stub = sinon_1.default.stub(createTask, 'enqueueFetchContentJob');
            sinon_1.default.stub(createTask, 'enqueueProcessYouTubeVideo');
            before(() => {
                url = 'https://www.youtube.com/watch?v=123';
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItemByUrl)(url, user.id);
                sinon_1.default.restore();
            });
            it('does not parse in the backend', async () => {
                await (0, util_1.graphqlRequest)(savePageQuery, authToken, {
                    input: {
                        url,
                        source,
                        originalContent,
                        clientRequestId: (0, util_1.generateFakeUuid)(),
                    },
                }).expect(200);
                (0, chai_1.expect)(stub).not.to.have.been.called;
            });
        });
    });
    describe('SaveUrl', () => {
        let query = '';
        const url = 'https://blog.omnivore.work/new-url-1';
        before(() => {
            sinon_1.default.replace(createTask, 'enqueueFetchContentJob', sinon_1.default.fake.resolves(''));
        });
        beforeEach(() => {
            query = saveUrlQuery(url);
        });
        after(() => {
            sinon_1.default.restore();
        });
        afterEach(async () => {
            await (0, library_item_2.deleteLibraryItemByUrl)(url, user.id);
        });
        context('when we save a new url', () => {
            it('should return a slugged url', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.saveUrl.url).to.startsWith('http://localhost:3000/fakeUser/links/');
            });
        });
    });
    describe('setBookmarkArticle', () => {
        let itemId;
        before(async () => {
            const itemToSave = {
                user,
                title: 'test title',
                readableContent: '<p>test</p>',
                originalUrl: 'https://blog.omnivore.work/setBookmarkArticle',
                slug: 'test-with-omnivore',
            };
            const item = await (0, library_item_2.createOrUpdateLibraryItem)(itemToSave, user.id, undefined, true);
            itemId = item.id;
        });
        after(async () => {
            await (0, library_item_2.deleteLibraryItemById)(itemId, user.id);
        });
        it('soft deletes the item', async () => {
            await (0, util_1.graphqlRequest)(setBookmarkQuery(itemId, false), authToken).expect(200);
            const item = await (0, library_item_2.findLibraryItemById)(itemId, user.id);
            (0, chai_1.expect)(item?.state).to.eql(library_item_1.LibraryItemState.Deleted);
        });
    });
    describe('saveArticleReadingProgressResolver', () => {
        let query = '';
        let itemId = '';
        const progress = 0.5;
        const topPercent = null;
        before(async () => {
            itemId = (await (0, db_1.createTestLibraryItem)(user.id)).id;
        });
        after(async () => {
            await (0, library_item_2.deleteLibraryItemById)(itemId, user.id);
        });
        it('saves a reading progress on an article', async () => {
            query = saveArticleReadingProgressQuery(itemId, progress, topPercent);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.saveArticleReadingProgress.updatedArticle
                .readingProgressPercent).to.eq(progress);
            (0, chai_1.expect)(res.body.data.saveArticleReadingProgress.updatedArticle.readAt).not
                .null;
        });
        it('should not allow setting the reading progress lower than current progress', async () => {
            const firstQuery = saveArticleReadingProgressQuery(itemId, 75);
            const firstRes = await (0, util_1.graphqlRequest)(firstQuery, authToken).expect(200);
            (0, chai_1.expect)(firstRes.body.data.saveArticleReadingProgress.updatedArticle
                .readingProgressPercent).to.eq(75);
            // Now try to set to a lower value (50), value should not be updated
            const secondQuery = saveArticleReadingProgressQuery(itemId, 50);
            const secondRes = await (0, util_1.graphqlRequest)(secondQuery, authToken).expect(200);
            (0, chai_1.expect)(secondRes.body.data.saveArticleReadingProgress.updatedArticle
                .readingProgressPercent).to.eq(75);
        });
        it('does not save topPercent if not undefined', async () => {
            query = saveArticleReadingProgressQuery(itemId, progress, null);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.saveArticleReadingProgress.updatedArticle
                .readingProgressTopPercent).to.eq(0);
        });
        it('saves topPercent if defined', async () => {
            const topPercent = 0.2;
            query = saveArticleReadingProgressQuery(itemId, progress, topPercent);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.saveArticleReadingProgress.updatedArticle
                .readingProgressTopPercent).to.eql(topPercent);
        });
        it('saves topPercent as 0 if defined as 0', async () => {
            const topPercent = 0;
            query = saveArticleReadingProgressQuery(itemId, progress, topPercent, true);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.saveArticleReadingProgress.updatedArticle
                .readingProgressTopPercent).to.eql(topPercent);
        });
        it('returns BAD_DATA error if top position is greater than bottom position', async () => {
            query = saveArticleReadingProgressQuery(itemId, 0.5, 0.8);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.saveArticleReadingProgress.errorCodes).to.eql([
                'BAD_DATA',
            ]);
        });
        context('when force is true', () => {
            before(async () => {
                itemId = (await (0, library_item_2.createOrUpdateLibraryItem)({
                    user: { id: user.id },
                    originalUrl: 'https://blog.omnivore.work/setBookmarkArticle',
                    slug: 'test-with-omnivore',
                    readableContent: '<p>test</p>',
                    title: 'test title',
                    readingProgressBottomPercent: 100,
                    readingProgressTopPercent: 80,
                }, user.id, undefined, true)).id;
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItemById)(itemId, user.id);
            });
            it('ignore position check if force is true', async () => {
                query = saveArticleReadingProgressQuery(itemId, 20, 10, true);
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.saveArticleReadingProgress.updatedArticle
                    .readingProgressPercent).to.eql(20);
                (0, chai_1.expect)(res.body.data.saveArticleReadingProgress.updatedArticle
                    .readingProgressTopPercent).to.eql(10);
            });
        });
    });
    describe('SaveFile', () => {
        let query = '';
        let url = '';
        let uploadFileId = '';
        let itemId = '';
        before(async () => {
            const item = await (0, library_item_2.createOrUpdateLibraryItem)({
                user: { id: user.id },
                originalUrl: 'https://blog.omnivore.work/setBookmarkArticle',
                slug: 'test-with-omnivore',
                readableContent: '<p>test</p>',
                title: 'test title',
                readingProgressBottomPercent: 100,
                readingProgressTopPercent: 80,
            }, user.id, undefined, true);
            itemId = item.id;
            sinon_1.default.replace(uploads, 'getStorageFileDetails', sinon_1.default.fake.resolves({ fileUrl: 'fake url', md5Hash: 'fake hash' }));
        });
        beforeEach(() => {
            query = saveFileQuery(itemId, url, uploadFileId);
        });
        after(() => {
            sinon_1.default.restore();
        });
        context('when the file is not uploaded', () => {
            before(() => {
                url = 'fake url';
                uploadFileId = (0, util_1.generateFakeUuid)();
            });
            it('should return Unauthorized error', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.saveFile.errorCodes).to.eql(['UNAUTHORIZED']);
            });
        });
        context('when the file is uploaded', () => {
            before(async () => {
                url = 'https://blog.omnivore.work/';
                const uploadFile = await (0, repository_1.getRepository)(upload_file_1.UploadFile).save({
                    fileName: 'test.pdf',
                    contentType: 'application/pdf',
                    url: url,
                    user: user,
                    status: graphql_1.UploadFileStatus.Initialized,
                });
                uploadFileId = uploadFile.id;
            });
            it('should return the new url', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.saveFile.url).to.startsWith('http://localhost:3000/fakeUser/links');
            });
        });
    });
    describe('Search API', () => {
        const url = 'https://blog.omnivore.work/p/getting-started-with-omnivore';
        const items = [];
        const highlights = [];
        const searchedKeyword = 'aaabbbccc';
        let query = '';
        let keyword = '';
        before(async () => {
            const readingProgressArray = [0, 2, 97, 98, 100];
            // Create some test items
            for (let i = 0; i < 5; i++) {
                const itemToSave = {
                    user,
                    title: 'test title',
                    readableContent: `<p>test ${searchedKeyword}</p>`,
                    slug: 'test slug',
                    originalUrl: `${url}/${i}`,
                    siteName: 'Example',
                    readingProgressBottomPercent: readingProgressArray[i],
                };
                const item = await (0, library_item_2.createOrUpdateLibraryItem)(itemToSave, user.id, undefined, true);
                items.push(item);
                // Create some test highlights
                const highlightToSave = {
                    patch: 'test patch',
                    shortId: `test shortId${i}`,
                    user,
                    quote: '<p>search highlight</p>',
                    libraryItem: item,
                };
                const highlight = await (0, db_1.createHighlight)(highlightToSave, item.id, user.id);
                highlights.push(highlight);
            }
        });
        beforeEach(() => {
            query = searchQuery(keyword);
        });
        after(async () => {
            await (0, library_item_2.deleteLibraryItemsByUserId)(user.id);
        });
        context('when type:highlights is not in the query', () => {
            before(() => {
                keyword = searchedKeyword;
            });
            it('should return items in descending order', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.edges.length).to.eql(5);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[4].id);
                (0, chai_1.expect)(res.body.data.search.edges[1].node.id).to.eq(items[3].id);
                (0, chai_1.expect)(res.body.data.search.edges[2].node.id).to.eq(items[2].id);
                (0, chai_1.expect)(res.body.data.search.edges[3].node.id).to.eq(items[1].id);
                (0, chai_1.expect)(res.body.data.search.edges[4].node.id).to.eq(items[0].id);
            });
            it('should return highlights in items', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.highlights.length).to.eql(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.highlights[0].id).to.eq(highlights[4].id);
            });
        });
        context('when is:unread is in the query', () => {
            before(() => {
                keyword = `'${searchedKeyword}' is:unread`;
            });
            it('returns unread articles in descending order', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.edges.length).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when is:reading is in the query', () => {
            before(() => {
                keyword = `'${searchedKeyword}' is:reading`;
            });
            it('returns reading articles in descending order', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.edges.length).to.eq(3);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[3].id);
                (0, chai_1.expect)(res.body.data.search.edges[1].node.id).to.eq(items[2].id);
                (0, chai_1.expect)(res.body.data.search.edges[2].node.id).to.eq(items[1].id);
            });
        });
        context('when is:read is in the query', () => {
            before(() => {
                keyword = `'${searchedKeyword}' is:read`;
            });
            it('returns fully read articles in descending order', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.edges.length).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[4].id);
            });
        });
        context('when no:label is in the query', () => {
            before(() => {
                keyword = `'${searchedKeyword}' no:label`;
            });
            it('returns non-labeled items in descending order', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(5);
            });
        });
        context('when no:highlight is in the query', () => {
            before(() => {
                keyword = `'${searchedKeyword}' no:highlight`;
            });
            it('returns non-highlighted items in descending order', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(0);
            });
        });
        context('when site:${site_name} is in the query', () => {
            before(() => {
                keyword = `'${searchedKeyword}' site:example`;
            });
            it('returns items from the site', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(5);
            });
        });
        context("when 'in:archive label:test' is in the query", () => {
            let items = [];
            let label;
            before(async () => {
                keyword = 'in:archive label:test';
                // Create some test items
                label = await (0, labels_1.createLabel)('test', '', user.id);
                items = await (0, library_item_2.createLibraryItems)([
                    {
                        user,
                        title: 'test title 1',
                        readableContent: '<p>test 1</p>',
                        slug: 'test slug 1',
                        originalUrl: `${url}/test1`,
                        archivedAt: new Date(),
                        state: library_item_1.LibraryItemState.Archived,
                    },
                    {
                        user,
                        title: 'test title 2',
                        readableContent: '<p>test 2</p>',
                        slug: 'test slug 2',
                        originalUrl: `${url}/test2`,
                        archivedAt: new Date(),
                        state: library_item_1.LibraryItemState.Archived,
                    },
                    {
                        user,
                        title: 'test title 3',
                        readableContent: '<p>test 3</p>',
                        slug: 'test slug 3',
                        originalUrl: `${url}/test3`,
                    },
                ], user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label], items[0].id, user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label], items[2].id, user.id);
            });
            after(async () => {
                await (0, labels_1.deleteLabels)({ id: label.id }, user.id);
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns archived items with label test', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when site is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'site:yes-app.com';
                items = await (0, library_item_2.createLibraryItems)([
                    {
                        user,
                        title: 'test title 1',
                        readableContent: '<p>test 1</p>',
                        slug: 'test slug 1',
                        originalUrl: `${url}/test1`,
                        state: library_item_1.LibraryItemState.Succeeded,
                        siteName: 'yes-app.com',
                    },
                    {
                        user,
                        title: 'test title 2',
                        readableContent: '<p>test 2</p>',
                        slug: 'test slug 2',
                        originalUrl: `${url}/test2`,
                        state: library_item_1.LibraryItemState.Succeeded,
                        siteName: 'no-app.com',
                    },
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns item with matching site', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when wildcard site is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'site:app.com';
                items = await (0, library_item_2.createLibraryItems)([
                    {
                        user,
                        title: 'test title 1',
                        readableContent: '<p>test 1</p>',
                        slug: 'test slug 1',
                        originalUrl: `${url}/test1`,
                        state: library_item_1.LibraryItemState.Succeeded,
                        siteName: 'yes-app.com',
                    },
                    {
                        user,
                        title: 'test title 2',
                        readableContent: '<p>test 2</p>',
                        slug: 'test slug 2',
                        originalUrl: `${url}/test2`,
                        state: library_item_1.LibraryItemState.Succeeded,
                        siteName: 'no-app.com',
                    },
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns item with matching search query', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(2);
            });
        });
        context('when in:inbox no:subscription label:test is in the query', () => {
            let items = [];
            let label;
            before(async () => {
                keyword = 'in:inbox no:subscription label:test';
                // Create some test items
                label = await (0, labels_1.createLabel)('test', '', user.id);
                items = await (0, library_item_2.createLibraryItems)([
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
                        state: library_item_1.LibraryItemState.Archived,
                    },
                ], user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label], items[0].id, user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label], items[1].id, user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label], items[2].id, user.id);
            });
            after(async () => {
                await (0, labels_1.deleteLabels)({ id: label.id }, user.id);
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns library items with label test', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when wildcard search for labels', () => {
            const items = [];
            let labelIds;
            before(async () => {
                keyword = 'label:test/*';
                // Create some test items
                const label1 = await (0, labels_1.createLabel)('test/one', '', user.id);
                const label2 = await (0, labels_1.createLabel)('test/two', '', user.id);
                labelIds = [label1.id, label2.id];
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
                ];
                for (const item of itemsToSave) {
                    const savedItem = await (0, library_item_2.createOrUpdateLibraryItem)(item, user.id, undefined, true);
                    items.push(savedItem);
                }
                await (0, db_1.saveLabelsInLibraryItem)([label1], items[0].id, user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label2], items[1].id, user.id);
            });
            after(async () => {
                await (0, labels_1.deleteLabels)(labelIds, user.id);
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns library items with label test/one and test/two', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(2);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[1].id);
                (0, chai_1.expect)(res.body.data.search.edges[1].node.id).to.eq(items[0].id);
            });
        });
        context('when type:file label:test is in the query', () => {
            let items = [];
            let label;
            before(async () => {
                keyword = 'type:file label:test';
                // Create some test items
                label = await (0, labels_1.createLabel)('test', '', user.id);
                items = await (0, library_item_2.createLibraryItems)([
                    {
                        user,
                        title: 'test title 1',
                        readableContent: '<p>test 1</p>',
                        slug: 'test slug 1',
                        originalUrl: `${url}/test1`,
                        itemType: graphql_1.PageType.File,
                    },
                    {
                        user,
                        title: 'test title 2',
                        readableContent: '<p>test 2</p>',
                        slug: 'test slug 2',
                        originalUrl: `${url}/test2`,
                        itemType: graphql_1.PageType.File,
                    },
                    {
                        user,
                        title: 'test title 3',
                        readableContent: '<p>test 3</p>',
                        slug: 'test slug 3',
                        originalUrl: `${url}/test3`,
                    },
                ], user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label], items[0].id, user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label], items[2].id, user.id);
            });
            after(async () => {
                await (0, labels_1.deleteLabels)({ id: label.id }, user.id);
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns files with label test', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when in:archive is:unread is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'in:archive is:unread';
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
                    {
                        user,
                        title: 'test title 1',
                        readableContent: '<p>test 1</p>',
                        slug: 'test slug 1',
                        originalUrl: `${url}/test1`,
                        itemType: graphql_1.PageType.File,
                        archivedAt: new Date(),
                        state: library_item_1.LibraryItemState.Archived,
                    },
                    {
                        user,
                        title: 'test title 2',
                        readableContent: '<p>test 2</p>',
                        slug: 'test slug 2',
                        originalUrl: `${url}/test2`,
                        archivedAt: new Date(),
                        state: library_item_1.LibraryItemState.Archived,
                        readingProgressBottomPercent: 100,
                    },
                    {
                        user,
                        title: 'test title 3',
                        readableContent: '<p>test 3</p>',
                        slug: 'test slug 3',
                        originalUrl: `${url}/test3`,
                    },
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns unread archived items', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when rss:feed in:archive is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'rss:feed in:archive';
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
                    {
                        user,
                        title: 'test title 1',
                        readableContent: '<p>test 1</p>',
                        slug: 'test slug 1',
                        originalUrl: `${url}/test1`,
                        subscription: 'feed',
                        archivedAt: new Date(),
                        state: library_item_1.LibraryItemState.Archived,
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
                        state: library_item_1.LibraryItemState.Archived,
                    },
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns archived feed items', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when in:trash is:unread is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'in:trash is:unread';
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
                    {
                        user,
                        title: 'test title 1',
                        readableContent: '<p>test 1</p>',
                        slug: 'test slug 1',
                        originalUrl: `${url}/test1`,
                        deletedAt: new Date(),
                        state: library_item_1.LibraryItemState.Deleted,
                    },
                    {
                        user,
                        title: 'test title 2',
                        readableContent: '<p>test 2</p>',
                        slug: 'test slug 2',
                        originalUrl: `${url}/test2`,
                        readingProgressBottomPercent: 100,
                        deletedAt: new Date(),
                        state: library_item_1.LibraryItemState.Deleted,
                    },
                    {
                        user,
                        title: 'test title 3',
                        readableContent: '<p>test 3</p>',
                        slug: 'test slug 3',
                        originalUrl: `${url}/test3`,
                    },
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns unfinished deleted items', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when readPosition:>20 readPosition:<50 is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'readPosition:>20 readPosition:<50';
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
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
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns items with reading progress between 20% and 50% exclusively', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when wordsCount:>=10000 wordsCount:<=20000 is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'wordsCount:>=10000 wordsCount:<=20000';
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
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
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns items with words count between 10000 and 20000 inclusively', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when recommendedBy:* is in the query', () => {
            let items = [];
            let group;
            before(async () => {
                keyword = 'recommendedBy:*';
                group = (await (0, groups_1.createGroup)({
                    admin: user,
                    name: 'test group',
                }))[0];
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
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
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
                await (0, groups_1.deleteGroup)(group.id);
            });
            it('returns recommended items', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.recommendations[0].name).to.eq(group.name);
            });
        });
        context('when site:youtube.com is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'site:youtube.com';
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
                    {
                        user,
                        title: 'test title 1',
                        readableContent: '<p>test 1</p>',
                        slug: 'test slug 1',
                        originalUrl: 'https://www.youtube.com/watch?v=Omnivore',
                        itemType: graphql_1.PageType.Video,
                    },
                    {
                        user,
                        title: 'test title 2',
                        readableContent: '<p>test 2</p>',
                        slug: 'test slug 2',
                        originalUrl: `${url}/test2`,
                    },
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns youtube videos', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when site:wikipedia is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'site:wikipedia';
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
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
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns wikipedia pages', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(1);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[0].id);
            });
        });
        context('when label:test1,test2 is in the query', () => {
            let items = [];
            let label1;
            let label2;
            before(async () => {
                keyword = 'label:test1,test2';
                // Create some test items
                label1 = await (0, labels_1.createLabel)('test1', '', user.id);
                label2 = await (0, labels_1.createLabel)('test2', '', user.id);
                items = await (0, library_item_2.createLibraryItems)([
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
                ], user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label1], items[0].id, user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label2], items[1].id, user.id);
            });
            after(async () => {
                await (0, labels_1.deleteLabels)({ id: label1.id }, user.id);
                await (0, labels_1.deleteLabels)({ id: label2.id }, user.id);
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns items with label test1 or test2', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(2);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[1].id);
                (0, chai_1.expect)(res.body.data.search.edges[1].node.id).to.eq(items[0].id);
            });
        });
        context('when label:test1 OR label:test2 is in the query', () => {
            let items = [];
            let label1;
            let label2;
            before(async () => {
                keyword = 'label:test1 OR label:test2';
                // Create some test items
                label1 = await (0, labels_1.createLabel)('test1', '', user.id);
                label2 = await (0, labels_1.createLabel)('test2', '', user.id);
                items = await (0, library_item_2.createLibraryItems)([
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
                ], user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label1], items[0].id, user.id);
                await (0, db_1.saveLabelsInLibraryItem)([label2], items[1].id, user.id);
            });
            after(async () => {
                await (0, labels_1.deleteLabels)({ id: label1.id }, user.id);
                await (0, labels_1.deleteLabels)({ id: label2.id }, user.id);
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns items with label test1 or test2', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eq(2);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[1].id);
                (0, chai_1.expect)(res.body.data.search.edges[1].node.id).to.eq(items[0].id);
            });
        });
        context('when sort:score is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'sort:score score';
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
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
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns items in descending order of score', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eql(3);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[2].id);
                (0, chai_1.expect)(res.body.data.search.edges[1].node.id).to.eq(items[1].id);
                (0, chai_1.expect)(res.body.data.search.edges[2].node.id).to.eq(items[0].id);
            });
        });
        context('when sort:wordscount is in the query', () => {
            let items = [];
            before(async () => {
                keyword = 'wordscount:>=10000 sort:wordscount';
                // Create some test items
                items = await (0, library_item_2.createLibraryItems)([
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
                ], user.id);
            });
            after(async () => {
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('returns items in descending order of word count', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.search.pageInfo.totalCount).to.eql(3);
                (0, chai_1.expect)(res.body.data.search.edges[0].node.id).to.eq(items[2].id);
                (0, chai_1.expect)(res.body.data.search.edges[1].node.id).to.eq(items[1].id);
                (0, chai_1.expect)(res.body.data.search.edges[2].node.id).to.eq(items[0].id);
            });
        });
    });
    describe('TypeaheadSearch API', () => {
        const items = [];
        let query = '';
        const keyword = 'typeahead';
        before(async () => {
            // Create some test items
            for (let i = 0; i < 5; i++) {
                const itemToSave = {
                    user,
                    title: 'typeahead search item',
                    readableContent: '<p>test</p>',
                    slug: '',
                    originalUrl: `https://blog.omnivore.work/p/typeahead-search-${i}`,
                };
                const item = await (0, library_item_2.createOrUpdateLibraryItem)(itemToSave, user.id, undefined, true);
                items.push(item);
            }
        });
        beforeEach(() => {
            query = typeaheadSearchQuery(keyword);
        });
        after(async () => {
            await (0, library_item_2.deleteLibraryItemsByUserId)(user.id);
        });
        it('returns items with typeahead prefix', async () => {
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.typeaheadSearch.items.length).to.eql(5);
            (0, chai_1.expect)(res.body.data.typeaheadSearch.items[0].id).to.eq(items[4].id);
            (0, chai_1.expect)(res.body.data.typeaheadSearch.items[1].id).to.eq(items[3].id);
            (0, chai_1.expect)(res.body.data.typeaheadSearch.items[2].id).to.eq(items[2].id);
            (0, chai_1.expect)(res.body.data.typeaheadSearch.items[3].id).to.eq(items[1].id);
            (0, chai_1.expect)(res.body.data.typeaheadSearch.items[4].id).to.eq(items[0].id);
        });
    });
    describe('UpdatesSince API', () => {
        const updatesSinceQuery = (since) => `
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
    `;
        let since;
        const items = [];
        const deletedItems = [];
        before(async () => {
            // Create some test items
            for (let i = 0; i < 5; i++) {
                const itemToSave = {
                    title: 'test item',
                    slug: '',
                    readableContent: '<p>test</p>',
                    originalUrl: `https://blog.omnivore.work/p/updates-since-${i}`,
                    user,
                };
                const item = await (0, library_item_2.createOrUpdateLibraryItem)(itemToSave, user.id, undefined, true);
                items.push(item);
            }
            // set the since to be the timestamp before deletion
            since = items[4].updatedAt.toISOString();
            // Delete some items
            for (let i = 0; i < 3; i++) {
                await (0, library_item_2.softDeleteLibraryItem)(items[i].id, user.id);
                deletedItems.push(items[i]);
            }
        });
        after(async () => {
            // Delete all items
            await (0, library_item_2.deleteLibraryItemsByUserId)(user.id);
        });
        it('returns items deleted after since', async () => {
            const res = await (0, util_1.graphqlRequest)(updatesSinceQuery(since), authToken).expect(200);
            (0, chai_1.expect)(res.body.data.updatesSince.edges.filter((e) => e.updateReason === graphql_1.UpdateReason.Deleted).length).to.eql(3);
            (0, chai_1.expect)(res.body.data.updatesSince.edges[0].itemID).to.eq(deletedItems[2].id);
            (0, chai_1.expect)(res.body.data.updatesSince.edges[1].itemID).to.eq(deletedItems[1].id);
            (0, chai_1.expect)(res.body.data.updatesSince.edges[2].itemID).to.eq(deletedItems[0].id);
            (0, chai_1.expect)(res.body.data.updatesSince.edges[0].updateReason).to.eq(graphql_1.UpdateReason.Deleted);
        });
        context('when since is -1000000000-01-01T00:00:00Z from android app', () => {
            before(() => {
                since = '-1000000000-01-01T00:00:00Z';
            });
            it('returns all', async () => {
                const res = await (0, util_1.graphqlRequest)(updatesSinceQuery(since), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.updatesSince.edges.length).to.eql(5);
            });
        });
        context('returns highlights', () => {
            let highlight;
            before(async () => {
                highlight = await (0, db_1.createHighlight)({
                    user,
                    shortId: 'test short id',
                    quote: 'test',
                    libraryItem: items[0],
                }, items[0].id, user.id);
            });
            it('returns highlights', async () => {
                const res = await (0, util_1.graphqlRequest)(updatesSinceQuery(since), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.updatesSince.edges[0].node.highlights[0].id).to.eq(highlight.id);
                (0, chai_1.expect)(res.body.data.updatesSince.edges[0].node.highlights[0].type).to.eq(graphql_1.HighlightType.Highlight);
            });
        });
    });
    describe('BulkAction API', () => {
        const bulkActionQuery = (action, query = 'in:all') => `
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
    `;
        xcontext('when action is MarkAsRead and query is in:unread', () => {
            before(async () => {
                // Create some test items
                for (let i = 0; i < 5; i++) {
                    await (0, library_item_2.createOrUpdateLibraryItem)({
                        user,
                        itemType: i == 0 ? graphql_1.PageType.Article : graphql_1.PageType.File,
                        title: 'test item',
                        readableContent: '<p>test</p>',
                        slug: '',
                        state: i == 0 ? library_item_1.LibraryItemState.Failed : library_item_1.LibraryItemState.Succeeded,
                        originalUrl: `https://blog.omnivore.work/p/bulk-action-${i}`,
                    }, user.id, undefined, true);
                }
            });
            after(async () => {
                // Delete all items
                await (0, library_item_2.deleteLibraryItemsByUserId)(user.id);
            });
            it('marks unread items as read', async () => {
                const res = await (0, util_1.graphqlRequest)(bulkActionQuery(graphql_1.BulkActionType.MarkAsRead, 'is:unread'), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.bulkAction.success).to.be.true;
                const items = await (0, util_1.graphqlRequest)(searchQuery('is:unread'), authToken).expect(200);
                (0, chai_1.expect)(items.body.data.search.pageInfo.totalCount).to.eql(0);
            });
        });
        context('when action is Archive and query is published:*..2023-10-01', () => {
            let items = [];
            before(async () => {
                items = await (0, library_item_2.createLibraryItems)([
                    {
                        user,
                        title: 'test item',
                        readableContent: '<p>test</p>',
                        slug: 'test-item',
                        originalUrl: `https://blog.omnivore.work/p/bulk-action-archive`,
                        publishedAt: new Date('2023-10-01'),
                    },
                    {
                        user,
                        title: 'test item 2',
                        readableContent: '<p>test</p>',
                        slug: 'test-item-2',
                        originalUrl: `https://blog.omnivore.work/p/bulk-action-archive-2`,
                        publishedAt: new Date('2023-10-02'),
                    },
                ], user.id);
            });
            after(async () => {
                // Delete all items
                await (0, library_item_2.deleteLibraryItems)(items, user.id);
            });
            it('archives old items', async () => {
                const res = await (0, util_1.graphqlRequest)(bulkActionQuery(graphql_1.BulkActionType.Archive, 'published:*..2023-10-01'), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.bulkAction.success).to.be.true;
                const response = await (0, util_1.graphqlRequest)(searchQuery('in:archive'), authToken).expect(200);
                (0, chai_1.expect)(response.body.data.search.pageInfo.totalCount).to.eql(1);
                (0, chai_1.expect)(response.body.data.search.edges[0].node.id).to.eql(items[0].id);
            });
        });
        context('when action is Delete and query contains item id', () => {
            const items = [];
            before(async () => {
                // Create some test items
                for (let i = 0; i < 5; i++) {
                    const item = await (0, library_item_2.createOrUpdateLibraryItem)({
                        user,
                        itemType: i == 0 ? graphql_1.PageType.Article : graphql_1.PageType.File,
                        title: 'test item',
                        readableContent: '<p>test</p>',
                        slug: '',
                        state: i == 0 ? library_item_1.LibraryItemState.Failed : library_item_1.LibraryItemState.Succeeded,
                        originalUrl: `https://blog.omnivore.work/p/bulk-action-${i}`,
                    }, user.id, undefined, true);
                    items.push(item);
                }
            });
            after(async () => {
                // Delete all items
                await (0, library_item_2.deleteLibraryItemsByUserId)(user.id);
            });
            it('deletes all items', async () => {
                const query = `includes:${items.map((i) => i.id).join(',')}`;
                const res = await (0, util_1.graphqlRequest)(bulkActionQuery(graphql_1.BulkActionType.Delete, query), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.bulkAction.success).to.be.true;
                const response = await (0, util_1.graphqlRequest)(searchQuery(query), authToken).expect(200);
                (0, chai_1.expect)(response.body.data.search.pageInfo.totalCount).to.eql(0);
            });
        });
        context('when action is MarkAsSeen and query contains a list of item id', () => {
            const items = [];
            before(async () => {
                // Create some test items
                for (let i = 0; i < 5; i++) {
                    const item = await (0, library_item_2.createOrUpdateLibraryItem)({
                        user,
                        title: 'test item',
                        slug: '',
                        originalUrl: `https://blog.omnivore.work/p/bulk-action-${i}`,
                    }, user.id, undefined, true);
                    items.push(item);
                }
            });
            after(async () => {
                // Delete all items
                await (0, library_item_2.deleteLibraryItemsByUserId)(user.id);
            });
            it('marks items as seen', async () => {
                const query = `includes:${items.map((i) => i.id).join(',')}`;
                const res = await (0, util_1.graphqlRequest)(bulkActionQuery(graphql_1.BulkActionType.MarkAsSeen, query), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.bulkAction.success).to.be.true;
                const response = await (0, util_1.graphqlRequest)(searchQuery('is:seen'), authToken).expect(200);
                (0, chai_1.expect)(response.body.data.search.pageInfo.totalCount).to.eql(5);
            });
        });
    });
    describe('SetFavoriteArticle API', () => {
        const setFavoriteArticleQuery = (articleId) => `
      mutation {
        setFavoriteArticle(id: "${articleId}") {
          ... on SetFavoriteArticleSuccess {
            success
          }
          ... on SetFavoriteArticleError {
            errorCodes
          }
        }
      }`;
        let articleId = '';
        before(async () => {
            const itemToSave = {
                user,
                title: 'test setFavoriteArticle',
                slug: '',
                readableContent: '<p>test</p>',
                originalUrl: `https://blog.omnivore.work/p/setFavoriteArticle`,
            };
            const item = await (0, library_item_2.createOrUpdateLibraryItem)(itemToSave, user.id, undefined, true);
            articleId = item.id;
        });
        after(async () => {
            // Delete the item
            await (0, library_item_2.deleteLibraryItemById)(articleId, user.id);
        });
        it('favorites the article', async () => {
            await (0, util_1.graphqlRequest)(setFavoriteArticleQuery(articleId), authToken).expect(200);
            const item = await (0, library_item_2.findLibraryItemById)(articleId, user.id, {
                relations: {
                    labels: true,
                },
            });
            (0, chai_1.expect)(item?.labels?.map((l) => l.name)).to.eql(['Favorites']);
        });
    });
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
      }`;
        const items = [];
        before(async () => {
            // Create some test items
            for (let i = 0; i < 5; i++) {
                const itemToSave = {
                    user,
                    title: 'test item',
                    readableContent: '<p>test</p>',
                    slug: '',
                    originalUrl: `https://blog.omnivore.work/p/empty-trash-${i}`,
                    deletedAt: new Date(),
                    state: library_item_1.LibraryItemState.Deleted,
                };
                const item = await (0, library_item_2.createOrUpdateLibraryItem)(itemToSave, user.id, undefined, true);
                items.push(item);
            }
        });
        after(async () => {
            // Delete all items
            await (0, library_item_2.deleteLibraryItemsByUserId)(user.id);
        });
        it('empties the trash', async () => {
            await (0, util_1.graphqlRequest)(emptyTrashQuery(), authToken).expect(200);
            const count = await (0, library_item_2.countLibraryItems)({
                query: 'in:trash',
                includeDeleted: true,
            }, user.id);
            (0, chai_1.expect)(count).to.eql(0);
        });
    });
});
