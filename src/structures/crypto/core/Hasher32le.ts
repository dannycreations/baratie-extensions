import { Hasher } from '../core/Hasher';

import type { HasherOptions, HasherState } from '../core/Hasher';

/**
 * Defines the state structure for 32-bit little-endian hash algorithms.
 * @extends {HasherState}
 */
export interface Hasher32leState extends HasherState {
  /** The intermediate hash value as an array of 32-bit unsigned integers. */
  hash: Uint32Array;
}

/**
 * Abstract base class for 32-bit little-endian hash algorithms.
 *
 * Refer to the original source for more information.
 * @see {@link https://github.com/nf404/crypto-api/blob/master/src/hasher/hasher32le.mjs}
 *
 * @template O The type of the options object, extending {@link HasherOptions}.
 * @template T The type of the hasher state, extending {@link Hasher32leState}.
 */
export abstract class Hasher32le<O extends HasherOptions = HasherOptions, T extends Hasher32leState = Hasher32leState> extends Hasher<O, T> {
  protected blockUnits: Uint32Array;

  /**
   * Initializes a new instance of the 32-bit little-endian hasher.
   *
   * @param {O=} [options={}] Configuration options for the hasher.
   */
  public constructor(options = {} as O) {
    super(options);
    this.unitSize = 4;
    this.unitOrder = 0;
    this.blockSizeInBytes = this.blockSize * this.unitSize;
    this.blockUnits = new Uint32Array(this.blockSizeInBytes / this.unitSize);
  }

  /**
   * Abstract method responsible for processing a single block of the message.
   *
   * @param {Uint32Array} block The message block to process, as an array of 32-bit words.
   * @returns {void}
   */
  protected abstract processBlock(block: Uint32Array): void;

  /**
   * Processes the buffered message data in blocks of 32-bit little-endian words.
   *
   * This method converts byte data from the message buffer into 32-bit words
   * and iteratively calls {@link processBlock} on each full block.
   *
   * @returns {void}
   */
  protected process(): void {
    const blockByteSize = this.blockSizeInBytes;
    const wordCount = this.blockUnits.length;

    while (this.state.message.length >= blockByteSize) {
      for (let i = 0; i < wordCount; i++) {
        const j = i * 4;
        this.blockUnits[i] =
          (this.state.message[j] | (this.state.message[j + 1] << 8) | (this.state.message[j + 2] << 16) | (this.state.message[j + 3] << 24)) >>> 0;
      }

      this.state.message = this.state.message.slice(blockByteSize);
      this.processBlock(this.blockUnits);
    }
  }

  /**
   * Appends the total message length in bits as an 8-byte little-endian value.
   *
   * This is typically part of the finalization process for many hash algorithms.
   *
   * @returns {void}
   */
  protected addLengthBits(): void {
    const len = this.state.length;
    const lengthBytes = new Uint8Array(8);
    lengthBytes[0] = (len << 3) & 0xff;
    lengthBytes[1] = (len >> 5) & 0xff;
    lengthBytes[2] = (len >> 13) & 0xff;
    lengthBytes[3] = (len >> 21) & 0xff;
    lengthBytes[4] = (len >> 29) & 0xff;
    lengthBytes[5] = 0x00;
    lengthBytes[6] = 0x00;
    lengthBytes[7] = 0x00;

    const newMessage = new Uint8Array(this.state.message.length + lengthBytes.length);
    newMessage.set(this.state.message);
    newMessage.set(lengthBytes, this.state.message.length);
    this.state.message = newMessage;
  }
}
