import { Hasher } from '../core/Hasher';

import type { HasherOptions, HasherState } from '../core/Hasher';

/**
 * Defines the options for an 8-bit hasher, extending the base {@link HasherOptions}.
 */
export interface Hasher8Options extends HasherOptions {
  /**
   * The block size for the hashing algorithm in units. The size in bytes is
   * calculated as `blockSize * unitSize`.
   */
  readonly blockSize?: number;
}

/**
 * Defines the state for an 8-bit hasher, extending the base {@link HasherState}.
 */
export interface Hasher8State extends HasherState {
  /**
   * The current hash value as an array of 8-bit unsigned integers.
   */
  hash: Uint8Array;
}

/**
 * Abstract base class for 8-bit hash algorithms.
 *
 * Refer to the original source for more information.
 * @see {@link https://github.com/nf404/crypto-api/blob/master/src/hasher/hasher8.mjs}
 *
 * @template O The type of options for the hasher, extending {@link Hasher8Options}.
 * @template S The type of state for the hasher, extending {@link Hasher8State}.
 */
export abstract class Hasher8<O extends Hasher8Options = Hasher8Options, S extends Hasher8State = Hasher8State> extends Hasher<O, S> {
  /**
   * Initializes a new instance of the Hasher8 class.
   *
   * @param {O=} [options={}] The options for this hasher instance.
   */
  public constructor(options = {} as O) {
    super(options);
    this.unitSize = 1;
    this.unitOrder = 0;
    this.blockSizeInBytes = this.blockSize * this.unitSize;
  }

  /**
   * Processes a single block of data from the message.
   *
   * @param {Uint8Array} block The block of data to process.
   * @returns {void}
   */
  protected abstract processBlock(block: Uint8Array): void;

  /**
   * Processes the buffered message in blocks of `blockSizeInBytes`.
   *
   * @returns {void}
   */
  public process(): void {
    while (this.state.message.length >= this.blockSizeInBytes) {
      const blockUnits = this.state.message.slice(0, this.blockSizeInBytes);
      this.state.message = this.state.message.slice(this.blockSizeInBytes);
      this.processBlock(blockUnits);
    }
  }
}
