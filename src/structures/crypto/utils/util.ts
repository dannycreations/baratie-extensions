/**
 * Converts a Uint8Array into a hexadecimal string.
 *
 * Each byte in the array is converted into a two-character hex representation.
 *
 * @example
 * const bytes = new Uint8Array([10, 255, 0]);
 * const hex = bytesToHex(bytes);
 * // a hex string '0aff00'
 *
 * @param {Uint8Array} bytes The byte array to convert.
 * @returns {string} The hexadecimal string representation of the byte array.
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
