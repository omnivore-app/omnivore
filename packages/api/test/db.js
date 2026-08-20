"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHighlight = exports.saveLabelsInLibraryItem = exports.createTestLibraryItem = exports.createTestDeviceToken = exports.getReminder = exports.createTestReminder = exports.createUserWithoutProfile = exports.createTestUser = exports.deleteFiltersFromUser = exports.createTestConnection = void 0;
const data_source_1 = require("../src/data_source");
const entity_label_1 = require("../src/entity/entity_label");
const filter_1 = require("../src/entity/filter");
const reminder_1 = require("../src/entity/reminder");
const repository_1 = require("../src/repository");
const highlight_1 = require("../src/repository/highlight");
const user_1 = require("../src/repository/user");
const create_user_1 = require("../src/services/create_user");
const library_item_1 = require("../src/services/library_item");
const user_device_tokens_1 = require("../src/services/user_device_tokens");
const createTask_1 = require("../src/utils/createTask");
const util_1 = require("./util");
const createTestConnection = async () => {
    data_source_1.appDataSource.setOptions({
        type: 'postgres',
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT),
        schema: 'omnivore',
        username: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DB,
        logging: ['query', 'info'],
        entities: [__dirname + '/../src/entity/**/*{.js,.ts}'],
        subscribers: [__dirname + '/../src/events/**/*{.js,.ts}'],
        logger: process.env.PG_LOGGER,
    });
    await data_source_1.appDataSource.initialize();
};
exports.createTestConnection = createTestConnection;
const deleteFiltersFromUser = async (userId) => {
    await data_source_1.appDataSource.transaction(async (t) => {
        await (0, repository_1.setClaims)(t, userId);
        const filterRepo = t.getRepository(filter_1.Filter);
        const userFilters = await filterRepo.findBy({ user: { id: userId } });
        await Promise.all(userFilters.map((filter) => {
            return filterRepo.delete(filter.id);
        }));
    });
};
exports.deleteFiltersFromUser = deleteFiltersFromUser;
const createTestUser = async (name, invite, password, pendingConfirmation) => {
    const [newUser] = await (0, create_user_1.createUser)({
        provider: 'GOOGLE',
        sourceUserId: 'fake-user-id-' + name,
        email: `${name}@omnivore.work`,
        username: name,
        bio: `i am ${name}`,
        name: name,
        inviteCode: invite,
        password: password,
        pendingConfirmation,
    });
    return newUser;
};
exports.createTestUser = createTestUser;
const createUserWithoutProfile = async (name) => {
    return user_1.userRepository.save({
        source: 'GOOGLE',
        sourceUserId: 'fake-user-id-' + name,
        email: `${name}@omnivore.work`,
        name: name,
    });
};
exports.createUserWithoutProfile = createUserWithoutProfile;
const createTestReminder = async (user, pageId) => {
    return (0, repository_1.getRepository)(reminder_1.Reminder).save({
        user: user,
        elasticPageId: pageId,
        remindAt: new Date(),
    });
};
exports.createTestReminder = createTestReminder;
const getReminder = async (id) => {
    return (0, repository_1.getRepository)(reminder_1.Reminder).findOneBy({ id });
};
exports.getReminder = getReminder;
const createTestDeviceToken = async (user) => {
    return (0, user_device_tokens_1.createDeviceToken)(user.id, 'fake-token');
};
exports.createTestDeviceToken = createTestDeviceToken;
const createTestLibraryItem = async (userId, labels) => {
    const item = {
        user: { id: userId },
        title: 'test title',
        originalUrl: `https://blog.omnivore.work/test-url-${(0, util_1.generateFakeUuid)()}`,
        slug: 'test-with-omnivore',
    };
    const createdItem = await (0, library_item_1.createOrUpdateLibraryItem)(item, userId, undefined, true);
    if (labels) {
        await (0, exports.saveLabelsInLibraryItem)(labels, createdItem.id, userId);
    }
    return createdItem;
};
exports.createTestLibraryItem = createTestLibraryItem;
const saveLabelsInLibraryItem = async (labels, libraryItemId, userId, source = 'user') => {
    await (0, repository_1.authTrx)(async (tx) => {
        const repo = tx.getRepository(entity_label_1.EntityLabel);
        // delete existing labels
        await repo.delete({
            libraryItemId,
        });
        // save new labels
        await repo.save(labels.map((l) => ({
            labelId: l.id,
            libraryItemId,
            source,
        })));
    }, {
        uid: userId,
    });
    // update labels in library item
    const jobs = await (0, createTask_1.bulkEnqueueUpdateLabels)([{ libraryItemId, userId }]);
    await (0, util_1.waitUntilJobsDone)(jobs);
};
exports.saveLabelsInLibraryItem = saveLabelsInLibraryItem;
const createHighlight = async (highlight, libraryItemId, userId) => {
    const newHighlight = await (0, repository_1.authTrx)(async (tx) => {
        const repo = tx.withRepository(highlight_1.highlightRepository);
        const newHighlight = await repo.createAndSave(highlight);
        return repo.findOneOrFail({
            where: { id: newHighlight.id },
            relations: {
                user: true,
            },
        });
    }, {
        uid: userId,
    });
    const job = await (0, createTask_1.enqueueUpdateHighlight)({
        libraryItemId,
        userId,
    });
    if (job) {
        await (0, util_1.waitUntilJobsDone)([job]);
    }
    return newHighlight;
};
exports.createHighlight = createHighlight;
