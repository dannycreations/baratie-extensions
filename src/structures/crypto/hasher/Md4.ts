import { Hasher32le } from '../core/Hasher32le';
import { rotateLeft } from '../utils/rotate';

/**
 * Rotation shift constants for each round of the MD4 algorithm.
 * Each inner array corresponds to a round.
 */
const MD4_ROTATION_SHIFTS: Readonly<ReadonlyArray<number[]>> = [
  [3, 7, 11, 19],
  [3, 5, 9, 13],
  [3, 9, 11, 15],
];

/**
 * The F-round constant for the MD4 compression function.
 */
const MD4_F_ROUND = 0x00000000;
/**
 * The G-round constant for the MD4 compression function.
 */
const MD4_G_ROUND = 0x5a827999;
/**
 * The H-round constant for the MD4 compression function.
 */
const MD4_H_ROUND = 0x6ed9eba1;

/**
 * Initial hash value 'A' for the MD4 algorithm.
 */
const MD4_HASH_A = 0x67452301 >>> 0;
/**
 * Initial hash value 'B' for the MD4 algorithm.
 */
const MD4_HASH_B = 0xefcdab89 >>> 0;
/**
 * Initial hash value 'C' for the MD4 algorithm.
 */
const MD4_HASH_C = 0x98badcfe >>> 0;
/**
 * Initial hash value 'D' for the MD4 algorithm.
 */
const MD4_HASH_D = 0x10325476 >>> 0;

/**
 * The threshold length to determine which padding scheme to use.
 */
const MD4_PAD_THRESHOLD = 56;
/**
 * The padding length for messages shorter than the threshold.
 */
const MD4_SHORT_PAD = 56;
/**
 * The padding length for messages equal to or longer than the threshold.
 */
const MD4_LONG_PAD = 120;

/**
 * MD4 (Message-Digest Algorithm 4) hash function implementation.
 *
 * Refer to the original source for more information.
 * @see {@link https://github.com/nf404/crypto-api/blob/master/src/hasher/md4.mjs}
 */
export class Md4 extends Hasher32le {
  /**
   * The F function for the first round of the MD4 transformation.
   *
   * @param {number} x The first 32-bit word.
   * @param {number} y The second 32-bit word.
   * @param {number} z The third 32-bit word.
   * @returns {number} The result of the bitwise operation.
   */
  private static transformRoundOne(x: number, y: number, z: number): number {
    return (x & y) | (~x & z);
  }

  /**
   * The G function for the second round of the MD4 transformation.
   *
   * @param {number} x The first 32-bit word.
   * @param {number} y The second 32-bit word.
   * @param {number} z The third 32-bit word.
   * @returns {number} The result of the bitwise operation.
   */
  private static transformRoundTwo(x: number, y: number, z: number): number {
    return (x & y) | (x & z) | (y & z);
  }

  /**
   * The H function for the third round of the MD4 transformation.
   *
   * @param {number} x The first 32-bit word.
   * @param {number} y The second 32-bit word.
   * @param {number} z The third 32-bit word.
   * @returns {number} The result of the bitwise operation.
   */
  private static transformRoundThree(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }

  /**
   * Performs a single cycle of the MD4 compression function.
   *
   * @param {(x: number, y: number, z: number) => number} f The round-specific transformation function (F, G, or H).
   * @param {number} k The round-specific additive constant.
   * @param {number} a The accumulator value (one of the four hash state words).
   * @param {number} x The first hash state word for the round function.
   * @param {number} y The second hash state word for the round function.
   * @param {number} z The third hash state word for the round function.
   * @param {number} m The 32-bit message word.
   * @param {number} s The rotation shift amount.
   * @returns {number} The result of the compression cycle.
   */
  private static calculateCompressionCycle(
    f: (x: number, y: number, z: number) => number,
    k: number,
    a: number,
    x: number,
    y: number,
    z: number,
    m: number,
    s: number,
  ): number {
    return rotateLeft((a + f(x, y, z) + m + k) | 0, s);
  }

