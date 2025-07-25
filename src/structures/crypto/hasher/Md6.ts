import { Hasher, HasherOptions } from '../core/Hasher';

/**
 * Defines the configuration options for the MD6 hasher.
 */
export interface Md6Options extends HasherOptions {
  /**
   * The desired output hash size in bits.
   */
  readonly size: number;
  /**
   * An optional secret key for keyed hashing.
   */
  readonly key: Uint8Array;
  /**
   * The number of levels for the hash computation tree.
   */
  readonly levels: number;
}

/**
 * The size of a message block in bits.
 */
const MD6_BLOCK_BITS = 512;
/**
 * The size of the chaining value in bits.
 */
const MD6_CHAINING_BITS = 128;
/**
 * The number of 64-bit words in the MD6 compression function's primary working array.
 */
const MD6_WORDS_BLOCK = 89;

/**
 * The initial chaining value constant S0 for the MD6 compression function.
 */
const MD6_CHAINING_S0: Readonly<Uint32Array> = new Uint32Array([0x01234567, 0x89abcdef]);
/**
 * The constant Sm used in the MD6 compression function.
 */
const MD6_COMPRESSION_SM: Readonly<Uint32Array> = new Uint32Array([0x7311c281, 0x2425cfa0]);

/**
 * A pre-computed table of constants derived from the fractional parts of sqrt(6).
 */
const MD6_SINE_TABLE: Readonly<Uint32Array> = new Uint32Array([
  0x7311c281, 0x2425cfa0, 0x64322864, 0x34aac8e7, 0xb60450e9, 0xef68b7c1, 0xe8fb2390, 0x8d9f06f1, 0xdd2e76cb, 0xa691e5bf, 0x0cd0d63b, 0x2c30bc41,
  0x1f8ccf68, 0x23058f8a, 0x54e5ed5b, 0x88e3775d, 0x4ad12aae, 0x0a6d6031, 0x3e7f16bb, 0x88222e0d, 0x8af8671d, 0x3fb50c2c, 0x995ad117, 0x8bd25c31,
  0xc878c1dd, 0x04c4b633, 0x3b72066c, 0x7a1552ac, 0x0d6f3522, 0x631effcb,
]);

/**
 * Tap positions for the feedback function in the MD6 compression transformation.
 */
const MD6_TRANSFORM_OFFSETS: Readonly<number[]> = [17, 18, 21, 31, 67, 89];
/**
 * Rotation amounts for the right shifts in the MD6 compression transformation.
 */
const MD6_RIGHT_SHIFTS: Readonly<number[]> = [10, 5, 13, 10, 11, 12, 2, 7, 14, 15, 7, 13, 11, 7, 6, 12];
/**
 * Rotation amounts for the left shifts in the MD6 compression transformation.
 */
const MD6_LEFT_SHIFTS: Readonly<number[]> = [11, 24, 9, 16, 15, 9, 27, 15, 6, 2, 29, 8, 15, 5, 31, 9];

/**
 * MD6 (Message-Digest Algorithm 6) hash function implementation.
 *
 * Refer to the original source for more information.
 * @see {@link https://github.com/Neo-Desktop/md6/blob/master/md6.js}
 */
export class Md6 extends Hasher {
  /**
   * Performs a bitwise XOR operation on two 64-bit words.
   *
   * @param {Uint32Array} x The first 64-bit word (as a 2-element Uint32Array).
   * @param {Uint32Array} y The second 64-bit word.
   * @param {Uint32Array} out The array to store the result.
   * @returns {Uint32Array} The `out` array containing the result.
   */
  private static xorWord(x: Uint32Array, y: Uint32Array, out: Uint32Array): Uint32Array {
    out[0] = x[0] ^ y[0];
    out[1] = x[1] ^ y[1];
    return out;
  }

  /**
   * Performs a bitwise AND operation on two 64-bit words.
   *
   * @param {Uint32Array} x The first 64-bit word.
   * @param {Uint32Array} y The second 64-bit word.
   * @param {Uint32Array} out The array to store the result.
   * @returns {Uint32Array} The `out` array containing the result.
   */
  private static andWord(x: Uint32Array, y: Uint32Array, out: Uint32Array): Uint32Array {
    out[0] = x[0] & y[0];
    out[1] = x[1] & y[1];
    return out;
  }

