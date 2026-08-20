"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
require("mocha");
describe('Server', () => {
    it('should respond for health check', async () => {
        return util_1.request.get('/_ah/health').expect(200);
    });
});
