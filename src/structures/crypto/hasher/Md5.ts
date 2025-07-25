import { Hasher32le } from '../core/Hasher32le';
import { rotateLeft } from '../utils/rotate';

/**
 * The rotation shift amounts for each round of the MD5 algorithm.
 */
const MD5_ROTATION_SHIFTS: Readonly<ReadonlyArray<number[]>> = [
  [7, 12, 17, 22],
  [5, 9, 14, 20],
  [4, 11, 16, 23],
  [6, 10, 15, 21],
];

/**
 * The constant table K, derived from the sine function, used in MD5 processing.
 */
const MD5_SINE_TABLE: Readonly<Int32Array> = new Int32Array([
  -680876936, -389564586, 606105819, -1044525330, -176418897, 1200080426, -1473231341, -45705983, 1770035416, -1958414417, -42063, -1990404162,
  1804603682, -40341101, -1502002290, 1236535329, -165796510, -1069501632, 643717713, -373897302, -701558691, 38016083, -660478335, -405537848,
  568446438, -1019803690, -187363961, 1163531501, -1444681467, -51403784, 1735328473, -1926607734, -378558, -2022574463, 1839030562, -35309556,
  -1530992060, 1272893353, -155497632, -1094730640, 681279174, -358537222, -722521979, 76029189, -640364487, -421815835, 530742520, -995338651,
  -198630844, 1126891415, -1416354905, -57434055, 1700485571, -1894986606, -1051523, -2054922799, 1873313359, -30611744, -1560198380, 1309151649,
  -145523070, -1120210379, 718787259, -343485551,
]);

/**
 * The initial value for the 'A' buffer in the MD5 hash state.
 */
const MD5_HASH_A = 0x67452301 >>> 0;
/**
 * The initial value for the 'B' buffer in the MD5 hash state.
 */
const MD5_HASH_B = 0xefcdab89 >>> 0;
/**
 * The initial value for the 'C' buffer in the MD5 hash state.
 */
const MD5_HASH_C = 0x98badcfe >>> 0;
/**
 * The initial value for the 'D' buffer in the MD5 hash state.
 */
const MD5_HASH_D = 0x10325476 >>> 0;

/**
 * The message length threshold in bytes for determining padding size.
 */
const MD5_PAD_THRESHOLD = 56;
/**
 * The padding target length for messages shorter than the threshold.
 */
const MD5_SHORT_PAD = 56;
/**
 * The padding target length for messages longer than or equal to the threshold.
 */
const MD5_LONG_PAD = 120;

/**
 * MD5 (Message-Digest Algorithm 5) hash function implementation.
 *
 * Refer to the original source for more information.
 * @see {@link https://github.com/nf404/crypto-api/blob/master/src/hasher/md5.mjs}
 */
export class Md5 extends Hasher32le {
  /**
   * The transformation function for the first round of the MD5 compression.
   *
   * @param {number} x The first 32-bit word.
   * @param {number} y The second 32-bit word.
   * @param {number} z The third 32-bit word.
   * @returns {number} The result of the transformation.
   */
  private static transformRoundOne(x: number, y: number, z: number): number {
    return (x & y) | (~x & z);
  }

