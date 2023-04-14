import { Writable } from 'stream'

class MockStorage {
  buckets: { [name: string]: MockBucket }

  constructor() {
    this.buckets = {}
  }

  bucket(name: string) {
    return this.buckets[name] || (this.buckets[name] = new MockBucket(name))
  }
}

export class MockBucket {
  name: string
  files: { [path: string]: MockFile }

  constructor(name: string) {
    this.name = name
    this.files = {}
  }

  file(path: string) {
    return this.files[path] || (this.files[path] = new MockFile(path))
  }
}

class MockFile {
  path: string
  contents: Buffer

  constructor(path: string) {
    this.path = path
    this.contents = Buffer.alloc(0)
  }

  createWriteStream() {
    return new MockWriteStream(this)
  }
}

class MockWriteStream extends Writable {
  file: MockFile

  constructor(file: MockFile) {
    super()
    this.file = file
  }

  _write(chunk: Buffer, encoding: string, callback: (error?: Error) => void) {
    this.file.contents = Buffer.concat([this.file.contents, chunk])
    callback()
  }
}
