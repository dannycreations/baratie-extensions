import { CATEGORY_CODEC } from '../../core/constants';

import type { IngredientDefinition, InputType, ResultType, SpiceDefinition } from 'baratie';

interface Base64Spice {
  readonly operation: 'encode' | 'decode';
}

const BASE64_SPICES: readonly SpiceDefinition[] = [
  {
    id: 'operation',
    label: 'Operation',
    type: 'select',
    value: 'encode',
    options: [
      { label: 'Encode', value: 'encode' },
      { label: 'Decode', value: 'decode' },
    ],
    description: 'Select whether to encode or decode the input.',
  },
];

const BASE64_DEFINITION: IngredientDefinition<Base64Spice> = {
  name: Symbol('Base64'),
  category: CATEGORY_CODEC,
  description: 'Encodes or decodes text using Base64.',
  spices: BASE64_SPICES,
  run: (input: InputType, spices: Base64Spice): ResultType<string> => {
    const text = input.cast('string').getValue();
    if (!text) {
      return null;
    }

    let result = '';
    try {
      if (spices.operation === 'encode') {
        result = btoa(text);
      } else {
        result = atob(text);
      }
    } catch (e: unknown) {
      return input.update(`Error: ${(e as Error).message}`);
    }

    return input.update(result);
  },
};

Baratie.ingredient.registerIngredient(BASE64_DEFINITION);
