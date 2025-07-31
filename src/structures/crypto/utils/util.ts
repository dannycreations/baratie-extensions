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
  let hexString = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    hexString += byte < 16 ? '0' + byte.toString(16) : byte.toString(16);
  }
  return hexString;
}
