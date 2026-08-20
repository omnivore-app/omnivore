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
const library_item_1 = require("../../src/services/library_item");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
chai.use(chai_string_1.default);
// INPUT
// clientRequestId?: InputMaybe<Scalars['String']>;
// contentType: Scalars['String'];
// createPageEntry?: InputMaybe<Scalars['Boolean']>;
// url: Scalars['String'];
const uploadFileRequest = async (authToken, inputUrl, clientRequestId, createPageEntry = true) => {
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
  `;
    return (0, util_1.graphqlRequest)(query, authToken).expect(200);
};
describe('uploadFileRequest API', () => {
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
        await (0, user_1.deleteUser)(user.id);
    });
    describe('UploadFileRequest', () => {
        context('when create article is true', () => {
            const clientRequestId = (0, util_1.generateFakeUuid)();
            after(async () => {
                await (0, library_item_1.deleteLibraryItemById)(clientRequestId);
            });
            xit('should create an article if create article is true', async () => {
                const res = await uploadFileRequest(authToken, 'https://www.google.com', clientRequestId, true);
                (0, chai_1.expect)(res.body.data.uploadFileRequest.createdPageId).to.eql(clientRequestId);
                const item = await (0, library_item_1.findLibraryItemById)(clientRequestId, user.id);
                (0, chai_1.expect)(item).to.be;
            });
            xit('should not save a file:// URL', async () => {
                const res = await uploadFileRequest(authToken, 'file://foo.bar', clientRequestId, true);
                (0, chai_1.expect)(res.body.data.uploadFileRequest.createdPageId).to.eql(clientRequestId);
                const item = await (0, library_item_1.findLibraryItemById)(clientRequestId, user.id);
                (0, chai_1.expect)(item?.originalUrl).to.startWith('https://');
            });
        });
    });
});