  /**
   * Performs a bitwise left shift on a 64-bit word.
   *
   * @param {Uint32Array} x The 64-bit word to shift.
   * @param {number} n The number of bits to shift.
   * @param {Uint32Array} out The array to store the result.
   * @returns {Uint32Array} The `out` array containing the result.
   */
  private static shlWord(x: Uint32Array, n: number, out: Uint32Array): Uint32Array {
    const a = x[0];
    const b = x[1];

    if (n >= 32) {
      out[0] = b << (n - 32);
      out[1] = 0x0;
    } else {
      out[0] = (a << n) | (b >>> (32 - n));
      out[1] = b << n;
    }
    return out;
  }

  /**
   * Performs a bitwise right shift on a 64-bit word.
   *
   * @param {Uint32Array} x The 64-bit word to shift.
   * @param {number} n The number of bits to shift.
   * @param {Uint32Array} out The array to store the result.
   * @returns {Uint32Array} The `out` array containing the result.
   */
  private static shrWord(x: Uint32Array, n: number, out: Uint32Array): Uint32Array {
    const a = x[0];
    const b = x[1];

    if (n >= 32) {
      out[0] = 0x0;
      out[1] = a >>> (n - 32);
    } else {
      out[0] = a >>> n;
      out[1] = (a << (32 - n)) | (b >>> n);
    }
    return out;
  }

  /**
   * Converts a byte array into an array of 64-bit words.
   *
   * @param {Uint8Array} input The byte array to convert.
   * @returns {Uint32Array[]} An array of 64-bit words (each a 2-element Uint32Array).
   */
  private static bytesToWords(input: Uint8Array): Uint32Array[] {
    const length = input.length;
    const wordCount = Math.ceil(length / 8);
    const output: Uint32Array[] = new Array(wordCount);

    for (let i = 0, j = 0; j < wordCount; i += 8, j++) {
      output[j] = new Uint32Array([
        ((input[i] || 0) << 24) | ((input[i + 1] || 0) << 16) | ((input[i + 2] || 0) << 8) | (input[i + 3] || 0),
        ((input[i + 4] || 0) << 24) | ((input[i + 5] || 0) << 16) | ((input[i + 6] || 0) << 8) | (input[i + 7] || 0),
      ]);
    }
    return output;
  }

  /**
   * Converts an array of 64-bit words into a single byte array.
   *
   * @param {Uint32Array[]} input The array of 64-bit words to convert.
   * @returns {Uint8Array} The resulting byte array.
   */
  private static wordsToBytes(input: Uint32Array[]): Uint8Array {
    const length = input.length;
    const output: Uint8Array = new Uint8Array(length * 8);

    for (let i = 0; i < length; i++) {
      const offset = i * 8;
      const w1 = input[i][0];
      const w2 = input[i][1];
      output[offset] = (w1 >>> 24) & 0xff;
      output[offset + 1] = (w1 >>> 16) & 0xff;
      output[offset + 2] = (w1 >>> 8) & 0xff;
      output[offset + 3] = w1 & 0xff;
      output[offset + 4] = (w2 >>> 24) & 0xff;
      output[offset + 5] = (w2 >>> 16) & 0xff;
      output[offset + 6] = (w2 >>> 8) & 0xff;
      output[offset + 7] = w2 & 0xff;
    }
    return output;
  }

