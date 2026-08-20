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
const jwt = __importStar(require("jsonwebtoken"));
require("mocha");
const sinon_1 = __importDefault(require("sinon"));
const env_1 = require("../../src/env");
const user_1 = require("../../src/repository/user");
const features_1 = require("../../src/services/features");
const user_2 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('features resolvers', () => {
    let loginUser;
    let authToken;
    before(async () => {
        // create test user and login
        loginUser = await (0, db_1.createTestUser)('loginUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: loginUser.email });
        authToken = res.body.authToken;
    });
    after(async () => {
        await (0, user_2.deleteUser)(loginUser.id);
    });
    describe('optInFeature API', () => {
        const featureName = 'ultra-realistic-voice';
        const now = new Date();
        let clock;
        const query = (name) => `
      mutation {
        optInFeature(input: {
          name: "${name}"
        }) {
          ... on OptInFeatureSuccess {
            feature {
              name
              grantedAt
              token
            }
          }
          ... on OptInFeatureError {
            errorCodes
          }
        }
      }
    `;
        before(() => {
            console.log('opting in to feature');
            // mock date and ignore milliseconds
            clock = sinon_1.default.useFakeTimers(now.setSeconds(now.getSeconds(), 0));
        });
        after(() => {
            clock.restore();
        });
        context('when user is the first 1500 users', () => {
            after(async () => {
                // reset feature
                await (0, features_1.deleteFeature)({ user: { id: loginUser.id } });
            });
            it('opts in to the feature', async () => {
                const res = await (0, util_1.graphqlRequest)(query(featureName), authToken).expect(200);
                const token = jwt.sign({
                    uid: loginUser.id,
                    featureName,
                    grantedAt: Date.now() / 1000,
                }, env_1.env.server.jwtSecret, { expiresIn: '1y' });
                (0, chai_1.expect)(res.body.data.optInFeature).to.eql({
                    feature: {
                        name: featureName,
                        grantedAt: new Date().toISOString(),
                        token,
                    },
                });
            });
        });
        context('when user is not the first 1500 users', () => {
            let users;
            before(async () => {
                // create 1500 opt-in users
                const usersToSave = Array.from(Array(1500).keys()).map((i) => {
                    return {
                        name: `opt-in-user-${i}`,
                        source: 'GOOGLE',
                        sourceUserId: `fake-user-id-user${i}`,
                        email: `opt-in-user-${i}@omnivore.work`,
                        username: `user${i}`,
                        bio: `i am user${i}`,
                    };
                });
                users = await user_1.userRepository.save(usersToSave);
                const features = users.map((user) => {
                    return {
                        user,
                        name: featureName,
                        grantedAt: new Date(),
                    };
                });
                await (0, features_1.createFeatures)(features);
            });
            after(async () => {
                // reset opt-in users
                await (0, user_2.deleteUsers)(users.map((user) => user.id));
                // reset feature
                await (0, features_1.deleteFeature)({ name: featureName });
            });
            it('does not opt in to the feature', async () => {
                const res = await (0, util_1.graphqlRequest)(query(featureName), authToken).expect(200);
                const token = jwt.sign({
                    uid: loginUser.id,
                    featureName,
                    grantedAt: null,
                }, env_1.env.server.jwtSecret, { expiresIn: '1y' });
                (0, chai_1.expect)(res.body.data.optInFeature).to.eql({
                    feature: {
                        name: featureName,
                        grantedAt: null,
                        token,
                    },
                });
            });
        });
        context('when user is already opted in', () => {
            const grantedAt = new Date('2024-05-15');
            before(async () => {
                // opt in
                await (0, features_1.createFeature)({
                    user: { id: loginUser.id },
                    name: featureName,
                    grantedAt,
                });
            });
            after(async () => {
                // reset feature
                await (0, features_1.deleteFeature)({ user: { id: loginUser.id } });
            });
            it('returns the feature', async () => {
                const res = await (0, util_1.graphqlRequest)(query(featureName), authToken).expect(200);
                const token = jwt.sign({
                    uid: loginUser.id,
                    featureName,
                    grantedAt: grantedAt.getTime() / 1000,
                }, env_1.env.server.jwtSecret, { expiresIn: '1y' });
                (0, chai_1.expect)(res.body.data.optInFeature).to.eql({
                    feature: {
                        name: featureName,
                        grantedAt: grantedAt.toISOString(),
                        token,
                    },
                });
            });
        });
    });
});
