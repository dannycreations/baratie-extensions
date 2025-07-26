import { describe, expect, it } from 'vitest';

import { bytesToHex } from '../utils/util';
import { Md5 } from './Md5';

describe('Md5', () => {
  it('should compute the correct hash for an empty string', () => {
    const hasher = new Md5();
    hasher.update(new Uint8Array([]));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('should compute the correct hash for "a"', () => {
    const hasher = new Md5();
    hasher.update(new TextEncoder().encode('a'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('0cc175b9c0f1b6a831c399e269772661');
  });

  it('should compute the correct hash for "abc"', () => {
    const hasher = new Md5();
    hasher.update(new TextEncoder().encode('abc'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('900150983cd24fb0d6963f7d28e17f72');
  });

  it('should compute the correct hash for "message digest"', () => {
    const hasher = new Md5();
    hasher.update(new TextEncoder().encode('message digest'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('f96b697d7cb7938d525a2f31aaf161d0');
  });

  it('should compute the correct hash for "abcdefghijklmnopqrstuvwxyz"', () => {
    const hasher = new Md5();
    hasher.update(new TextEncoder().encode('abcdefghijklmnopqrstuvwxyz'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('c3fcd3d76192e4007dfb496cca67e13b');
  });

  it('should compute the correct hash for "The quick brown fox jumps over the lazy dog"', () => {
    const hasher = new Md5();
    hasher.update(new TextEncoder().encode('The quick brown fox jumps over the lazy dog'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('9e107d9d372bb6826bd81d3542a419d6');
  });

  it('should compute the correct hash for a string with special characters', () => {
    const hasher = new Md5();
    hasher.update(new TextEncoder().encode('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('442e9d62bc3a517609fb3b8bc29e7dd5');
  });
});
