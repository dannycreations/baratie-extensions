import { CATEGORY_FORMATTER } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface JsonSpice {
  readonly space: number;
}

const jsonSpices: readonly SpiceDefinition[] = [
  {
    id: 'space',
    label: 'Indentation Spaces',
    type: 'number',
    value: 2,
    description: 'Number of spaces for JSON indentation.',
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
      const parsedJson = JSON.parse(inputValue);
      const formattedJson = JSON.stringify(parsedJson, null, spices.space);
      return input.update(formattedJson);
    } catch (error) {
      return input.update((error as Error).message);
    }
  },
};

Baratie.ingredient.registerIngredient(jsonDefinition);
