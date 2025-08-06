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

function normalizeWords(str: string): string[] {
  const result = str
    // Replace all non-alphanumeric characters with spaces.
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    // Add space between uppercase letters followed by another uppercase
    // and then a lowercase letter (e.g., "HTTPResponse" -> "HTTP Response").
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // Add space between a lowercase letter/digit and an uppercase letter (e.g., "camelCase" -> "camel Case").
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    // Replace multiple spaces with a single space and trim leading/trailing spaces.
    .replace(/\s+/g, ' ')
    .trim();

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
    const inputValue = input.cast('string').value;
    if (!inputValue.trim()) {
      return input.warning();
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
        result = normalizeWords(inputValue)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        break;
      case 'camelCase': {
        const words = normalizeWords(inputValue);
        result = words.map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))).join('');
        break;
      }
      case 'pascalCase':
        result = normalizeWords(inputValue)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        break;
      case 'snakeCase':
        result = normalizeWords(inputValue).join('_');
        break;
      case 'kebabCase':
        result = normalizeWords(inputValue).join('-');
        break;
      case 'constantCase':
        result = normalizeWords(inputValue).join('_').toUpperCase();
        break;
      case 'customCase': {
        const delimiter = spices.customDelimiter || '';
        // Using split(/\s+/) instead of normalizeWords to preserve original word
        // boundaries and allow the custom delimiter to be applied directly to
        // the whitespace-separated segments of the input string.
        // normalizeWords performs additional normalization that is not desired here.
        result = inputValue.split(/\s+/).join(delimiter);
        break;
      }
    }

    return input.update(result);
  },
};

Baratie.ingredient.register(caseDefinition);
