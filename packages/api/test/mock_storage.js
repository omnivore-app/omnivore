"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockStorage = void 0;
const stream_1 = require("stream");
class MockStorage {
    buckets;
    constructor() {
        this.buckets = {};
    }
    bucket(name) {
        return this.buckets[name] || (this.buckets[name] = new MockBucket(name));
    }
}
exports.MockStorage = MockStorage;
class MockBucket {
    name;
    files;
    constructor(name) {
        this.name = name;
        this.files = {};
    }
    file(path) {
        return this.files[path] || (this.files[path] = new MockFile(path));
    }
}
class MockFile {
    path;
    contents;
    constructor(path) {
        this.path = path;
        this.contents = Buffer.alloc(0);
    }
    createWriteStream() {
        return new MockWriteStream(this);
    }
    getSignedUrl() {
        return ['https://signed-url.upload.omnivore.work'];
    }
    getMetadata() {
        return [{ md5Hash: 'md5Hash' }];
    }
    publicUrl() {
        return 'https://public-url.upload.omnivore.work';
    }
    makePublic() {
        return;
    }
    save() {
        console.log('Saved file to:', this.path);
        return;
    }
}
class MockWriteStream extends stream_1.Writable {
    file;
    constructor(file) {
        super();
        this.file = file;
    }
    _write(chunk, encoding, callback) {
        this.file.contents = Buffer.concat([this.file.contents, chunk]);
        callback();
    }
}
