"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mochaGlobalSetup = void 0;
const env_1 = require("../src/env");
const redis_data_source_1 = require("../src/redis_data_source");
const db_1 = require("./db");
const util_1 = require("./util");
const mochaGlobalSetup = async () => {
    await (0, db_1.createTestConnection)();
    console.log('db connection created');
    if (env_1.env.redis.cache.url) {
        await redis_data_source_1.redisDataSource.initialize();
        console.log('redis connection created');
        if (redis_data_source_1.redisDataSource.workerRedisClient) {
            (0, util_1.startWorker)(redis_data_source_1.redisDataSource.workerRedisClient);
            console.log('worker started');
        }
    }
    await (0, util_1.startApolloServer)();
    console.log('apollo server started');
};
exports.mochaGlobalSetup = mochaGlobalSetup;
