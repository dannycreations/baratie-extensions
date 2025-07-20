import JSON5 from 'json5';

import { CATEGORY_FORMATTER } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface JsonSpice {
  readonly formatMode: 'beautify' | 'minify';
  readonly space: number;
}

const jsonSpices: readonly SpiceDefinition[] = [
  {
    id: 'formatMode',
    label: 'Format Mode',
    type: 'select',
    value: 'beautify',
    options: [
      { value: 'beautify', label: 'Beautify' },
      { value: 'minify', label: 'Minify' },
    ],
    description: 'Select JSON formatting mode.',
  },
  {
    id: 'space',
    label: 'Indentation Spaces',
    type: 'number',
    value: 2,
    min: 0,
    step: 1,
    description: 'Number of spaces for JSON indentation.',
    dependsOn: [{ spiceId: 'formatMode', value: 'beautify' }],
  },
];

const jsonDefinition: IngredientDefinition<JsonSpice> = {
  name: Symbol('Json'),
  category: CATEGORY_FORMATTER,
  description: 'Formats and validates JSON input.',
  spices: jsonSpices,
  run: (input, spices) => {
    const inputValue = input.cast('string').getValue();
    if (!inputValue) {
      return null;
    }

    try {
      const parsedData = JSON5.parse(inputValue);
      let formattedData: string;

      if (spices.formatMode === 'minify') {
        formattedData = JSON5.stringify(parsedData);
      } else {
        formattedData = JSON5.stringify(parsedData, null, spices.space);
      }

      return input.update(formattedData);
    } catch (error) {
      return input.update(`Error: ${(error as Error).message}.`);
    }
  },
};

Baratie.ingredient.registerIngredient(jsonDefinition);
