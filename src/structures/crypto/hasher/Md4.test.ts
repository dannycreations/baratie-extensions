import { describe, expect, it } from 'vitest';

import { bytesToHex } from '../utils/util';
import { Md4 } from './Md4';

describe('Md4', () => {
  it('should compute the correct hash for an empty string', () => {
    const hasher = new Md4();
    hasher.update(new Uint8Array([]));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('31d6cfe0d16ae931b73c59d7e0c089c0');
  });

  it('should compute the correct hash for "a"', () => {
    const hasher = new Md4();
    hasher.update(new TextEncoder().encode('a'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('bde52cb31de33e46245e05fbdbd6fb24');
  });

  it('should compute the correct hash for "abc"', () => {
    const hasher = new Md4();
    hasher.update(new TextEncoder().encode('abc'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('a448017aaf21d8525fc10ae87aa6729d');
  });

  it('should compute the correct hash for "message digest"', () => {
    const hasher = new Md4();
    hasher.update(new TextEncoder().encode('message digest'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('d9130a8164549fe818874806e1c7014b');
  });

  it('should compute the correct hash for "abcdefghijklmnopqrstuvwxyz"', () => {
    const hasher = new Md4();
    hasher.update(new TextEncoder().encode('abcdefghijklmnopqrstuvwxyz'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('d79e1c308aa5bbcdeea8ed63df412da9');
  });

  it('should compute the correct hash for "The quick brown fox jumps over the lazy dog"', () => {
    const hasher = new Md4();
    hasher.update(new TextEncoder().encode('The quick brown fox jumps over the lazy dog'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('1bee69a46ba811185c194762abaeae90');
  });

  it('should compute the correct hash for a string with special characters', () => {
    const hasher = new Md4();
    hasher.update(new TextEncoder().encode('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('283107eac31bb23a95e51d4cbe1d661b');
  });
});
