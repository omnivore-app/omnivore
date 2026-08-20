"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const highlights_1 = require("../../src/services/highlights");
const labels_1 = require("../../src/services/labels");
const library_item_1 = require("../../src/services/library_item");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Labels API', () => {
    let user;
    let authToken;
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
    describe('GET labels', () => {
        let query;
        before(async () => {
            //  create testing labels
            await (0, labels_1.createLabel)('label_1', '#ffffff', user.id);
            await (0, labels_1.createLabel)('label_2', '#eeeeee', user.id);
        });
        after(async () => {
            // clean up
            await (0, labels_1.deleteLabels)({ user: { id: user.id } }, user.id);
        });
        beforeEach(() => {
            query = `
        query {
          labels {
            ... on LabelsSuccess {
              labels {
                id
                name
                color
                description
                createdAt
              }
            }
            ... on LabelsError {
              errorCodes
            }
          }
        }
      `;
        });
        it('should return labels', async () => {
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            const labels = await (0, labels_1.findLabelsByUserId)(user.id);
            (0, chai_1.expect)(res.body.data.labels.labels).to.eql(labels.map((label) => ({
                id: label.id,
                name: label.name,
                color: label.color,
                description: label.description,
                createdAt: new Date(label.createdAt.setMilliseconds(0)).toISOString(),
            })));
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        query {
          labels {}
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Create label', () => {
        const query = `
        mutation CreateLabel($input: CreateLabelInput!) {
          createLabel(input: $input) {
            ... on CreateLabelSuccess {
              label {
                id
                name
              }
            }
            ... on CreateLabelError {
              errorCodes
            }
          }
        }
      `;
        context('when name not exists', () => {
            const name = 'label3';
            after(async () => {
                // clean up
                await (0, labels_1.deleteLabels)({ name }, user.id);
            });
            it('should create label', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { name },
                }).expect(200);
                const label = await (0, labels_1.findLabelById)(res.body.data.createLabel.label.id, user.id);
                (0, chai_1.expect)(label).to.exist;
            });
        });
        context('when name exists in the user library', () => {
            let existingLabel;
            before(async () => {
                existingLabel = await (0, labels_1.createLabel)('label3', '#ffffff', user.id);
            });
            after(async () => {
                await (0, labels_1.deleteLabels)({ id: existingLabel.id }, user.id);
            });
            it('should return error code LABEL_ALREADY_EXISTS', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { name: existingLabel.name },
                }).expect(200);
                (0, chai_1.expect)(res.body.data.createLabel.errorCodes).to.eql([
                    'LABEL_ALREADY_EXISTS',
                ]);
            });
            it('returns error code LABEL_ALREADY_EXISTS if case-insensitive label name exists', async () => {
                const name = existingLabel.name.toUpperCase();
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { name },
                }).expect(200);
                (0, chai_1.expect)(res.body.data.createLabel.errorCodes).to.eql([
                    'LABEL_ALREADY_EXISTS',
                ]);
            });
        });
        context('when name exists in the other user library', () => {
            let existingLabel;
            let otherUser;
            before(async () => {
                otherUser = await (0, db_1.createTestUser)('otherUser');
                existingLabel = await (0, labels_1.createLabel)('label3', '#ffffff', otherUser.id);
            });
            after(async () => {
                // delete other user will also delete the label
                await (0, user_1.deleteUser)(otherUser.id);
            });
            it('creates the label', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { name: existingLabel.name },
                }).expect(200);
                const label = await (0, labels_1.findLabelById)(res.body.data.createLabel.label.id, user.id);
                (0, chai_1.expect)(label).to.exist;
            });
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        mutation {
          createLabel {}
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Delete label', () => {
        let labelId;
        const query = `
        mutation DeleteLabel($labelId: ID!){
          deleteLabel(id: $labelId) {
            ... on DeleteLabelSuccess {
              label {
                id
                name
              }
            }
            ... on DeleteLabelError {
              errorCodes
            }
          }
        }
      `;
        context('when label exists', () => {
            let toDeleteLabel;
            context('when label is internal', () => {
                before(async () => {
                    toDeleteLabel = await (0, labels_1.createLabel)('rss', '#ffffff', user.id);
                    labelId = toDeleteLabel.id;
                });
                it('should delete label', async () => {
                    await (0, util_1.graphqlRequest)(query, authToken, {
                        labelId,
                    }).expect(200);
                    const label = await (0, labels_1.findLabelById)(labelId, user.id);
                    (0, chai_1.expect)(label).not.exist;
                });
            });
            context('when label is not used', () => {
                before(async () => {
                    toDeleteLabel = await (0, labels_1.createLabel)('label not in use', '#ffffff', user.id);
                    labelId = toDeleteLabel.id;
                });
                it('should delete label', async () => {
                    await (0, util_1.graphqlRequest)(query, authToken, {
                        labelId,
                    }).expect(200);
                    const label = await (0, labels_1.findLabelById)(labelId, user.id);
                    (0, chai_1.expect)(label).not.exist;
                });
            });
            context('when a page has this label', () => {
                let item;
                before(async () => {
                    toDeleteLabel = await (0, labels_1.createLabel)('page label', '#ffffff', user.id);
                    labelId = toDeleteLabel.id;
                    item = await (0, db_1.createTestLibraryItem)(user.id, [toDeleteLabel]);
                });
                after(async () => {
                    await (0, library_item_1.deleteLibraryItemById)(item.id);
                });
                it('should update page', async () => {
                    await (0, util_1.graphqlRequest)(query, authToken, {
                        labelId,
                    }).expect(200);
                    const updatedItem = await (0, library_item_1.findLibraryItemById)(item.id, user.id, {
                        relations: {
                            labels: true,
                        },
                    });
                    (0, chai_1.expect)(updatedItem?.labels).not.deep.include(toDeleteLabel);
                });
            });
            context('when a highlight has this label', () => {
                const highlightId = (0, util_1.generateFakeUuid)();
                let item;
                before(async () => {
                    item = await (0, db_1.createTestLibraryItem)(user.id);
                    toDeleteLabel = await (0, labels_1.createLabel)('highlight label', '#ffffff', user.id);
                    const highlight = {
                        id: highlightId,
                        patch: 'test patch',
                        quote: 'test quote',
                        shortId: 'test shortId',
                        user,
                        libraryItem: item,
                    };
                    await (0, highlights_1.createHighlight)(highlight, item.id, user.id);
                    await (0, labels_1.saveLabelsInHighlight)([toDeleteLabel], highlightId);
                });
                after(async () => {
                    await (0, library_item_1.deleteLibraryItemById)(item.id);
                });
                it('should update highlight', async () => {
                    await (0, util_1.graphqlRequest)(query, authToken, {
                        labelId,
                    }).expect(200);
                    const updatedHighlight = await (0, highlights_1.findHighlightById)(highlightId, user.id);
                    (0, chai_1.expect)(updatedHighlight?.labels).not.deep.include(toDeleteLabel);
                });
            });
        });
        context('when label not exist', () => {
            before(() => {
                labelId = (0, util_1.generateFakeUuid)();
            });
            it('should return error code NOT_FOUND', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    labelId,
                }).expect(200);
                (0, chai_1.expect)(res.body.data.deleteLabel.errorCodes).to.eql(['NOT_FOUND']);
            });
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        mutation {
          deleteLabel {}
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Set labels', () => {
        let query;
        let itemId;
        let labelIds = [];
        let labels;
        let item;
        let source;
        before(async () => {
            //  create testing labels
            const label1 = await (0, labels_1.createLabel)('label_1', '#ffffff', user.id);
            const label2 = await (0, labels_1.createLabel)('label_2', '#eeeeee', user.id);
            labels = [label1, label2];
            item = await (0, db_1.createTestLibraryItem)(user.id);
            source = 'user';
        });
        after(async () => {
            // clean up
            await (0, labels_1.deleteLabels)({ user: { id: user.id } }, user.id);
            await (0, library_item_1.deleteLibraryItemById)(item.id);
        });
        beforeEach(() => {
            query = `
        mutation {
          setLabels(
            input: {
              pageId: "${itemId}",
              labelIds: [
                "${labelIds[0]}",
                "${labelIds[1]}"
              ],
              source: "${source}"
            }
          ) {
            ... on SetLabelsSuccess {
              labels {
                id
                name
              }
            }
            ... on SetLabelsError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when labels exists', () => {
            before(() => {
                itemId = item.id;
                labelIds = [labels[0].id, labels[1].id];
                source = 'rule:my-rule';
            });
            it('sets labels', async () => {
                await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const labels = await (0, labels_1.findLabelsByLibraryItemId)(itemId, user.id);
                (0, chai_1.expect)(labels.map((l) => l.id)).to.eql(labelIds);
                (0, chai_1.expect)(labels[0].source).to.eql(source);
            });
        });
        context('when labels not exist', () => {
            before(() => {
                itemId = item.id;
                labelIds = [(0, util_1.generateFakeUuid)(), (0, util_1.generateFakeUuid)()];
            });
            it('should return error code NOT_FOUND', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.setLabels.errorCodes).to.eql(['NOT_FOUND']);
            });
        });
        context('when item not exist', () => {
            before(() => {
                itemId = (0, util_1.generateFakeUuid)();
                labelIds = [labels[0].id, labels[1].id];
            });
            it('should return error code UNAUTHORIZED', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.setLabels.errorCodes).to.eql(['UNAUTHORIZED']);
            });
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        mutation {
          setLabels {}
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Update label', () => {
        let query;
        let labelId;
        let name;
        let color;
        beforeEach(() => {
            query = `
        mutation {
          updateLabel(
            input: {
              labelId: "${labelId}",
              name: "${name}",
              color: "${color}"
            }
          ) {
            ... on UpdateLabelSuccess {
              label {
                id
                name
                color
              }
            }
            ... on UpdateLabelError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when labels exists', () => {
            let toUpdateLabel;
            before(async () => {
                toUpdateLabel = await (0, labels_1.createLabel)('label5', '#ffffff', user.id);
                labelId = toUpdateLabel.id;
                name = 'Updated label';
                color = '#aabbcc';
            });
            after(async () => {
                await (0, labels_1.deleteLabels)({ id: toUpdateLabel.id }, user.id);
            });
            it('should return the updated label', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.updateLabel.label).to.eql({
                    id: labelId,
                    name,
                    color,
                });
            });
            it('should update the label in db', async () => {
                await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const updatedLabel = await (0, labels_1.findLabelById)(labelId, user.id);
                (0, chai_1.expect)(updatedLabel?.name).to.eql(name);
                (0, chai_1.expect)(updatedLabel?.color).to.eql(color);
            });
            context('when an item has the label', () => {
                let item;
                before(async () => {
                    item = await (0, db_1.createTestLibraryItem)(user.id, [toUpdateLabel]);
                });
                after(async () => {
                    await (0, library_item_1.deleteLibraryItemById)(item.id);
                });
                it('should update the item with the label', async () => {
                    await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                    const updatedItem = await (0, library_item_1.findLibraryItemById)(item.id, user.id, {
                        relations: {
                            labels: true,
                        },
                    });
                    const updatedLabel = updatedItem?.labels?.filter((l) => l.id === labelId)?.[0];
                    (0, chai_1.expect)(updatedLabel?.name).to.eql(name);
                    (0, chai_1.expect)(updatedLabel?.color).to.eql(color);
                });
            });
        });
        context('when labels not exist', () => {
            before(() => {
                labelId = (0, util_1.generateFakeUuid)();
            });
            it('should return error code BAD_REQUEST', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.updateLabel.errorCodes).to.eql(['BAD_REQUEST']);
            });
        });
    });
    describe('Set labels for highlight', () => {
        let query;
        let highlightId;
        let labelIds = [];
        let labels;
        let item;
        before(async () => {
            //  create testing labels
            const label1 = await (0, labels_1.createLabel)('label_1', '#ffffff', user.id);
            const label2 = await (0, labels_1.createLabel)('label_2', '#eeeeee', user.id);
            labels = [label1, label2];
            item = await (0, db_1.createTestLibraryItem)(user.id);
        });
        after(async () => {
            // clean up
            await (0, labels_1.deleteLabels)({ user: { id: user.id } }, user.id);
            await (0, library_item_1.deleteLibraryItemById)(item.id);
        });
        beforeEach(() => {
            query = `
        mutation {
          setLabelsForHighlight(
            input: {
              highlightId: "${highlightId}",
              labelIds: [
                "${labelIds[0]}",
                "${labelIds[1]}"
              ]
            }
          ) {
            ... on SetLabelsSuccess {
              labels {
                id
                name
              }
            }
            ... on SetLabelsError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when labels exists', () => {
            before(async () => {
                const highlight = {
                    id: highlightId,
                    patch: 'test patch',
                    quote: 'test quote',
                    shortId: 'test shortId 2',
                    user,
                    libraryItem: item,
                };
                highlightId = (await (0, highlights_1.createHighlight)(highlight, item.id, user.id)).id;
                labelIds = [labels[0].id, labels[1].id];
            });
            it('should set labels for highlight', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.setLabelsForHighlight.labels.map((l) => l.id)).to.eql(labelIds);
            });
        });
        context('when labels not exist', () => {
            before(async () => {
                const highlight = {
                    patch: 'test patch',
                    quote: 'test quote',
                    shortId: 'test shortId 3',
                    user,
                    libraryItem: item,
                };
                highlightId = (await (0, highlights_1.createHighlight)(highlight, item.id, user.id)).id;
                labelIds = [(0, util_1.generateFakeUuid)(), (0, util_1.generateFakeUuid)()];
            });
            it('should return error code NOT_FOUND', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.setLabelsForHighlight.errorCodes).to.eql([
                    'NOT_FOUND',
                ]);
            });
        });
        context('when highlight not exist', () => {
            before(() => {
                highlightId = (0, util_1.generateFakeUuid)();
                labelIds = [labels[0].id, labels[1].id];
            });
            it('should return error code UNAUTHORIZED', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.setLabelsForHighlight.errorCodes).to.eql([
                    'UNAUTHORIZED',
                ]);
            });
        });
    });
    describe('Move label', () => {
        const query = (labelId, afterLabelId) => `
        mutation {
          moveLabel(
            input: {
              labelId: "${labelId}",
              afterLabelId: "${afterLabelId}"
            }
          ) {
            ... on MoveLabelSuccess {
              label {
                id
                position
              }
            }
            ... on MoveLabelError {
              errorCodes
            }
          }
        }
      `;
        let labelId;
        let afterLabelId;
        const labels = [];
        before(async () => {
            //  create testing labels
            for (let i = 0; i < 5; i++) {
                const label = await (0, labels_1.createLabel)(`label_${i}`, '#ffffff', user.id);
                labels.push(label);
            }
        });
        after(async () => {
            // clean up
            await (0, labels_1.deleteLabels)(labels.map((l) => l.id), user.id);
        });
        context('when label exists', () => {
            before(() => {
                labelId = labels[1].id;
                afterLabelId = labels[4].id;
            });
            after(async () => {
                await (0, util_1.graphqlRequest)(query(labelId, labels[0].id), authToken).expect(200);
            });
            it('moves label after the pointed label', async () => {
                const res = await (0, util_1.graphqlRequest)(query(labelId, afterLabelId), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.moveLabel.label.position).to.eql(labels[4].position);
                const reorderedLabels = await (0, labels_1.findLabelsByUserId)(user.id);
                (0, chai_1.expect)(reorderedLabels.map((l) => l.id)).to.eql([
                    labels[0].id,
                    labels[2].id,
                    labels[3].id,
                    labels[4].id,
                    labels[1].id,
                ]);
            });
        });
        context('when afterLabelId is null', () => {
            before(() => {
                labelId = labels[4].id;
            });
            after(async () => {
                await (0, util_1.graphqlRequest)(query(labelId, labels[3].id), authToken).expect(200);
            });
            it('moves the label to the top', async () => {
                const res = await (0, util_1.graphqlRequest)(query(labelId, ''), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.moveLabel.label.position).to.eql(1);
            });
        });
        context('when label not exist', () => {
            before(() => {
                labelId = (0, util_1.generateFakeUuid)();
            });
            it('returns error code NOT_FOUND', async () => {
                const res = await (0, util_1.graphqlRequest)(query(labelId, ''), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.moveLabel.errorCodes).to.eql(['NOT_FOUND']);
            });
        });
        context('when after label not exist', () => {
            before(() => {
                labelId = labels[4].id;
                afterLabelId = (0, util_1.generateFakeUuid)();
            });
            it('returns error code NOT_FOUND', async () => {
                const res = await (0, util_1.graphqlRequest)(query(labelId, afterLabelId), authToken).expect(200);
                (0, chai_1.expect)(res.body.data.moveLabel.errorCodes).to.eql(['NOT_FOUND']);
            });
        });
    });
});
