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
const db_1 = require("../db");
const util_1 = require("../util");
const chai = __importStar(require("chai"));
const chai_1 = require("chai");
require("mocha");
const chai_string_1 = __importDefault(require("chai-string"));
const user_1 = require("../../src/services/user");
chai.use(chai_string_1.default);
const uploadImportFile = async (authToken, fileType, contentType) => {
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
  }`;
    return (0, util_1.graphqlRequest)(query, authToken).expect(200);
};
describe('uploadImportFile API', () => {
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
    describe('UploadImportFile', () => {
        context('when it is a pocket file', () => {
            xit('should create an upload URL', async () => {
                const res = await uploadImportFile(authToken, 'POCKET', 'text/csv');
                (0, chai_1.expect)(res.body.data.uploadImportFile.uploadSignedUrl).to.not.be.null;
            });
        });
        context('when it is a pocket file', () => {
            xit('should create an upload URL', async () => {
                const res = await uploadImportFile(authToken, 'URL_LIST', 'text/csv');
                (0, chai_1.expect)(res.body.data.uploadImportFile.uploadSignedUrl).to.not.be.null;
            });
        });
    });
});