  /**
   * The transformation function for the second round of the MD5 compression.
   *
   * @param {number} x The first 32-bit word.
   * @param {number} y The second 32-bit word.
   * @param {number} z The third 32-bit word.
   * @returns {number} The result of the transformation.
   */
  private static transformRoundTwo(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z);
  }

  /**
   * The transformation function for the third round of the MD5 compression.
   *
   * @param {number} x The first 32-bit word.
   * @param {number} y The second 32-bit word.
   * @param {number} z The third 32-bit word.
   * @returns {number} The result of the transformation.
   */
  private static transformRoundThree(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }

  /**
   * The transformation function for the fourth round of the MD5 compression.
   *
   * @param {number} x The first 32-bit word.
   * @param {number} y The second 32-bit word.
   * @param {number} z The third 32-bit word.
   * @returns {number} The result of the transformation.
   */
  private static transformRoundFour(x: number, y: number, z: number): number {
    return y ^ (x | ~z);
  }

  /**
   * Performs a single step within an MD5 compression round.
   *
   * @param {(x: number, y: number, z: number) => number} f The non-linear function for the current round.
   * @param {number} k The constant from the sine table (K[i]).
   * @param {number} a The first hash buffer (e.g., A).
   * @param {number} x The second hash buffer (e.g., B).
   * @param {number} y The third hash buffer (e.g., C).
   * @param {number} z The fourth hash buffer (e.g., D).
   * @param {number} m The message block word (M[i]).
   * @param {number} s The rotation shift amount for the current step.
   * @returns {number} The result of the compression cycle step.
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
    return (rotateLeft(a + f(x, y, z) + m + k, s) + x) | 0;
  }

  /**
   * Resets the hasher to its initial state.
   *
   * @returns {void}
   */
  public override reset(): void {
    super.reset();
    this.state.hash = new Uint32Array([MD5_HASH_A, MD5_HASH_B, MD5_HASH_C, MD5_HASH_D]);
  }

  /**
   * Finalizes the hash computation. Pads the message, processes the final
   * blocks, and returns the 128-bit hash digest.
   *
   * @returns {Uint8Array} The 16-byte MD5 hash digest.
   */
  public override finalize(): Uint8Array {
    const messageLength = this.state.message.length;
    const paddingLength = messageLength < MD5_PAD_THRESHOLD ? (MD5_SHORT_PAD - messageLength) | 0 : (MD5_LONG_PAD - messageLength) | 0;

    this.addPaddingISO7816(paddingLength);
    this.addLengthBits();
    this.process();

    return new Uint8Array(this.state.hash.buffer);
  }

  /**
   * Processes a single 512-bit (64-byte) block of the message.
   *
   * @param {Uint32Array} block The 16-word (64-byte) message block to process.
   * @returns {void}
   */
  protected override processBlock(block: Uint32Array): void {
    let a = this.state.hash[0]!;
    let b = this.state.hash[1]!;
    let c = this.state.hash[2]!;
    let d = this.state.hash[3]!;

    const [s0, s1, s2, s3] = MD5_ROTATION_SHIFTS;

    a = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[0], a, b, c, d, block[0], s0[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[1], d, a, b, c, block[1], s0[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[2], c, d, a, b, block[2], s0[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[3], b, c, d, a, block[3], s0[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[4], a, b, c, d, block[4], s0[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[5], d, a, b, c, block[5], s0[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[6], c, d, a, b, block[6], s0[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[7], b, c, d, a, block[7], s0[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[8], a, b, c, d, block[8], s0[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[9], d, a, b, c, block[9], s0[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[10], c, d, a, b, block[10], s0[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[11], b, c, d, a, block[11], s0[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[12], a, b, c, d, block[12], s0[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[13], d, a, b, c, block[13], s0[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[14], c, d, a, b, block[14], s0[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundOne, MD5_SINE_TABLE[15], b, c, d, a, block[15], s0[3]);

    a = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[16], a, b, c, d, block[1], s1[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[17], d, a, b, c, block[6], s1[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[18], c, d, a, b, block[11], s1[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[19], b, c, d, a, block[0], s1[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[20], a, b, c, d, block[5], s1[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[21], d, a, b, c, block[10], s1[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[22], c, d, a, b, block[15], s1[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[23], b, c, d, a, block[4], s1[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[24], a, b, c, d, block[9], s1[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[25], d, a, b, c, block[14], s1[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[26], c, d, a, b, block[3], s1[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[27], b, c, d, a, block[8], s1[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[28], a, b, c, d, block[13], s1[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[29], d, a, b, c, block[2], s1[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[30], c, d, a, b, block[7], s1[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundTwo, MD5_SINE_TABLE[31], b, c, d, a, block[12], s1[3]);

    a = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[32], a, b, c, d, block[5], s2[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[33], d, a, b, c, block[8], s2[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[34], c, d, a, b, block[11], s2[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[35], b, c, d, a, block[14], s2[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[36], a, b, c, d, block[1], s2[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[37], d, a, b, c, block[4], s2[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[38], c, d, a, b, block[7], s2[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[39], b, c, d, a, block[10], s2[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[40], a, b, c, d, block[13], s2[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[41], d, a, b, c, block[0], s2[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[42], c, d, a, b, block[3], s2[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[43], b, c, d, a, block[6], s2[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[44], a, b, c, d, block[9], s2[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[45], d, a, b, c, block[12], s2[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[46], c, d, a, b, block[15], s2[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundThree, MD5_SINE_TABLE[47], b, c, d, a, block[2], s2[3]);

    a = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[48], a, b, c, d, block[0], s3[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[49], d, a, b, c, block[7], s3[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[50], c, d, a, b, block[14], s3[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[51], b, c, d, a, block[5], s3[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[52], a, b, c, d, block[12], s3[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[53], d, a, b, c, block[3], s3[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[54], c, d, a, b, block[10], s3[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[55], b, c, d, a, block[1], s3[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[56], a, b, c, d, block[8], s3[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[57], d, a, b, c, block[15], s3[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[58], c, d, a, b, block[6], s3[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[59], b, c, d, a, block[13], s3[3]);
    a = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[60], a, b, c, d, block[4], s3[0]);
    d = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[61], d, a, b, c, block[11], s3[1]);
    c = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[62], c, d, a, b, block[2], s3[2]);
    b = Md5.calculateCompressionCycle(Md5.transformRoundFour, MD5_SINE_TABLE[63], b, c, d, a, block[9], s3[3]);

    this.state.hash[0] = (this.state.hash[0]! + a) | 0;
    this.state.hash[1] = (this.state.hash[1]! + b) | 0;
    this.state.hash[2] = (this.state.hash[2]! + c) | 0;
    this.state.hash[3] = (this.state.hash[3]! + d) | 0;
  }
}
