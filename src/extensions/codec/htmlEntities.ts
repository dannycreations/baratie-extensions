import { CATEGORY_CODEC } from '../../core/constants';

import type { IngredientDefinition, InputType, ResultType, SpiceDefinition } from 'baratie';

interface HtmlEntitiesSpice {
  readonly operation: 'encode' | 'decode';
}

const HTML_ENTITIES_SPICES: readonly SpiceDefinition[] = [
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

const HTML_ENTITIES_DEFINITION: IngredientDefinition<HtmlEntitiesSpice> = {
  name: Symbol('HTML Entities'),
  category: CATEGORY_CODEC,
  description: 'Encodes or decodes HTML special characters to/from HTML entities.',
  spices: HTML_ENTITIES_SPICES,
  run: (input: InputType, spices: HtmlEntitiesSpice): ResultType<string> => {
    const text = input.cast('string').getValue();
    if (!text) {
      return null;
    }

    let result = '';
    const textarea = document.createElement('textarea');

    if (spices.operation === 'encode') {
      textarea.textContent = text;
      result = textarea.innerHTML;
    } else {
      textarea.innerHTML = text;
      result = textarea.textContent || '';
    }

    return input.update(result);
  },
};

Baratie.ingredient.registerIngredient(HTML_ENTITIES_DEFINITION);
