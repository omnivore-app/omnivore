"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mochaGlobalTeardown = void 0;
const data_source_1 = require("../src/data_source");
const env_1 = require("../src/env");
const redis_data_source_1 = require("../src/redis_data_source");
const util_1 = require("./util");
const mochaGlobalTeardown = async () => {
    await (0, util_1.stopApolloServer)();
    console.log('apollo server stopped');
    if (env_1.env.redis.cache.url) {
        if (redis_data_source_1.redisDataSource.workerRedisClient) {
            await (0, util_1.stopWorker)();
            console.log('worker closed');
        }
        await redis_data_source_1.redisDataSource.shutdown();
        console.log('redis connection closed');
    }
    await data_source_1.appDataSource.destroy();
    console.log('db connection closed');
};
exports.mochaGlobalTeardown = mochaGlobalTeardown;
