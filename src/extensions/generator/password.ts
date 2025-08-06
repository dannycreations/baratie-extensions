import { CATEGORY_GENERATOR } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface PasswordSpice {
  readonly excludedChars: string;
  readonly excludeAmbiguous: boolean;
  readonly hasLowercase: boolean;
  readonly hasNumbers: boolean;
  readonly hasSymbols: boolean;
  readonly hasUppercase: boolean;
  readonly length: number;
}

const DEFAULT_CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: `!@#$%^&*()_+-=[]{};':",./<>?`,
  ambiguous: 'iIl1oO0B8S5Z2G6q9g',
} as const;

type CharType = 'Uppercase' | 'Lowercase' | 'Numbers' | 'Symbols';

function makeCharSpices(idPrefix: CharType): SpiceDefinition {
  return {
    id: `has${idPrefix}`,
    label: `Include ${idPrefix}`,
    type: 'boolean',
    value: true,
  };
}

/**
 * Generates a cryptographically secure random number within a specified range [min, max).
 * This function avoids modulo bias by re-rolling if the generated number falls outside
 * the largest multiple of the range that fits within the Uint32 range.
 *
 * @param min The minimum value (inclusive).
 * @param max The maximum value (exclusive).
 * @returns A cryptographically secure random number.
 */
function getRandomNumberBetween(min: number, max: number): number {
  const range = max - min;
  if (range <= 0) {
    throw new Error('Max must be greater than min.');
  }

  const uint32Array = new Uint32Array(1);
  let randomNumber;

  do {
    crypto.getRandomValues(uint32Array);
    randomNumber = uint32Array[0];
  } while (randomNumber >= 0xffffffff - (0xffffffff % range));

  return min + (randomNumber % range);
}

const passwordSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'length',
    label: 'Password Length',
    type: 'number',
    value: 16,
    min: 4,
    max: 128,
    description: 'The total length for the generated password.',
  },
  makeCharSpices('Uppercase'),
  makeCharSpices('Lowercase'),
  makeCharSpices('Numbers'),
  makeCharSpices('Symbols'),
  {
    id: 'excludeAmbiguous',
    label: 'Exclude Ambiguous',
    type: 'boolean',
    value: true,
    description: `Exclude similar-looking characters like i, l, 1, O, 0. (Set: ${DEFAULT_CHARS.ambiguous})`,
  },
  {
    id: 'excludedChars',
    label: 'Custom Exclusions',
    type: 'string',
    value: '',
    placeholder: 'e.g., abc[]',
    description: 'A custom set of characters to specifically exclude from generation.',
  },
];

const passwordDefinition: IngredientDefinition<PasswordSpice> = {
  name: 'Password',
  category: CATEGORY_GENERATOR,
  description: 'Generates strong, random passwords with customizable options.',
  spices: passwordSpices,
  run: (input, spices) => {
    const exclusionSet = new Set(spices.excludedChars.split(''));
    if (spices.excludeAmbiguous) {
      for (const char of DEFAULT_CHARS.ambiguous) {
        exclusionSet.add(char);
      }
    }

    const charSets = [
      { include: spices.hasUppercase, source: DEFAULT_CHARS.uppercase },
      { include: spices.hasLowercase, source: DEFAULT_CHARS.lowercase },
      { include: spices.hasNumbers, source: DEFAULT_CHARS.numbers },
      { include: spices.hasSymbols, source: DEFAULT_CHARS.symbols },
    ];

    const charPool: string[] = [];
    const requiredChars: string[] = [];

    for (const set of charSets) {
      if (set.include) {
        const filteredSet = set.source.split('').filter((char) => !exclusionSet.has(char));
        if (filteredSet.length > 0) {
          charPool.push(...filteredSet);
          requiredChars.push(filteredSet[getRandomNumberBetween(0, filteredSet.length)]);
        }
      }
    }

    if (charPool.length === 0) {
      return input.update('Error: No character types selected. Please enable at least one character set.');
    }

    const passwordChars = [...requiredChars];
    for (let i = requiredChars.length; i < spices.length; i++) {
      passwordChars.push(charPool[getRandomNumberBetween(0, charPool.length)]);
    }

    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = getRandomNumberBetween(0, i + 1);
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return input.update(passwordChars.slice(0, spices.length).join(''));
  },
};

Baratie.ingredient.register(passwordDefinition);
