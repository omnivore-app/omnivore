"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const create_page_save_request_1 = require("../../src/services/create_page_save_request");
describe('validateUrl', () => {
    it('allows access to public addresses', () => {
        (0, chai_1.expect)(() => {
            (0, create_page_save_request_1.validateUrl)('https://google.com');
        }).not.to.throw();
        (0, chai_1.expect)(() => {
            (0, create_page_save_request_1.validateUrl)('https://omnivore.work/path');
        }).not.to.throw();
    });
    it('doesnt allow access to private addresses', () => {
        (0, chai_1.expect)(() => {
            (0, create_page_save_request_1.validateUrl)('http://localhost:8080');
        }).to.throw();
        (0, chai_1.expect)(() => {
            (0, create_page_save_request_1.validateUrl)('http://0.0.0.0');
        }).to.throw();
        (0, chai_1.expect)(() => {
            (0, create_page_save_request_1.validateUrl)('http://192.168.1.1');
        }).to.throw();
        (0, chai_1.expect)(() => {
            (0, create_page_save_request_1.validateUrl)('http://169.254.1.1');
        }).to.throw();
    });
    it('doesnt allow access to google private data', () => {
        (0, chai_1.expect)(() => {
            (0, create_page_save_request_1.validateUrl)('http://metadata.google.internal');
        }).to.throw();
    });
});
