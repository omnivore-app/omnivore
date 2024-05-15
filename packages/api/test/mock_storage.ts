import { Writable } from 'stream'

export class MockStorage {
  buckets: { [name: string]: MockBucket }

  constructor() {
    this.buckets = {}
  }

  bucket(name: string) {
    return this.buckets[name] || (this.buckets[name] = new MockBucket(name))
  }
}

class MockBucket {
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

  getSignedUrl() {
    return ['https://signed-url.upload.omnivore.app']
  }

  getMetadata() {
    return [{ md5Hash: 'md5Hash' }]
  }

  publicUrl() {
    return 'https://public-url.upload.omnivore.app'
  }

  makePublic() {
    return
  }

  save() {
    console.log('Saved file to:', this.path)
    return
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
