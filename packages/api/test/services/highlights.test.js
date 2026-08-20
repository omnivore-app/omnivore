"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const highlights_1 = require("../../src/services/highlights");
describe('getHighlightLocation', () => {
    let patch;
    let location;
    before(() => {
        location = 109;
        patch = `@@ -${location + 1},16 +${location + 1},36 @@
 . We're
+%3Comnivore_highlight%3E
 humbled
@@ -254,16 +254,37 @@
 h in the
+%3C/omnivore_highlight%3E
  coming`;
    });
    it('returns highlight location from patch', () => {
        const result = (0, highlights_1.getHighlightLocation)(patch);
        (0, chai_1.expect)(result).to.eql(location);
    });
});
