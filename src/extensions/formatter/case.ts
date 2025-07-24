import { CATEGORY_FORMATTER } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface CaseSpice {
  readonly conversionType: string;
  readonly customDelimiter?: string;
}

const caseSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'conversionType',
    label: 'Conversion Type',
    type: 'select',
    value: 'lowerCase',
    options: [
      { label: 'lower case', value: 'lowerCase' },
      { label: 'UPPER CASE', value: 'upperCase' },
      { label: 'Title Case', value: 'titleCase' },
      { label: 'camelCase', value: 'camelCase' },
      { label: 'PascalCase', value: 'pascalCase' },
      { label: 'snake_case', value: 'snakeCase' },
      { label: 'kebab-case', value: 'kebabCase' },
      { label: 'CONSTANT_CASE', value: 'constantCase' },
      { label: 'Custom Case', value: 'customCase' },
    ],
    description: 'Select the desired case conversion.',
  },
  {
    id: 'customDelimiter',
    label: 'Custom Delimiter',
    type: 'string',
    value: '',
    placeholder: 'e.g., | or ~',
    description: 'Enter the custom delimiter for Custom Case conversion.',
    dependsOn: [{ spiceId: 'conversionType', value: 'customCase' }],
  },
];

function splitIntoWords(str: string): string[] {
  let result = str.replace(/[^a-zA-Z0-9]+/g, ' ');
  result = result.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  result = result.replace(/([a-z\d])([A-Z])/g, '$1 $2');
  result = result.replace(/\s+/g, ' ').trim();
  return result
    .split(' ')
    .map((word) => word.toLowerCase())
    .filter(Boolean);
}

const caseDefinition: IngredientDefinition<CaseSpice> = {
  name: 'Case',
  category: CATEGORY_FORMATTER,
  description: 'Converts text between various case formats.',
  spices: caseSpices,
  run: (input, spices) => {
    const inputValue = input.cast('string').getValue();
    if (!inputValue.trim()) {
      return null;
    }

    let result = inputValue;
    switch (spices.conversionType) {
      case 'upperCase':
        result = inputValue.toUpperCase();
        break;
      case 'lowerCase':
        result = inputValue.toLowerCase();
        break;
      case 'titleCase':
        result = splitIntoWords(inputValue)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        break;
      case 'camelCase': {
        const words = splitIntoWords(inputValue);
        result = words.map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))).join('');
        break;
      }
      case 'pascalCase':
        result = splitIntoWords(inputValue)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        break;
      case 'snakeCase':
        result = splitIntoWords(inputValue).join('_');
        break;
      case 'kebabCase':
        result = splitIntoWords(inputValue).join('-');
        break;
      case 'constantCase':
        result = splitIntoWords(inputValue).join('_').toUpperCase();
        break;
      case 'customCase':
        const delimiter = spices.customDelimiter || '';
        result = inputValue.split(/\s+/).join(delimiter);
        break;
    }

    return input.update(result);
  },
};

Baratie.ingredient.registerIngredient(caseDefinition);