  /**
   * Processes a single block of data using the MD6 compression function.
   *
   * @param {Uint32Array[]} inputWords The input data block, including constants, keys, and message chunks.
   * @param {number} rRounds The number of compression rounds to perform.
   * @returns {Uint32Array[]} The last 16 words of the working register array, representing the chaining value.
   */
  private static processCompression(inputWords: Uint32Array[], rRounds: number): Uint32Array[] {
    let chainingValue: Uint32Array = new Uint32Array([...MD6_CHAINING_S0]);
    const workingRegisterArray: Uint32Array[] = inputWords.map((word: Uint32Array) => new Uint32Array(word));

    const currentWord = new Uint32Array(2);
    const andOperationResult = new Uint32Array(2);
    const shiftRightResult = new Uint32Array(2);
    const shiftLeftResult = new Uint32Array(2);
    const xorOperationResult = new Uint32Array(2);
    const sRotationResult = new Uint32Array(2);
    const sAndSmResult = new Uint32Array(2);

    for (let j = 0; j < rRounds; j++) {
      const iterationOffset = MD6_WORDS_BLOCK + j * 16;
      for (let s = 0; s < 16; s++) {
        const i = iterationOffset + s;

        currentWord[0] = chainingValue[0];
        currentWord[1] = chainingValue[1];

        Md6.xorWord(currentWord, workingRegisterArray[i - MD6_TRANSFORM_OFFSETS[5]], currentWord);

        Md6.xorWord(currentWord, workingRegisterArray[i - MD6_TRANSFORM_OFFSETS[0]], currentWord);

        Md6.andWord(workingRegisterArray[i - MD6_TRANSFORM_OFFSETS[1]], workingRegisterArray[i - MD6_TRANSFORM_OFFSETS[2]], andOperationResult);
        Md6.xorWord(currentWord, andOperationResult, currentWord);

        Md6.andWord(workingRegisterArray[i - MD6_TRANSFORM_OFFSETS[3]], workingRegisterArray[i - MD6_TRANSFORM_OFFSETS[4]], andOperationResult);
        Md6.xorWord(currentWord, andOperationResult, currentWord);

        Md6.shrWord(currentWord, MD6_RIGHT_SHIFTS[s], shiftRightResult);
        Md6.xorWord(currentWord, shiftRightResult, currentWord);

        Md6.shlWord(currentWord, MD6_LEFT_SHIFTS[s], shiftLeftResult);
        Md6.xorWord(currentWord, shiftLeftResult, xorOperationResult);

        workingRegisterArray[i] = new Uint32Array(xorOperationResult);
      }

      Md6.shlWord(chainingValue, 1, shiftLeftResult);
      Md6.shrWord(chainingValue, 63, shiftRightResult);
      Md6.xorWord(shiftLeftResult, shiftRightResult, sRotationResult);

      Md6.andWord(chainingValue, MD6_COMPRESSION_SM, sAndSmResult);
      Md6.xorWord(sRotationResult, sAndSmResult, chainingValue);
    }
    return workingRegisterArray.slice(workingRegisterArray.length - 16);
  }

  /**
   * Prepares the input block and executes the core MD6 compression function for a single data chunk.
   *
   * @param {Uint32Array[]} B The data block to be processed.
   * @param {Uint32Array[]} C The chaining value from the previous compression.
   * @param {number} i The index of the current data block.
   * @param {number} p The number of padding bits in the message.
   * @param {number} z A flag indicating if this is the final block (1 if final, 0 otherwise).
   * @param {number} ell The current level number in the tree-based hashing structure.
   * @param {number} kLen The length of the key in bytes.
   * @param {number} hashSize The desired output hash size in bits.
   * @param {number} levels The total number of levels in the tree.
   * @param {number} rRounds The number of compression rounds.
   * @param {Uint32Array[]} keyWords The key, formatted as 64-bit words.
   * @returns {Uint32Array[]} The result of the compression, a new chaining value.
   */
  private static computeCompression(
    B: Uint32Array[],
    C: Uint32Array[],
    i: number,
    p: number,
    z: number,
    ell: number,
    kLen: number,
    hashSize: number,
    levels: number,
    rRounds: number,
    keyWords: Uint32Array[],
  ): Uint32Array[] {
    const uVector: Uint32Array = new Uint32Array([((ell & 0xff) << 24) | (Math.floor(i / 0x100000000) & 0xffffff), i & 0xffffffff]);
    const vVector: Uint32Array = new Uint32Array([
      ((rRounds & 0xfff) << 16) | ((levels & 0xff) << 8) | ((z & 0xf) << 4) | ((p & 0xf000) >> 12),
      ((p & 0xfff) << 20) | ((kLen & 0xff) << 12) | (hashSize & 0xfff),
    ]);

    const totalLength = MD6_SINE_TABLE.length / 2 + keyWords.length + 2 + C.length + B.length;
    const combinedWords: Uint32Array[] = new Array(totalLength);
    let offset = 0;

    for (let idx = 0; idx < MD6_SINE_TABLE.length; idx += 2) {
      combinedWords[offset++] = new Uint32Array([MD6_SINE_TABLE[idx], MD6_SINE_TABLE[idx + 1]]);
    }
    for (let idx = 0; idx < keyWords.length; idx++) {
      combinedWords[offset++] = keyWords[idx];
    }
    combinedWords[offset++] = uVector;
    combinedWords[offset++] = vVector;
    for (let idx = 0; idx < C.length; idx++) {
      combinedWords[offset++] = C[idx];
    }
    for (let idx = 0; idx < B.length; idx++) {
      combinedWords[offset++] = B[idx];
    }

    return Md6.processCompression(combinedWords, rRounds);
  }