  /**
   * Resets the hasher to its initial state.
   *
   * @returns {void}
   */
  public override reset(): void {
    super.reset();
    this.state.hash = new Uint32Array([MD4_HASH_A, MD4_HASH_B, MD4_HASH_C, MD4_HASH_D]);
  }

  /**
   * Finalizes the hash computation.
   *
   * This method applies the necessary padding to the message, processes the final
   * blocks, and returns the computed hash digest.
   *
   * @returns {Uint8Array} The 16-byte MD4 hash digest.
   */
  public override finalize(): Uint8Array {
    const messageLength = this.state.message.length;
    const paddingLength = messageLength < MD4_PAD_THRESHOLD ? (MD4_SHORT_PAD - messageLength) | 0 : (MD4_LONG_PAD - messageLength) | 0;

    this.addPaddingISO7816(paddingLength);
    this.addLengthBits();
    this.process();

    return new Uint8Array(this.state.hash.buffer);
  }

  /**
   * Processes a 512-bit (64-byte) message block.
   *
   * @param {Uint32Array} block The 16-word (64-byte) block to process.
   * @returns {void}
   */
  protected override processBlock(block: Uint32Array): void {
    let a: number = this.state.hash[0]!;
    let b: number = this.state.hash[1]!;
    let c: number = this.state.hash[2]!;
    let d: number = this.state.hash[3]!;

    const [s0, s1, s2] = MD4_ROTATION_SHIFTS;

    for (let i = 0; i < 16; i++) {
      const shift = s0[i % 4];
      const m = block[i];
      if (i % 4 === 0) a = Md4.calculateCompressionCycle(Md4.transformRoundOne, MD4_F_ROUND, a, b, c, d, m, shift);
      else if (i % 4 === 1) d = Md4.calculateCompressionCycle(Md4.transformRoundOne, MD4_F_ROUND, d, a, b, c, m, shift);
      else if (i % 4 === 2) c = Md4.calculateCompressionCycle(Md4.transformRoundOne, MD4_F_ROUND, c, d, a, b, m, shift);
      else b = Md4.calculateCompressionCycle(Md4.transformRoundOne, MD4_F_ROUND, b, c, d, a, m, shift);
    }

    const order2 = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
    for (let i = 0; i < 16; i++) {
      const shift = s1[i % 4];
      const m = block[order2[i]];
      if (i % 4 === 0) a = Md4.calculateCompressionCycle(Md4.transformRoundTwo, MD4_G_ROUND, a, b, c, d, m, shift);
      else if (i % 4 === 1) d = Md4.calculateCompressionCycle(Md4.transformRoundTwo, MD4_G_ROUND, d, a, b, c, m, shift);
      else if (i % 4 === 2) c = Md4.calculateCompressionCycle(Md4.transformRoundTwo, MD4_G_ROUND, c, d, a, b, m, shift);
      else b = Md4.calculateCompressionCycle(Md4.transformRoundTwo, MD4_G_ROUND, b, c, d, a, m, shift);
    }

    const order3 = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];
    for (let i = 0; i < 16; i++) {
      const shift = s2[i % 4];
      const m = block[order3[i]];
      if (i % 4 === 0) a = Md4.calculateCompressionCycle(Md4.transformRoundThree, MD4_H_ROUND, a, b, c, d, m, shift);
      else if (i % 4 === 1) d = Md4.calculateCompressionCycle(Md4.transformRoundThree, MD4_H_ROUND, d, a, b, c, m, shift);
      else if (i % 4 === 2) c = Md4.calculateCompressionCycle(Md4.transformRoundThree, MD4_H_ROUND, c, d, a, b, m, shift);
      else b = Md4.calculateCompressionCycle(Md4.transformRoundThree, MD4_H_ROUND, b, c, d, a, m, shift);
    }

    this.state.hash[0] = (this.state.hash[0]! + a) | 0;
    this.state.hash[1] = (this.state.hash[1]! + b) | 0;
    this.state.hash[2] = (this.state.hash[2]! + c) | 0;
    this.state.hash[3] = (this.state.hash[3]! + d) | 0;
  }
}
