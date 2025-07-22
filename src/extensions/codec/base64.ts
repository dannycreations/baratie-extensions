import { CATEGORY_CODEC } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface Base64Spice {
  readonly operation: 'encode' | 'decode';
}

const base64Spices: readonly SpiceDefinition[] = [
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

const base64Definition: IngredientDefinition<Base64Spice> = {
  name: 'Base64',
  category: CATEGORY_CODEC,
  description: 'Encodes or decodes text using Base64.',
  spices: base64Spices,
  run: (input, spices) => {
    const inputValue = input.cast('string').getValue();
    if (!inputValue) {
      return null;
    }

    let result = '';
    if (spices.operation === 'encode') {
      result = btoa(inputValue);
    } else {
      result = atob(inputValue);
    }

    return input.update(result);
  },
};

Baratie.ingredient.registerIngredient(base64Definition);
