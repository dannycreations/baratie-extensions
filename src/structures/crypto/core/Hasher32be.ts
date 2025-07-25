import { Hasher } from './Hasher';

import type { HasherOptions, HasherState } from './Hasher';

/**
 * Defines the state structure for 32-bit big-endian hash algorithms.
 * It extends the base {@link HasherState}.
 */
export interface Hasher32beState extends HasherState {
  /** The hash state as an array of 32-bit numbers. */
  hash: number[];
}

/**
 * Abstract base class for 32-bit big-endian hash algorithms.
 *
 * Refer to the original source for more information.
 * @see {@link https://github.com/nf404/crypto-api/blob/master/src/hasher/hasher32be.mjs}
 *
 * @template O The type of the options object, extending {@link HasherOptions}.
 * @template T The type of the hasher state, extending {@link Hasher32beState}.
 */
export abstract class Hasher32be<O extends HasherOptions = HasherOptions, T extends Hasher32beState = Hasher32beState> extends Hasher<O, T> {
  protected blockUnits: number[];

  /**
   * Initializes a new instance of a 32-bit big-endian hasher.
   *
   * @param {O=} [options={}] Configuration options for the hasher.
   */
  public constructor(options = {} as O) {
    super(options);
    this.unitSize = 4;
    this.unitOrder = 1;
    this.blockSizeInBytes = this.blockSize * this.unitSize;
    this.blockUnits = [];
  }

  /**
   * Processes a single block of data.
   *
   * @param {number[]} block The block to process, as an array of 32-bit numbers.
   * @returns {void}
   */
  protected abstract processBlock(block: number[]): void;

  /**
   * Processes the message buffer, breaking it down into blocks and passing
   * them to `processBlock`.
   * @returns {void}
   */
  protected process(): void {
    const wordCount = this.blockSizeInBytes / 4;
    if (!this.blockUnits || this.blockUnits.length !== wordCount) {
      this.blockUnits = new Array<number>(wordCount);
    }

    while (this.state.message.length >= this.blockSizeInBytes) {
      for (let i = 0; i < wordCount; i++) {
        const j = i * 4;
        this.blockUnits[i] =
          (this.state.message[j] << 24) | (this.state.message[j + 1] << 16) | (this.state.message[j + 2] << 8) | this.state.message[j + 3];
      }
      this.state.message = this.state.message.slice(this.blockSizeInBytes);
      this.processBlock(this.blockUnits);
    }
  }

  /**
   * Appends the 64-bit big-endian representation of the message length
   * to the message buffer.
   * @returns {void}
   */
  protected addLengthBits(): void {
    const len = this.state.length;
    const newBytes = new Uint8Array([
      0x00,
      0x00,
      0x00,
      (len >> 29) & 0xff,
      (len >> 21) & 0xff,
      (len >> 13) & 0xff,
      (len >> 5) & 0xff,
      (len << 3) & 0xff,
    ]);
    const updatedMessage = new Uint8Array(this.state.message.length + newBytes.length);
    updatedMessage.set(this.state.message);
    updatedMessage.set(newBytes, this.state.message.length);
    this.state.message = updatedMessage;
  }
}
