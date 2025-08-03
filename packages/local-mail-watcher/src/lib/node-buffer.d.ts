declare global {
  interface Buffer extends Uint8Array {
    write(string: string, encoding?: BufferEncoding): number;
    toString(encoding?: BufferEncoding, start?: number, end?: number): string;
  }

  interface BufferConstructor {
    from(arrayBuffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>, byteOffset?: number, length?: number): Buffer;
    from(data: WithImplicitCoercion<Uint8Array | readonly number[]>): Buffer;
    from(str: WithImplicitCoercion<string>, encoding?: BufferEncoding): Buffer;
    alloc(size: number): Buffer;
    alloc(size: number, fill: string | Buffer | number): Buffer;
  }

  type WithImplicitCoercion<T> = T | { valueOf(): T };

  type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex';

  const Buffer: BufferConstructor;
}

// This empty export makes TypeScript treat this file as a module
export {};
