import { CATEGORY_CODEC } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface URLSpice {
  readonly operation: 'encode' | 'decode';
}

const urlSpices: readonly SpiceDefinition[] = [
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

const urlDefinition: IngredientDefinition<URLSpice> = {
  name: Symbol('Url'),
  category: CATEGORY_CODEC,
  description: 'Encodes or decodes URL components.',
  spices: urlSpices,
  run: (input, spices) => {
    const inputValue = input.cast('string').getValue();
    if (!inputValue) {
      return null;
    }

    let result = '';
    if (spices.operation === 'encode') {
      result = encodeURIComponent(inputValue);
    } else {
      result = decodeURIComponent(inputValue);
    }

    return input.update(result);
  },
};

Baratie.ingredient.registerIngredient(urlDefinition);
