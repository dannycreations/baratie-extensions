import { v1, v3, v4, v5, v6, v7, validate } from 'uuid';

import { CATEGORY_GENERATOR } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface UuidSpice {
  readonly version: 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7';
  readonly namespace: string;
}

const uuidSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'version',
    label: 'UUID Version',
    type: 'select',
    value: 'v4',
    options: [
      { label: 'Version 1 (Time-based)', value: 'v1' },
      { label: 'Version 3 (Name-based)', value: 'v3' },
      { label: 'Version 4 (Random)', value: 'v4' },
      { label: 'Version 5 (Name-based)', value: 'v5' },
      { label: 'Version 6 (Time-based)', value: 'v6' },
      { label: 'Version 7 (Time-based)', value: 'v7' },
    ],
    description: 'Choose the version of UUID to generate.',
  },
  {
    id: 'namespace',
    label: 'Namespace',
    type: 'string',
    value: '00000000-0000-0000-0000-000000000000',
    placeholder: 'Enter a valid UUID namespace (e.g., a URL, OID, X.500 DN)',
    description: 'A UUID namespace for name-based UUIDs (v3 and v5).',
    dependsOn: [{ spiceId: 'version', value: ['v3', 'v5'] }],
  },
];

const uuidDefinition: IngredientDefinition<UuidSpice> = {
  name: 'UUID',
  category: CATEGORY_GENERATOR,
  description: 'Generates Universally Unique Identifiers (UUIDs).',
  spices: uuidSpices,
  run: (input, spices) => {
    const name = input.cast('string').getValue();

    let result: string;
    switch (spices.version) {
      case 'v1':
        result = v1();
        break;
      case 'v3':
      case 'v5': {
        if (validate(spices.namespace)) {
          if (spices.version === 'v3') {
            result = v3(name, spices.namespace);
          } else {
            result = v5(name, spices.namespace);
          }
        } else {
          result = 'Error: Invalid namespace for v3/v5 UUID.';
        }
        break;
      }
      case 'v6':
        result = v6();
        break;
      case 'v7':
        result = v7();
        break;
      case 'v4':
      default:
        result = v4();
    }

    return input.update(result);
  },
};

Baratie.ingredient.registerIngredient(uuidDefinition);
