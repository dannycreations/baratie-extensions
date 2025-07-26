import { describe, expect, it } from 'vitest';

import { bytesToHex } from '../utils/util';
import { Md2 } from './Md2';

describe('Md2', () => {
  it('should compute the correct hash for an empty string', () => {
    const hasher = new Md2();
    hasher.update(new Uint8Array([]));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('8350e5a3e24c153df2275c9f80692773');
  });

  it('should compute the correct hash for "a"', () => {
    const hasher = new Md2();
    hasher.update(new TextEncoder().encode('a'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('32ec01ec4a6dac72c0ab96fb34c0b5d1');
  });

  it('should compute the correct hash for "abc"', () => {
    const hasher = new Md2();
    hasher.update(new TextEncoder().encode('abc'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('da853b0d3f88d99b30283a69e6ded6bb');
  });

  it('should compute the correct hash for "message digest"', () => {
    const hasher = new Md2();
    hasher.update(new TextEncoder().encode('message digest'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('ab4f496bfb2a530b219ff33031fe06b0');
  });

  it('should compute the correct hash for "abcdefghijklmnopqrstuvwxyz"', () => {
    const hasher = new Md2();
    hasher.update(new TextEncoder().encode('abcdefghijklmnopqrstuvwxyz'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('4e8ddff3650292ab5a4108c3aa47940b');
  });

  it('should compute the correct hash for "The quick brown fox jumps over the lazy dog"', () => {
    const hasher = new Md2();
    hasher.update(new TextEncoder().encode('The quick brown fox jumps over the lazy dog'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('03d85a0d629d2c442e987525319fc471');
  });

  it('should compute the correct hash for a string with special characters', () => {
    const hasher = new Md2();
    hasher.update(new TextEncoder().encode('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('6b4869dc814d8294ba9664efc0d31ae3');
  });

  it('should compute the correct hash with custom rounds option', () => {
    const hasher = new Md2({ rounds: 20 });
    hasher.update(new TextEncoder().encode('test'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).not.toEqual('22fe9a2b751069750e7c998a14365f10');
  });
});
