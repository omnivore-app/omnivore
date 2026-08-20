"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const folder_policy_1 = require("../../src/entity/folder_policy");
const folder_policy_2 = require("../../src/services/folder_policy");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Folder Policy API', () => {
    let loginUser;
    let authToken;
    before(async () => {
        // create test user and login
        loginUser = await (0, db_1.createTestUser)('loginUser');
        authToken = await (0, util_1.loginAndGetAuthToken)(loginUser.email);
    });
    after(async () => {
        await (0, user_1.deleteUser)(loginUser.id);
    });
    describe('List Folder Policy', () => {
        const query = `
      query {
        folderPolicies {
          ... on FolderPoliciesSuccess {
            policies {
              id
              folder
              action
              createdAt
              updatedAt
            }
          }
          ... on FolderPoliciesError {
            errorCodes
          }
        }
      }
    `;
        it('should return a list of folder policy of the user in ascending order', async () => {
            const existingPolicy = await (0, folder_policy_2.createFolderPolicy)({
                userId: loginUser.id,
                folder: 'inbox',
                action: folder_policy_1.FolderPolicyAction.Archive,
                afterDays: 30,
            });
            const existingPolicy1 = await (0, folder_policy_2.createFolderPolicy)({
                userId: loginUser.id,
                folder: 'following',
                action: folder_policy_1.FolderPolicyAction.Archive,
                afterDays: 30,
            });
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            const policies = res.body.data.folderPolicies
                .policies;
            (0, chai_1.expect)(policies).to.have.lengthOf(2);
            (0, chai_1.expect)(policies[0].id).to.equal(existingPolicy1.id);
            (0, chai_1.expect)(policies[1].id).to.equal(existingPolicy.id);
            await (0, folder_policy_2.deleteFolderPolicy)(loginUser.id, existingPolicy.id);
        });
    });
    describe('Create Folder Policy', () => {
        const mutation = `
      mutation CreateFolderPolicy($input: CreateFolderPolicyInput!) {
        createFolderPolicy(input: $input) {
          ... on CreateFolderPolicySuccess {
            policy {
              id
              folder
              action
              createdAt
              updatedAt
            }
          }
          ... on CreateFolderPolicyError {
            errorCodes
          }
        }
      }
    `;
        it('should create a folder policy', async () => {
            const input = {
                folder: 'test-folder',
                action: folder_policy_1.FolderPolicyAction.Archive,
                afterDays: 30,
            };
            const res = await (0, util_1.graphqlRequest)(mutation, authToken, { input }).expect(200);
            const createdPolicy = res.body.data.createFolderPolicy
                .policy;
            const policy = await (0, folder_policy_2.findFolderPolicyById)(loginUser.id, createdPolicy.id);
            (0, chai_1.expect)(policy).to.exist;
            (0, chai_1.expect)(policy?.folder).to.equal(input.folder);
            await (0, folder_policy_2.deleteFolderPolicy)(loginUser.id, createdPolicy.id);
        });
    });
    describe('Update Folder Policy', () => {
        let existingPolicy;
        before(async () => {
            existingPolicy = await (0, folder_policy_2.createFolderPolicy)({
                userId: loginUser.id,
                folder: 'test-folder',
                action: folder_policy_1.FolderPolicyAction.Archive,
                afterDays: 30,
            });
        });
        after(async () => {
            await (0, folder_policy_2.deleteFolderPolicy)(loginUser.id, existingPolicy.id);
        });
        const mutation = `
      mutation UpdateFolderPolicy($input: UpdateFolderPolicyInput!) {
        updateFolderPolicy(input: $input) {
          ... on UpdateFolderPolicySuccess {
            policy {
              id
              folder
              action
              createdAt
              updatedAt
            }
          }
          ... on UpdateFolderPolicyError {
            errorCodes
          }
        }
      }
    `;
        it('should update a folder policy', async () => {
            const input = {
                id: existingPolicy.id,
                action: folder_policy_1.FolderPolicyAction.Delete,
                afterDays: 30,
            };
            const res = await (0, util_1.graphqlRequest)(mutation, authToken, { input }).expect(200);
            const updatedPolicy = res.body.data.updateFolderPolicy
                .policy;
            const policy = await (0, folder_policy_2.findFolderPolicyById)(loginUser.id, updatedPolicy.id);
            (0, chai_1.expect)(policy).to.exist;
            (0, chai_1.expect)(policy?.action).to.equal(input.action);
        });
    });
    describe('Delete Folder Policy', () => {
        let existingPolicy;
        before(async () => {
            existingPolicy = await (0, folder_policy_2.createFolderPolicy)({
                userId: loginUser.id,
                folder: 'test-folder',
                action: folder_policy_1.FolderPolicyAction.Archive,
                afterDays: 30,
            });
        });
        const mutation = `
      mutation DeleteFolderPolicy($id: ID!) {
        deleteFolderPolicy(id: $id) {
          ... on DeleteFolderPolicySuccess {
            success
          }
          ... on DeleteFolderPolicyError {
            errorCodes
          }
        }
      }
    `;
        it('should delete a folder policy', async () => {
            const res = await (0, util_1.graphqlRequest)(mutation, authToken, {
                id: existingPolicy.id,
            }).expect(200);
            const result = res.body.data
                .deleteFolderPolicy;
            (0, chai_1.expect)(result.success).to.be.true;
        });
    });
});
