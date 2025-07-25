import { Md2 } from './hasher/Md2';
import { Md4 } from './hasher/Md4';
import { Md5 } from './hasher/Md5';
import { Md6 } from './hasher/Md6';

import type { Hasher, HasherOptions } from './core/Hasher';
import type { Md2Options } from './hasher/Md2';
import type { Md6Options } from './hasher/Md6';

export type HasherName = 'md2' | 'md4' | 'md5' | 'md6';

export function tryHash(name: HasherName, input: string, options?: HasherOptions): Uint8Array {
  const hasher = getHasher(name, options);
  hasher.update(new TextEncoder().encode(input));
  return hasher.finalize();
}

export function getHasher(name: HasherName, options?: HasherOptions): Hasher {
  switch (name) {
    case 'md2':
      return new Md2(options as Md2Options);
    case 'md4':
      return new Md4(options);
    case 'md5':
      return new Md5(options);
    case 'md6':
      return new Md6(options as Md6Options);
    default:
      throw new Error(`Unsupported hasher name: ${name}`);
  }
}
