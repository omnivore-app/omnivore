"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAndGetAuthToken = exports.generateFakeShortId = exports.generateFakeUuid = exports.graphqlRequest = exports.waitUntilJobsDone = exports.stopWorker = exports.startWorker = exports.stopApolloServer = exports.startApolloServer = exports.request = void 0;
const bullmq_1 = require("bullmq");
const http_1 = require("http");
const nanoid_1 = require("nanoid");
const supertest_1 = __importDefault(require("supertest"));
const uuid_1 = require("uuid");
const apollo_1 = require("../src/apollo");
const queue_processor_1 = require("../src/queue-processor");
const server_1 = require("../src/server");
const corsConfig_1 = require("../src/utils/corsConfig");
const cors_1 = __importDefault(require("cors"));
const app = (0, server_1.createApp)();
const httpServer = (0, http_1.createServer)(app);
const apollo = (0, apollo_1.makeApolloServer)(app, httpServer);
exports.request = (0, supertest_1.default)(app);
let worker;
let queueEvents;
const startApolloServer = async () => {
    await apollo.start();
    app.use('/api/graphql', (0, cors_1.default)(corsConfig_1.corsConfig));
};
exports.startApolloServer = startApolloServer;
const stopApolloServer = async () => {
    await apollo.stop();
};
exports.stopApolloServer = stopApolloServer;
const startWorker = (connection) => {
    worker = (0, queue_processor_1.createWorker)(connection);
    queueEvents = new bullmq_1.QueueEvents(queue_processor_1.BACKEND_QUEUE_NAME, {
        connection,
    });
};
exports.startWorker = startWorker;
const stopWorker = async () => {
    await queueEvents.close();
    await worker.close();
};
exports.stopWorker = stopWorker;
const waitUntilJobsDone = async (jobs) => {
    await Promise.all(jobs.map((job) => job.waitUntilFinished(queueEvents, 10000)));
};
exports.waitUntilJobsDone = waitUntilJobsDone;
const graphqlRequest = (query, authToken, variables) => {
    return exports.request
        .post('/api/graphql')
        .send({ query, variables })
        .set('Accept', 'application/json')
        .set('authorization', authToken)
        .expect('Content-Type', /json/);
};
exports.graphqlRequest = graphqlRequest;
const generateFakeUuid = () => {
    return (0, uuid_1.v4)();
};
exports.generateFakeUuid = generateFakeUuid;
const generateFakeShortId = () => {
    return (0, nanoid_1.nanoid)(8);
};
exports.generateFakeShortId = generateFakeShortId;
const loginAndGetAuthToken = async (email) => {
    const res = await exports.request
        .post('/local/debug/fake-user-login')
        .send({ fakeEmail: email });
    return res.body.authToken;
};
exports.loginAndGetAuthToken = loginAndGetAuthToken;
