import { describe, expect, it } from 'vitest';

import { bytesToHex } from '../utils/util';
import { Md6 } from './Md6';

describe('Md6', () => {
  it('should compute the correct hash for an empty string with default options', () => {
    const hasher = new Md6();
    hasher.update(new Uint8Array([]));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('bca38b24a804aa37d821d31af00f5598230122c5bbfc4c4ad5ed40e4258f04ca');
  });

  it('should compute the correct hash for "abc" with default options', () => {
    const hasher = new Md6();
    hasher.update(new TextEncoder().encode('abc'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('230637d4e6845cf0d092b558e87625f03881dd53a7439da34cf3b94ed0d8b2c5');
  });

  it('should compute the correct hash with custom size option (MD6-128)', () => {
    const hasher = new Md6({ size: 128 });
    hasher.update(new TextEncoder().encode('test message'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('68c2afa00c3b44b7960278716ae04b04');
  });

  it('should compute the correct hash with custom key option', () => {
    const hasher = new Md6({ key: new TextEncoder().encode('secret') });
    hasher.update(new TextEncoder().encode('data with key'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('a0cf4d9b9dbea7a54d81301e2811289d8ebde38eabd1c191a395a18db18edef8');
  });

  it('should compute the correct hash with custom levels option', () => {
    const hasher = new Md6({ levels: 2 });
    hasher.update(new TextEncoder().encode('another test'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('a9620c1576690682c1efd4648db39d927d23ac1f4483c12e849469748e03ca48');
  });

  it('should produce different hashes for different inputs with the same options', () => {
    const hasher1 = new Md6();
    hasher1.update(new TextEncoder().encode('input one'));
    const hash1 = hasher1.finalize();

    const hasher2 = new Md6();
    hasher2.update(new TextEncoder().encode('input two'));
    const hash2 = hasher2.finalize();

    expect(bytesToHex(hash1)).not.toEqual(bytesToHex(hash2));
  });

  it('should produce the same hash for the same input and options', () => {
    const hasher1 = new Md6({ size: 128, key: new TextEncoder().encode('same key') });
    hasher1.update(new TextEncoder().encode('consistent input'));
    const hash1 = hasher1.finalize();

    const hasher2 = new Md6({ size: 128, key: new TextEncoder().encode('same key') });
    hasher2.update(new TextEncoder().encode('consistent input'));
    const hash2 = hasher2.finalize();

    expect(bytesToHex(hash1)).toEqual(bytesToHex(hash2));
  });

  it('should compute the correct hash for "The quick brown fox jumps over the lazy dog" with default options', () => {
    const hasher = new Md6();
    hasher.update(new TextEncoder().encode('The quick brown fox jumps over the lazy dog'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('977592608c45c9923340338450fdcccc21a68888e1e6350e133c5186cd9736ee');
  });

  it('should compute the correct hash for a string with special characters and custom size', () => {
    const hasher = new Md6({ size: 256 });
    hasher.update(new TextEncoder().encode('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('0b9ad0ab2bafe276edc7b72552c164b72ce396ff91ead33042b173f3a5c60534');
  });

  it('should compute the correct hash with max size (MD6-512)', () => {
    const hasher = new Md6({ size: 512 });
    hasher.update(new TextEncoder().encode('long test message for max size'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual(
      '2216d058cab6c1d89695fc7433a7ad11683f11b7b360d4a156c45d81b3633c0c6dc74d69a24a3a6a0cdbf5508456db934f413e0e21ffb4ef08b9341be2928040',
    );
  });

  it('should compute the correct hash with min size (MD6-1)', () => {
    const hasher = new Md6({ size: 1 });
    hasher.update(new TextEncoder().encode('test for min size'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('80');
  });

  it('should compute the correct hash with custom levels and key', () => {
    const hasher = new Md6({ levels: 3, key: new TextEncoder().encode('complex key') });
    hasher.update(new TextEncoder().encode('data for complex test'));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('a91a7a01e4c2899ae135afc34a031a11055a9743075257bdde7881303d36b3c3');
  });

  it('should compute the correct hash for a long message', () => {
    const longMessage = 'a'.repeat(2000);
    const hasher = new Md6();
    hasher.update(new TextEncoder().encode(longMessage));
    const hash = hasher.finalize();

    expect(bytesToHex(hash)).toEqual('820a950b6ae8913bb2e8eb17ec9706a8084a37a2601e78cd0060ad2d61c06bf9');
  });
});
