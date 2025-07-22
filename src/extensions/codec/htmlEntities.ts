import { CATEGORY_CODEC } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface HtmlEntitiesSpice {
  readonly operation: 'encode' | 'decode';
}

const htmlEntitiesSpices: readonly SpiceDefinition[] = [
  {
    id: 'operation',
    label: 'Operation',
    type: 'select',
    value: 'encode',
    options: [
      { label: 'Encode', value: 'encode' },
      { label: 'Decode', value: 'decode' },
    ],
    description: 'Select whether to encode or decode HTML entities.',
  },
];

const htmlEntitiesDefinition: IngredientDefinition<HtmlEntitiesSpice> = {
  name: 'HTML Entities',
  category: CATEGORY_CODEC,
  description: 'Encodes or decodes HTML special characters to/from HTML entities.',
  spices: htmlEntitiesSpices,
  run: (input, spices) => {
    const inputValue = input.cast('string').getValue();
    if (!inputValue) {
      return null;
    }

    let result = '';
    const textarea = document.createElement('textarea');
    if (spices.operation === 'encode') {
      textarea.textContent = inputValue;
      result = textarea.innerHTML;
    } else {
      textarea.innerHTML = inputValue;
      result = textarea.textContent || '';
    }

    return input.update(result);
  },
};

Baratie.ingredient.registerIngredient(htmlEntitiesDefinition);
