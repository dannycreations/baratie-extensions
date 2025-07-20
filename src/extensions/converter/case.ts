import { CATEGORY_CONVERTERS } from '../../core/constants';

import type { IngredientDefinition, InputType, ResultType, SpiceDefinition } from 'baratie';

interface CaseSpice {
  readonly conversionType: string;
  readonly customDelimiter?: string;
}

function splitIntoWords(str: string): string[] {
  const normalized = str.replace(/[-_\s]+/g, ' ').trim();
  return normalized
    .split(/(?=[A-Z])|\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

const CASE_SPICES: readonly SpiceDefinition[] = [
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

const CASE_DEFINITION: IngredientDefinition<CaseSpice> = {
  name: Symbol('Case'),
  category: CATEGORY_CONVERTERS,
  description: 'Converts text between various case formats (e.g., UPPER CASE, lower case, Title Case, camelCase).',
  spices: CASE_SPICES,
  run: (input: InputType, spices: CaseSpice): ResultType<string> => {
    const text = input.cast('string').getValue();
    if (!text) {
      return null;
    }

    let convertedText = '';

    switch (spices.conversionType) {
      case 'upperCase':
        convertedText = text.toUpperCase();
        break;
      case 'lowerCase':
        convertedText = text.toLowerCase();
        break;
      case 'titleCase':
        convertedText = splitIntoWords(text)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        break;
      case 'camelCase': {
        const words = splitIntoWords(text);
        convertedText = words.map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))).join('');
        break;
      }
      case 'pascalCase':
        convertedText = splitIntoWords(text)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        break;
      case 'snakeCase':
        convertedText = splitIntoWords(text).join('_');
        break;
      case 'kebabCase':
        convertedText = splitIntoWords(text).join('-');
        break;
      case 'constantCase':
        convertedText = splitIntoWords(text).join('_').toUpperCase();
        break;
      case 'customCase':
        const delimiter = spices.customDelimiter || '';
        convertedText = text.split(/\s+/).join(delimiter);
        break;
      default:
        convertedText = text;
    }

    return input.update(convertedText);
  },
};

Baratie.ingredient.registerIngredient(CASE_DEFINITION);
