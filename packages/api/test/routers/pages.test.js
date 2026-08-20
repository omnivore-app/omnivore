"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const util_1 = require("../util");
describe('Upload Router', () => {
    const token = process.env.PUBSUB_VERIFICATION_TOKEN || '';
    describe('upload', () => {
        xit('upload data to GCS', async () => {
            const data = {
                message: {
                    data: Buffer.from(JSON.stringify({ userId: 'userId', type: 'page' })).toString('base64'),
                    publishTime: new Date().toISOString(),
                },
            };
            await util_1.request
                .post(`/svc/pubsub/upload/createdEntity?token=${token}`)
                .send(data)
                .expect(200);
        });
    });
});
