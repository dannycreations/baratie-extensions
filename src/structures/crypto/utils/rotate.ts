/**
 * Utility functions for bitwise rotations.
 *
 * Refer to the original source for more information.
 * @see {@link https://github.com/nf404/crypto-api/blob/master/src/tools/tools.mjs}
 */

/**
 * Performs a 32-bit left circular shift (rotation) on a number.
 *
 * @param {number} x The 32-bit integer to rotate.
 * @param {number} n The number of bits to rotate by.
 * @returns {number} The result of the left rotation, as a 32-bit integer.
 */
export function rotateLeft(x: number, n: number): number {
  return (x << n) | (x >>> (32 - n)) | 0;
}

/**
 * Performs a 32-bit right circular shift (rotation) on a number.
 *
 * @param {number} x The 32-bit integer to rotate.
 * @param {number} n The number of bits to rotate by.
 * @returns {number} The result of the right rotation, as a 32-bit integer.
 */
export function rotateRight(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n)) | 0;
}

/**
 * Calculates the high 32 bits of a 64-bit value after a right circular shift.
 * The 64-bit value is represented by two 32-bit integers.
 *
 * @param {number} hi The high 32 bits of the original 64-bit value.
 * @param {number} lo The low 32 bits of the original 64-bit value.
 * @param {number} n The number of bits to rotate by (0-63).
 * @returns {number} The high 32 bits of the rotated 64-bit value.
 */
export function rotateRight64hi(hi: number, lo: number, n: number): number {
  if (n === 32) {
    return lo;
  }
  if (n > 32) {
    return rotateRight64hi(lo, hi, n - 32);
  }
  return ((hi >>> n) | (lo << (32 - n))) & 0xffffffff;
}

/**
 * Calculates the low 32 bits of a 64-bit value after a right circular shift.
 * The 64-bit value is represented by two 32-bit integers.
 *
 * @param {number} hi The high 32 bits of the original 64-bit value.
 * @param {number} lo The low 32 bits of the original 64-bit value.
 * @param {number} n The number of bits to rotate by (0-63).
 * @returns {number} The low 32 bits of the rotated 64-bit value.
 */
export function rotateRight64lo(hi: number, lo: number, n: number): number {
  if (n === 32) {
    return hi;
  }
  if (n > 32) {
    return rotateRight64lo(lo, hi, n - 32);
  }
  return ((lo >>> n) | (hi << (32 - n))) & 0xffffffff;
}
