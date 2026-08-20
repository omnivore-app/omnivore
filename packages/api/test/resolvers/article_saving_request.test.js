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
const chai_1 = require("chai");
require("mocha");
const sinon_1 = __importDefault(require("sinon"));
const graphql_1 = require("../../src/generated/graphql");
const library_item_1 = require("../../src/services/library_item");
const user_1 = require("../../src/services/user");
const createTask = __importStar(require("../../src/utils/createTask"));
const db_1 = require("../db");
const util_1 = require("../util");
const articleSavingRequestQuery = `
  query ArticleSavingRequest($id: ID, $url: String) {
    articleSavingRequest(id: $id, url: $url) {
      ... on ArticleSavingRequestSuccess {
        articleSavingRequest {
          id
          status
          user {
            id
            profile {
              id
              username
            }
          }
        }
      }
      ... on ArticleSavingRequestError {
        errorCodes
      }
    }
  }
`;
const createArticleSavingRequestMutation = (url) => `
  mutation {
    createArticleSavingRequest(input: {
      url: "${url}"
    }) {
      ... on CreateArticleSavingRequestSuccess {
        articleSavingRequest {
          id
          status
          url
        }
      }
      ... on CreateArticleSavingRequestError {
        errorCodes
      }
    }
  }
`;
describe('ArticleSavingRequest API', () => {
    let authToken;
    let user;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
        sinon_1.default.replace(createTask, 'enqueueFetchContentJob', sinon_1.default.fake.resolves(''));
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
        sinon_1.default.restore();
    });
    describe('createArticleSavingRequest', () => {
        it('returns the article saving request', async () => {
            const res = await (0, util_1.graphqlRequest)(createArticleSavingRequestMutation('https://blog.omnivore.work'), authToken).expect(200);
            (0, chai_1.expect)(res.body.data.createArticleSavingRequest.articleSavingRequest.status).to.eql(graphql_1.ArticleSavingRequestStatus.Processing);
        });
        it('creates a library item in db', async () => {
            const url = 'https://blog.omnivore.work/1';
            await (0, util_1.graphqlRequest)(createArticleSavingRequestMutation('https://blog.omnivore.work/1'), authToken).expect(200);
            const item = await (0, library_item_1.findLibraryItemByUrl)(url, user.id);
            (0, chai_1.expect)(item?.readableContent).to.eql('Your link is being saved...');
        });
        it('returns an error if the url is invalid', async () => {
            const res = await (0, util_1.graphqlRequest)(createArticleSavingRequestMutation('invalid url'), authToken).expect(200);
            (0, chai_1.expect)(res.body.data.createArticleSavingRequest.errorCodes).to.eql([
                graphql_1.CreateArticleSavingRequestErrorCode.BadData,
            ]);
        });
    });
    describe('articleSavingRequest', () => {
        let url;
        let id;
        before(async () => {
            url = 'https://blog.omnivore.work/2';
            // create article saving request
            const res = await (0, util_1.graphqlRequest)(createArticleSavingRequestMutation(url), authToken).expect(200);
            id = res.body.data.createArticleSavingRequest.articleSavingRequest
                .id;
        });
        it('returns the article saving request if exists', async () => {
            const res = await (0, util_1.graphqlRequest)(articleSavingRequestQuery, authToken, {
                id,
            }).expect(200);
            (0, chai_1.expect)(res.body.data.articleSavingRequest.articleSavingRequest.status).to.eql(graphql_1.ArticleSavingRequestStatus.Processing);
        });
        it('returns the user profile info', async () => {
            const res = await (0, util_1.graphqlRequest)(articleSavingRequestQuery, authToken, {
                url,
            }).expect(200);
            (0, chai_1.expect)(res.body.data.articleSavingRequest.articleSavingRequest.user.profile
                .username).to.eql('fakeUser');
        });
        it('returns the article saving request by id', async () => {
            const res = await (0, util_1.graphqlRequest)(articleSavingRequestQuery, authToken, {
                id,
            }).expect(200);
            (0, chai_1.expect)(res.body.data.articleSavingRequest.articleSavingRequest.status).to.eql(graphql_1.ArticleSavingRequestStatus.Processing);
        });
        it('returns not_found if not exists', async () => {
            const res = await (0, util_1.graphqlRequest)(articleSavingRequestQuery, authToken, {
                id: 'invalid-id',
            }).expect(200);
            (0, chai_1.expect)(res.body.data.articleSavingRequest.errorCodes).to.eql([
                graphql_1.ArticleSavingRequestErrorCode.NotFound,
            ]);
        });
    });
});
