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
const chai_1 = __importStar(require("chai"));
require("mocha");
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const content_display_report_1 = require("../../src/entity/reports/content_display_report");
const graphql_1 = require("../../src/generated/graphql");
const repository_1 = require("../../src/repository");
const reports_1 = require("../../src/services/reports");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
chai_1.default.use(sinon_chai_1.default);
describe('saveContentDisplayReport', () => {
    let user;
    let item;
    before(async () => {
        user = await (0, db_1.createTestUser)('fakeContentUser');
        item = await (0, db_1.createTestLibraryItem)(user.id);
    });
    after(async () => {
        await (0, user_1.deleteUser)(user.id);
    });
    it('creates a report', async () => {
        const result = await (0, reports_1.saveContentDisplayReport)(user.id, {
            itemUrl: 'https://fake.url.com',
            pageId: item.id,
            reportComment: 'report comment',
            reportTypes: [graphql_1.ReportType.ContentDisplay],
        });
        (0, chai_1.expect)(result).to.eql(true);
        const saved = await (0, repository_1.getRepository)(content_display_report_1.ContentDisplayReport).findOneBy({
            user: { id: user.id },
            libraryItemId: item.id,
        });
        (0, chai_1.expect)(saved?.reportComment).to.eql('report comment');
    });
});
