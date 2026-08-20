"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const helpers_1 = require("../../src/utils/helpers");
describe('validatedDate', () => {
    it('doesnt fail if the date is undefined', () => {
        const result = (0, helpers_1.validatedDate)(undefined);
        (0, chai_1.expect)(result).to.be.undefined;
    });
    it('returns a correct date if the date is in range', () => {
        const d = new Date('2021-09-01');
        const result = (0, helpers_1.validatedDate)(d);
        (0, chai_1.expect)(result).to.eql(d);
    });
    it('returns undefined if the date is out of range', () => {
        const d = new Date('10001-09-01');
        const result = (0, helpers_1.validatedDate)(d);
        (0, chai_1.expect)(result).to.be.undefined;
    });
});
