import { CATEGORY_FORMATTER } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface SortSpice {
  readonly sortType?: 'alphabetical' | 'length' | 'numeric';
  readonly sortOrder?: 'ascending' | 'descending';
  readonly caseSensitive?: boolean;
  readonly removeDuplicates?: boolean;
}

const sortSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'sortType',
    label: 'Sort By',
    type: 'select',
    value: 'alphabetical',
    options: [
      { label: 'Alphabetical', value: 'alphabetical' },
      { label: 'Length', value: 'length' },
      { label: 'Numeric', value: 'numeric' },
    ],
    description: 'Determines how lines are sorted.',
  },
  {
    id: 'sortOrder',
    label: 'Order',
    type: 'select',
    value: 'ascending',
    options: [
      { label: 'Ascending', value: 'ascending' },
      { label: 'Descending', value: 'descending' },
    ],
    description: 'Determines the sort order.',
  },
  {
    id: 'caseSensitive',
    label: 'Case Sensitive',
    type: 'boolean',
    value: false,
    description: 'Perform a case-sensitive sort.',
  },
  {
    id: 'removeDuplicates',
    label: 'Remove Duplicates Before Sort',
    type: 'boolean',
    value: false,
    description: 'Remove duplicate lines before sorting.',
  },
];

function applySort(inputValue: string, spices: SortSpice): string {
  let lines = inputValue.split('\n');

  if (spices.removeDuplicates) {
    lines = Array.from(new Set(lines));
  }

  lines.sort((a: string, b: string): number => {
    let compareResult = 0;

    const valA = spices.caseSensitive ? a : a.toLowerCase();
    const valB = spices.caseSensitive ? b : b.toLowerCase();

    switch (spices.sortType) {
      case 'length':
        compareResult = valA.length - valB.length;
        break;
      case 'numeric':
        compareResult = parseFloat(valA) - parseFloat(valB);
        break;
      case 'alphabetical':
      default:
        compareResult = valA.localeCompare(valB);
        break;
    }

    return spices.sortOrder === 'descending' ? -compareResult : compareResult;
  });

  return lines.join('\n');
}

const sortDefinition: IngredientDefinition<SortSpice> = {
  name: 'Sort',
  category: CATEGORY_FORMATTER,
  description: 'Sorts text lines based on various criteria.',
  spices: sortSpices,
  run: (input, spices) => {
    const inputValue = input.cast('string').value;
    if (!inputValue.trim()) {
      return input.warning();
    }

    return input.update(applySort(inputValue, spices));
  },
};

Baratie.ingredient.register(sortDefinition);