  /**
   * Pads the message to a multiple of the block size.
   *
   * @param {Uint8Array} message The message to pad.
   * @param {number} blockSize The block size in bytes to which the message should be padded.
   * @returns {{paddedMessage: Uint8Array, paddingLength: number}} An object containing the padded message and the number of padding bits added.
   */
  private static padMessage(message: Uint8Array, blockSize: number): { paddedMessage: Uint8Array; paddingLength: number } {
    let paddingLength = 0;
    let currentPaddedLength = message.length;

    if (currentPaddedLength === 0 || currentPaddedLength % blockSize > 0) {
      if (currentPaddedLength === 0) {
        currentPaddedLength = 1;
        paddingLength = 8;
      }
      while (currentPaddedLength % blockSize > 0) {
        currentPaddedLength++;
        paddingLength += 8;
      }
    }
    const paddedMessage = new Uint8Array(currentPaddedLength);
    paddedMessage.set(message);
    return { paddedMessage, paddingLength };
  }

  /**
   * Performs the parallel (tree-based) mode of MD6 compression for a given level.
   *
   * @param {Uint8Array} message The input message for this level.
   * @param {number} ell The current level number.
   * @param {number} hashSize The desired output hash size in bits.
   * @param {number} levels The maximum number of levels.
   * @param {number} kLen The length of the key in bytes.
   * @param {number} rRounds The number of compression rounds.
   * @param {Uint32Array[]} keyWords The key, formatted as 64-bit words.
   * @returns {Uint8Array} The concatenated chaining values from this level's compressions.
   */
  private static parallelCompression(
    message: Uint8Array,
    ell: number,
    hashSize: number,
    levels: number,
    kLen: number,
    rRounds: number,
    keyWords: Uint32Array[],
  ): Uint8Array {
    const wordBlockSize = MD6_BLOCK_BITS / 8;
    const { paddedMessage, paddingLength } = Md6.padMessage(message, MD6_BLOCK_BITS);
    const isFinalBlock = message.length <= MD6_BLOCK_BITS ? 1 : 0;

    const dataWords = Md6.bytesToWords(paddedMessage);
    const blockCount = dataWords.length / wordBlockSize;
    const finalCChainWordLength = blockCount * 16;
    const tempCChainWords: Uint32Array[] = new Array(finalCChainWordLength);
    let cChainWordOffset = 0;

    for (let i = 0; i < blockCount; i++) {
      const p = i === blockCount - 1 ? paddingLength : 0;
      const block = dataWords.slice(i * wordBlockSize, (i + 1) * wordBlockSize);
      const compressionOutput = Md6.computeCompression(block, [], i, p, isFinalBlock, ell, kLen, hashSize, levels, rRounds, keyWords);

      for (let k = 0; k < compressionOutput.length; k++) {
        tempCChainWords[cChainWordOffset++] = compressionOutput[k];
      }
    }
    return Md6.wordsToBytes(tempCChainWords);
  }

