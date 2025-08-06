import JSON5 from 'json5';
import { jsonrepair } from 'jsonrepair';

import { CATEGORY_FORMATTER } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface JsonSpice {
  readonly formatMode: 'beautify' | 'minify';
  readonly space: number;
  readonly quoteStyle: 'double' | 'single';
  readonly sortKeys: boolean;
}

const jsonSpices: ReadonlyArray<SpiceDefinition> = [
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
    id: 'quoteStyle',
    label: 'Quote Style',
    type: 'select',
    value: 'double',
    options: [
      { value: 'double', label: 'Double Quotes' },
      { value: 'single', label: 'Single Quotes' },
    ],
    description: 'Select the quote style for strings.',
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
  {
    id: 'sortKeys',
    label: 'Sort Keys',
    type: 'boolean',
    value: false,
    description: 'Sort JSON object keys alphabetically.',
  },
];

function sortObjectKeys(obj: object): object {
  return Object.fromEntries(
    Object.keys(obj)
      .sort()
      .map((key) => {
        const value = (obj as { [key: string]: unknown })[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return [key, sortObjectKeys(value)];
        }
        return [key, value];
      }),
  );
}

const jsonDefinition: IngredientDefinition<JsonSpice> = {
  name: 'Json',
  category: CATEGORY_FORMATTER,
  description: 'Formats and validates JSON input.',
  spices: jsonSpices,
  run: (input, spices) => {
    const inputValue = input.cast('string').value;
    if (!inputValue.trim()) {
      return input.warning();
    }

    const repairedValue = jsonrepair(inputValue);
    let parsedData = JSON5.parse(repairedValue);

    if (spices.sortKeys) {
      parsedData = sortObjectKeys(parsedData);
    }

    const result = JSON5.stringify(parsedData, {
      space: spices.formatMode === 'beautify' ? spices.space : undefined,
      quote: spices.quoteStyle === 'single' ? "'" : '"',
    });

    return input.update(result);
  },
};

Baratie.ingredient.register(jsonDefinition);
