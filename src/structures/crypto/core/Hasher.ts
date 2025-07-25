/**
 * Represents a read-only record of options for a hasher's configuration.
 */
export type HasherOptions = Readonly<Record<string, unknown>>;

/**
 * Defines the internal state of a {@link Hasher} instance.
 */
export interface HasherState {
  /**
   * The message buffer being processed.
   */
  message: Uint8Array;
  /**
   * The total length of the message processed so far.
   */
  length: number;
}

/**
 * Abstract base class for cryptographic hash functions.
 *
 * Refer to the original source for more information.
 * @see {@link https://github.com/nf404/crypto-api/blob/master/src/hasher/hasher.mjs}
 *
 * @template O The type for the hasher options, extending {@link HasherOptions}.
 * @template S The type for the hasher state, extending {@link HasherState}.
 */
export abstract class Hasher<O extends HasherOptions = HasherOptions, S extends HasherState = HasherState> {
  protected readonly options: O;

  protected state: S;
  protected unitSize: number;
  protected unitOrder: number;
  protected blockSize: number;
  protected blockSizeInBytes: number;

  protected constructor(options = {} as O) {
    this.unitSize = 1;
    this.unitOrder = 0;
    this.blockSize = 16;
    this.blockSizeInBytes = this.blockSize * this.unitSize;
    this.options = options;
    this.state = { message: new Uint8Array(0), length: 0 } as S;
    this.reset();
  }

  /**
   * Finalizes the hash computation and returns the resulting hash digest.
   *
   * @returns {Uint8Array} The computed hash digest as a byte array.
   */
  public abstract finalize(): Uint8Array;

  /**
   * Processes the internal message buffer. This method is typically called
   * internally by {@link update} to handle chunks of data.
   *
   * @returns {void}
   */
  protected abstract process(): void;

  /**
   * Resets the hasher to its initial state, clearing any processed data.
   *
   * @returns {void}
   */
  public reset(): void {
    this.state.message = new Uint8Array(0);
    this.state.length = 0;
  }

  /**
   * Retrieves a clone of the current internal state of the hasher.
   *
   * @returns {S} A deep copy of the hasher's current state object.
   */
  public getState(): S {
    const clonedState: S = { ...this.state };
    clonedState.message = new Uint8Array(this.state.message);
    return clonedState;
  }

  /**
   * Restores the hasher's internal state from a provided state object.
   *
   * @param {S} state The state object to restore. The `message` property
   *   within the state will be cloned to prevent mutation.
   * @returns {void}
   */
  public setState(state: S): void {
    this.state = { ...state, message: new Uint8Array(state.message) };
  }

  /**
   * Updates the hash with a new chunk of data.
   *
   * @param {Uint8Array} message The data chunk to add to the hash.
   * @returns {void}
   */
  public update(message: Uint8Array): void {
    const newMessage = new Uint8Array(this.state.message.length + message.length);
    newMessage.set(this.state.message);
    newMessage.set(message, this.state.message.length);
    this.state.message = newMessage;
    this.state.length += message.length;
    this.process();
  }

  protected addPaddingPKCS7(length: number): void {
    const paddingBytes = new Uint8Array(length).fill(length);
    const newMessage = new Uint8Array(this.state.message.length + paddingBytes.length);
    newMessage.set(this.state.message);
    newMessage.set(paddingBytes, this.state.message.length);
    this.state.message = newMessage;
  }

  protected addPaddingISO7816(length: number): void {
    const paddingBytes = new Uint8Array(length);
    paddingBytes[0] = 0x80;
    const newMessage = new Uint8Array(this.state.message.length + paddingBytes.length);
    newMessage.set(this.state.message);
    newMessage.set(paddingBytes, this.state.message.length);
    this.state.message = newMessage;
  }

  protected addPaddingZero(length: number): void {
    const paddingBytes = new Uint8Array(length).fill(0x00);
    const newMessage = new Uint8Array(this.state.message.length + paddingBytes.length);
    newMessage.set(this.state.message);
    newMessage.set(paddingBytes, this.state.message.length);
    this.state.message = newMessage;
  }
}