  /**
   * Performs the sequential mode of MD6 compression.
   *
   * @param {Uint8Array} message The input message.
   * @param {number} ell The current level number.
   * @param {number} hashSize The desired output hash size in bits.
   * @param {number} levels The maximum number of levels.
   * @param {number} kLen The length of the key in bytes.
   * @param {number} rRounds The number of compression rounds.
   * @param {Uint32Array[]} keyWords The key, formatted as 64-bit words.
   * @returns {Uint8Array} The final chaining value as a byte array.
   */
  private static sequentialCompression(
    message: Uint8Array,
    ell: number,
    hashSize: number,
    levels: number,
    kLen: number,
    rRounds: number,
    keyWords: Uint32Array[],
  ): Uint8Array {
    const wordBlockSize = (MD6_BLOCK_BITS - MD6_CHAINING_BITS) / 8;
    const { paddedMessage, paddingLength } = Md6.padMessage(message, MD6_BLOCK_BITS - MD6_CHAINING_BITS);

    const dataWords = Md6.bytesToWords(paddedMessage);
    const blockCount = dataWords.length / wordBlockSize;
    let chainingValue: Uint32Array[] = Array.from({ length: MD6_CHAINING_BITS / 8 }, () => new Uint32Array([0, 0]));

    for (let i = 0; i < blockCount; i++) {
      const p = i === blockCount - 1 ? paddingLength : 0;
      const isFinalBlock = i === blockCount - 1 ? 1 : 0;
      const block = dataWords.slice(i * wordBlockSize, (i + 1) * wordBlockSize);
      chainingValue = Md6.computeCompression(block, chainingValue, i, p, isFinalBlock, ell, kLen, hashSize, levels, rRounds, keyWords);
    }
    return Md6.wordsToBytes(chainingValue);
  }

  private hashSize: number;
  private keyBytes: Uint8Array;
  private levels: number;

  /**
   * Initializes a new instance of the {@link Md6} hasher.
   *
   * @param {Partial<Md6Options>=} [options={}] Configuration options for the MD6 hash.
   */
  public constructor(options: Partial<Md6Options> = {}) {
    super(options);
    this.hashSize = Math.max(1, Math.min(options.size || 256, 512));
    this.keyBytes = options.key || new Uint8Array();
    this.levels = options.levels || 64;
    this.reset();
  }

  /**
   * Completes the hash computation and returns the final hash value.
   *
   * @returns {Uint8Array} The computed MD6 hash.
   */
  public override finalize(): Uint8Array {
    const finalHash = this.engine();
    super.reset();
    return finalHash;
  }

  /**
   * The core MD6 hashing logic that processes the message through multiple levels.
   *
   * @returns {Uint8Array} The final hash result, truncated to the desired `hashSize`.
   */
  private engine(): Uint8Array {
    const keyLength = this.keyBytes.length;
    const keyData = new Uint8Array(64);
    keyData.set(this.keyBytes.slice(0, 64));
    const keyWords = Md6.bytesToWords(keyData);
    const rRounds = Math.max(keyLength > 0 ? 80 : 0, 40 + this.hashSize / 4);

    let level = 0;
    let currentMessage: Uint8Array = this.state.message;
    do {
      level++;
      currentMessage =
        level > this.levels
          ? Md6.sequentialCompression(currentMessage, level, this.hashSize, this.levels, keyLength, rRounds, keyWords)
          : Md6.parallelCompression(currentMessage, level, this.hashSize, this.levels, keyLength, rRounds, keyWords);
    } while (currentMessage.length !== MD6_CHAINING_BITS);

    const byteLength = Math.ceil(this.hashSize / 8);
    const bitRemainder = this.hashSize % 8;

    const finalHashBlock = currentMessage.slice(currentMessage.length - byteLength);

    if (bitRemainder > 0) {
      finalHashBlock[byteLength - 1] &= (0xff << (8 - bitRemainder)) & 0xff;
    }

    return finalHashBlock;
  }

  /**
   * Processes a chunk of data. This is a stub in the MD6 implementation as processing is deferred to `finalize`.
   *
   * @returns {void}
   */
  protected override process(): void {}
}
