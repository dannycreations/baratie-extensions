import { CATEGORY_GENERATORS } from '../../core/constants';

import type { IngredientDefinition, InputType, ResultType, SpiceDefinition } from 'baratie';

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

const PASSWORD_SPICES: readonly SpiceDefinition[] = [
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

const PASSWORD_DEFINITION: IngredientDefinition<PasswordSpice> = {
  name: Symbol('Password'),
  category: CATEGORY_GENERATORS,
  description: 'Generates strong, random passwords with customizable options.',
  spices: PASSWORD_SPICES,
  run: (input: InputType<unknown>, spices: PasswordSpice): ResultType<string> => {
    const { length, hasUppercase, hasLowercase, hasNumbers, hasSymbols, excludeAmbiguous, excludedChars } = spices;
    const exclusionSet = new Set(excludedChars.split(''));
    if (excludeAmbiguous) {
      for (const char of DEFAULT_CHARS.ambiguous) {
        exclusionSet.add(char);
      }
    }
    const charSets = [
      { include: hasUppercase, source: DEFAULT_CHARS.uppercase },
      { include: hasLowercase, source: DEFAULT_CHARS.lowercase },
      { include: hasNumbers, source: DEFAULT_CHARS.numbers },
      { include: hasSymbols, source: DEFAULT_CHARS.symbols },
    ];
    const charPoolArray: string[] = [];
    for (const set of charSets) {
      if (set.include) {
        for (const char of set.source) {
          if (!exclusionSet.has(char)) {
            charPoolArray.push(char);
          }
        }
      }
    }
    const charPool = charPoolArray.join('');
    if (charPool === '') {
      return input.update('Error: No character types selected. Please enable at least one character set.');
    }
    const passwordChars: string[] = [];
    const randomIndices = new Uint32Array(length);
    crypto.getRandomValues(randomIndices);
    for (let i = 0; i < length; i++) {
      passwordChars.push(charPool[randomIndices[i] % charPool.length]);
    }
    return input.update(passwordChars.join(''));
  },
};

Baratie.ingredient.registerIngredient(PASSWORD_DEFINITION);
