"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const graphql_1 = require("../../src/generated/graphql");
const uploads_1 = require("../../src/utils/uploads");
describe('contentReaderForPage', () => {
    it('returns web if there is no uploadFileId', () => {
        const result = (0, uploads_1.contentReaderForLibraryItem)(graphql_1.PageType.Book, undefined);
        (0, chai_1.expect)(result).to.eq(graphql_1.ContentReader.Web);
    });
    it('returns Epub if there is an uploadFileId and type is book', () => {
        const result = (0, uploads_1.contentReaderForLibraryItem)(graphql_1.PageType.Book, 'fakeUploadFileId');
        (0, chai_1.expect)(result).to.eq(graphql_1.ContentReader.Epub);
    });
    it('returns PDF if there is an uploadFileId and type is File', () => {
        const result = (0, uploads_1.contentReaderForLibraryItem)(graphql_1.PageType.File, 'fakeUploadFileId');
        (0, chai_1.expect)(result).to.eq(graphql_1.ContentReader.Pdf);
    });
});
