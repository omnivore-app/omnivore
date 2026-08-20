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
/* eslint-disable @typescript-eslint/restrict-template-expressions */
const chai = __importStar(require("chai"));
const chai_1 = require("chai");
const chai_string_1 = __importDefault(require("chai-string"));
require("mocha");
const highlights_1 = require("../../src/services/highlights");
const labels_1 = require("../../src/services/labels");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
chai.use(chai_string_1.default);
const createHighlightQuery = (linkId, highlightId, shortHighlightId, highlightPositionPercent = null, highlightPositionAnchorIndex = null, annotation = '_annotation', html = null, prefix = '_prefix', suffix = '_suffix', quote = '_quote', patch = '_patch') => {
    return `
  mutation {
    createHighlight(
      input: {
        prefix: "${prefix}",
        suffix: "${suffix}",
        quote: "${quote}",
        id: "${highlightId}",
        shortId: "${shortHighlightId}",
        patch: "${patch}",
        articleId: "${linkId}",
        highlightPositionPercent: ${highlightPositionPercent},
        highlightPositionAnchorIndex: ${highlightPositionAnchorIndex}
        annotation: "${annotation}"
        html: "${html}"
      }
    ) {
      ... on CreateHighlightSuccess {
        highlight {
          id
          highlightPositionPercent
          highlightPositionAnchorIndex
          annotation
          html
        }
      }
      ... on CreateHighlightError {
        errorCodes
      }
    }
  }
  `;
};
const mergeHighlightQuery = (pageId, highlightId, shortHighlightId, overlapHighlightIdList, highlightPositionPercent = 0.0, highlightPositionAnchorIndex = 0, prefix = '_prefix', suffix = '_suffix', quote = '_quote', patch = '_patch') => {
    return `
  mutation {
    mergeHighlight(
      input: {
        prefix: "${prefix}",
        suffix: "${suffix}",
        quote: "${quote}",
        id: "${highlightId}",
        shortId: "${shortHighlightId}",
        patch: "${patch}",
        articleId: "${pageId}",
        overlapHighlightIdList: "${overlapHighlightIdList}",
        highlightPositionPercent: ${highlightPositionPercent},
        highlightPositionAnchorIndex: ${highlightPositionAnchorIndex}
      }
    ) {
      ... on MergeHighlightSuccess {
        highlight {
          id
          highlightPositionPercent
          highlightPositionAnchorIndex
        }
      }
      ... on MergeHighlightError {
        errorCodes
      }
    }
  }
  `;
};
const updateHighlightQuery = ({ highlightId, annotation = null, quote = null, }) => {
    return `
  mutation {
    updateHighlight(
      input: {
        annotation: "${annotation}",
        highlightId: "${highlightId}",
        quote: "${quote}"
      }
    ) {
      ... on UpdateHighlightSuccess {
        highlight {
          id
          annotation
          quote
        }
      }
      ... on UpdateHighlightError {
        errorCodes
      }
    }
  }
  `;
};
describe('Highlights API', () => {
    let authToken;
    let user;
    let itemId;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
        itemId = (await (0, db_1.createTestLibraryItem)(user.id)).id;
    });
    after(async () => {
        await (0, user_1.deleteUser)(user.id);
    });
    context('createHighlightMutation', () => {
        let highlightId;
        afterEach(async () => {
            await (0, highlights_1.deleteHighlightById)(highlightId, user.id);
        });
        it('does not fail', async () => {
            highlightId = (0, util_1.generateFakeUuid)();
            const shortHighlightId = '_short_id';
            const highlightPositionPercent = 35.0;
            const highlightPositionAnchorIndex = 15;
            const html = '<p>test</p>';
            const query = createHighlightQuery(itemId, highlightId, shortHighlightId, highlightPositionPercent, highlightPositionAnchorIndex, '_annotation', html);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.createHighlight.highlight.id).to.eq(highlightId);
            (0, chai_1.expect)(res.body.data.createHighlight.highlight.highlightPositionPercent).to.eq(highlightPositionPercent);
            (0, chai_1.expect)(res.body.data.createHighlight.highlight.highlightPositionAnchorIndex).to.eq(highlightPositionAnchorIndex);
            (0, chai_1.expect)(res.body.data.createHighlight.highlight.html).to.eq(html);
        });
        context('when highlight position is null', () => {
            it('sets highlight position = 0', async () => {
                highlightId = (0, util_1.generateFakeUuid)();
                const newShortHighlightId = '_short_id_5';
                const query = createHighlightQuery(itemId, highlightId, newShortHighlightId);
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.createHighlight.highlight.highlightPositionPercent).to.eq(0);
            });
        });
        context('when the annotation has HTML reserved characters', () => {
            it('unescapes the annotation and creates', async () => {
                highlightId = (0, util_1.generateFakeUuid)();
                const newShortHighlightId = '_short_id_4';
                const highlightPositionPercent = 50.0;
                const highlightPositionAnchorIndex = 25;
                const query = createHighlightQuery(itemId, highlightId, newShortHighlightId, highlightPositionPercent, highlightPositionAnchorIndex, '-> <-');
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.createHighlight.highlight.annotation).to.eql('-> <-');
            });
        });
    });
    context('mergeHighlightMutation', () => {
        let highlightId;
        beforeEach(async () => {
            // create test highlight
            highlightId = (0, util_1.generateFakeUuid)();
            const shortHighlightId = (0, util_1.generateFakeShortId)();
            const query = createHighlightQuery(itemId, highlightId, shortHighlightId);
            await (0, util_1.graphqlRequest)(query, authToken).expect(200);
        });
        afterEach(async () => {
            await (0, highlights_1.deleteHighlightById)(highlightId, user.id);
        });
        it('should not fail', async () => {
            const newHighlightId = (0, util_1.generateFakeUuid)();
            const newShortHighlightId = '_short_id_2';
            const highlightPositionPercent = 50.0;
            const highlightPositionAnchorIndex = 25;
            const query = mergeHighlightQuery(itemId, newHighlightId, newShortHighlightId, [highlightId], highlightPositionPercent, highlightPositionAnchorIndex);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.mergeHighlight.highlight.id).to.eq(newHighlightId);
            (0, chai_1.expect)(res.body.data.mergeHighlight.highlight.highlightPositionPercent).to.eq(highlightPositionPercent);
            (0, chai_1.expect)(res.body.data.mergeHighlight.highlight.highlightPositionAnchorIndex).to.eq(highlightPositionAnchorIndex);
            highlightId = newHighlightId;
        });
        it('keeps the labels of the merged highlight', async () => {
            // create label
            const labelName = 'test label';
            const labelColor = '#ff0000';
            const label = await (0, labels_1.createLabel)(labelName, labelColor, user.id);
            await (0, labels_1.saveLabelsInHighlight)([label], highlightId);
            const newHighlightId = (0, util_1.generateFakeUuid)();
            const newShortHighlightId = (0, util_1.generateFakeShortId)();
            const query = mergeHighlightQuery(itemId, newHighlightId, newShortHighlightId, [highlightId]);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.mergeHighlight.highlight.id).to.eq(newHighlightId);
            const highlight = await (0, highlights_1.findHighlightById)(newHighlightId, user.id);
            (0, chai_1.expect)(highlight?.labels).to.have.lengthOf(1);
            (0, chai_1.expect)(highlight?.labels?.[0]?.name).to.eq(labelName);
            highlightId = newHighlightId;
        });
    });
    describe('updateHighlightMutation', () => {
        let highlightId;
        before(async () => {
            // create test highlight
            const highlight = await (0, highlights_1.createHighlight)({
                libraryItem: { id: itemId },
                shortId: '_short_id_3',
                user,
            }, itemId, user.id);
            highlightId = highlight.id;
        });
        after(async () => {
            await (0, highlights_1.deleteHighlightById)(highlightId, user.id);
        });
        it('updates the quote when the quote is in HTML format when the annotation has HTML reserved characters', async () => {
            const quote = '> This is a test';
            const query = updateHighlightQuery({ highlightId, quote });
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.updateHighlight.highlight.quote).to.eql(quote);
        });
        it('updates the quote when the quote is in plain text format', async () => {
            const quote = 'This is a test';
            const query = updateHighlightQuery({ highlightId, quote });
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.updateHighlight.highlight.quote).to.eql(quote);
        });
        it('unescapes the annotation and updates the annotation when the annotation has HTML reserved characters', async () => {
            const annotation = '> This is a test';
            const query = updateHighlightQuery({
                highlightId,
                annotation,
            });
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.updateHighlight.highlight.annotation).to.eql(annotation);
        });
    });
    describe('Get highlights API', () => {
        const query = `
      query Highlights ($first: Int, $after: String, $query: String) {
        highlights (first: $first, after: $after, query: $query) {
          ... on HighlightsSuccess {
            edges {
              node {
                id
                user {
                  id
                  name
                }
                labels {
                  id
                  name
                  color
                }
                libraryItem {
                  id
                  title
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          ... on HighlightsError {
            errorCodes
          }
        }
      }
    `;
        let existingHighlights;
        before(async () => {
            // create test library item
            const item = await (0, db_1.createTestLibraryItem)(user.id);
            // create test highlights
            const highlight1 = await (0, highlights_1.createHighlight)({
                libraryItem: { id: item.id },
                shortId: (0, util_1.generateFakeShortId)(),
                user: { id: user.id },
            }, itemId, user.id);
            const highlight2 = await (0, highlights_1.createHighlight)({
                libraryItem: { id: item.id },
                shortId: (0, util_1.generateFakeShortId)(),
                user: { id: user.id },
            }, itemId, user.id);
            existingHighlights = [highlight1, highlight2];
        });
        after(async () => {
            await (0, highlights_1.deleteHighlightsByIds)(user.id, existingHighlights.map((h) => h.id));
        });
        it('returns highlights in descending order', async () => {
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            const highlights = res.body.data.highlights.edges;
            (0, chai_1.expect)(highlights).to.have.lengthOf(existingHighlights.length);
            (0, chai_1.expect)(highlights[0].node.id).to.eq(existingHighlights[1].id);
            (0, chai_1.expect)(highlights[1].node.id).to.eq(existingHighlights[0].id);
            (0, chai_1.expect)(highlights[0].node.user.id).to.eq(user.id);
            (0, chai_1.expect)(highlights[1].node.libraryItem.id).to.eq(existingHighlights[0].libraryItemId);
        });
        it('returns highlights with pagination', async () => {
            const res = await (0, util_1.graphqlRequest)(query, authToken, {
                first: 1,
            }).expect(200);
            const highlights = res.body.data.highlights.edges;
            (0, chai_1.expect)(highlights).to.have.lengthOf(1);
        });
        it('returns highlights with labels', async () => {
            // create labels
            const labelName = 'test_label';
            const label = await (0, labels_1.createLabel)(labelName, '#ff0000', user.id);
            const labelName1 = 'test_label_1';
            const label1 = await (0, labels_1.createLabel)(labelName1, '#ff0001', user.id);
            // save labels in highlights
            await (0, labels_1.saveLabelsInHighlight)([label, label1], existingHighlights[0].id);
            const res = await (0, util_1.graphqlRequest)(query, authToken, {
                query: `label:"${labelName}" label:"${labelName1}"`,
            }).expect(200);
            const highlights = res.body.data.highlights.edges;
            (0, chai_1.expect)(highlights).to.have.lengthOf(1);
            (0, chai_1.expect)(highlights[0].node.labels?.[0].name).to.eq(labelName);
            (0, chai_1.expect)(highlights[0].node.labels?.[1].name).to.eq(labelName1);
            await (0, labels_1.deleteLabels)([label.id, label1.id], user.id);
        });
    });
});
