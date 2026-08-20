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
const graphql_1 = require("../../src/generated/graphql");
const user_1 = require("../../src/services/user");
chai.use(chai_string_1.default);
const deleteAccountRequest = async (authToken, userId) => {
    const mutation = `
  mutation {
    deleteAccount(
      userID: "${userId}",
    ) {
      ... on DeleteAccountSuccess {
        userID
      }
      ... on DeleteAccountError {
        errorCodes
      }
    }
  }
  `;
    return (0, util_1.graphqlRequest)(mutation, authToken).expect(200);
};
describe('the deleteAccount API', () => {
    let authToken;
    let user;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('newFakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
    });
    after(async () => {
        await (0, user_1.deleteUser)(user.id);
    });
    context('deleting a user that exists', () => {
        it('should return the user id after a successful user deletion', async () => {
            const res = await deleteAccountRequest(authToken, user.id);
            (0, chai_1.expect)(res.body.data.deleteAccount.userID).to.eql(user.id);
        });
    });
    context('deleting a user that does not exist', () => {
        it('should return a user not found error if user id is invalid', async () => {
            const res = await deleteAccountRequest(authToken, (0, util_1.generateFakeUuid)());
            (0, chai_1.expect)(res.body.data.deleteAccount.errorCodes).to.contain(graphql_1.DeleteAccountErrorCode.UserNotFound);
        });
    });
});
