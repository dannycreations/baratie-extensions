import { CATEGORY_CODEC } from '../../core/constants';

import type { IngredientDefinition, InputType, ResultType, SpiceDefinition } from 'baratie';

interface URLSpice {
  readonly operation: 'encode' | 'decode';
}

const URL_SPICES: readonly SpiceDefinition[] = [
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

const URL_DEFINITION: IngredientDefinition<URLSpice> = {
  name: Symbol('Url'),
  category: CATEGORY_CODEC,
  description: 'Encodes or decodes URL components.',
  spices: URL_SPICES,
  run: (input: InputType, spices: URLSpice): ResultType<string> => {
    const text = input.cast('string').getValue();
    if (!text) {
      return null;
    }

    let result = '';
    try {
      if (spices.operation === 'encode') {
        result = encodeURIComponent(text);
      } else {
        result = decodeURIComponent(text);
      }
    } catch (e: unknown) {
      return input.update(`Error: ${(e as Error).message}`);
    }

    return input.update(result);
  },
};

Baratie.ingredient.registerIngredient(URL_DEFINITION);
