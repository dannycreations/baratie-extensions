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

function sortObjectKeys<T extends object>(obj: T): T {
  const sorted: { [key: string]: unknown } = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = (obj as { [key: string]: unknown })[key];
    });
  return sorted as T;
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

    try {
      const repairedValue = jsonrepair(inputValue);
      const parsedData = JSON5.parse(repairedValue);

      const stringifyOptions = {
        replacer: spices.sortKeys
          ? (_key: string, value: unknown) => {
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                return sortObjectKeys(value);
              }
              return value;
            }
          : undefined,
        space: spices.formatMode === 'beautify' ? spices.space : undefined,
        quote: spices.quoteStyle === 'single' ? "'" : '"',
      };

      const result = JSON5.stringify(parsedData, stringifyOptions);
      return input.update(result);
    } catch (error) {
      return input.update(`Error: ${(error as Error).message}.`);
    }
  },
};

Baratie.ingredient.register(jsonDefinition);
