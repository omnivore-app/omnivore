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
const nock_1 = __importDefault(require("nock"));
const sinon_1 = __importDefault(require("sinon"));
const env_1 = require("../../src/env");
const user_1 = require("../../src/services/user");
const createTask = __importStar(require("../../src/utils/createTask"));
const db_1 = require("../db");
const util_1 = require("../util");
describe('/article/save API', () => {
    let user;
    let authToken;
    // We need to mock the pupeeteer-parse
    // service here because in dev mode the task gets
    // called immediately.
    if (env_1.env.queue.contentFetchUrl) {
        (0, nock_1.default)(env_1.env.queue.contentFetchUrl).post('/').reply(200);
    }
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
    describe('POST /article/save', () => {
        const url = 'https://blog.omnivore.work';
        before(() => {
            sinon_1.default.replace(createTask, 'enqueueFetchContentJob', sinon_1.default.fake.resolves(''));
        });
        after(() => {
            sinon_1.default.restore();
        });
        context('when token and url are valid', () => {
            it('should create an article saving request', async () => {
                const response = await util_1.request
                    .post('/api/article/save')
                    .send({
                    url,
                    v: '0.2.18',
                })
                    .set('Accept', 'application/x-www-form-urlencoded')
                    .set('Cookie', `auth=${authToken}`);
                (0, chai_1.expect)(response.body.articleSavingRequestId).to.be.a('string');
            });
        });
    });
});
