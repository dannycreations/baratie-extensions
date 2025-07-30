import { CATEGORY_HASHER } from '../../core/constants';
import { tryHash } from '../../structures/crypto';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface MdSpice {
  readonly algorithm: 'md2' | 'md4' | 'md5' | 'md6';
  readonly rounds?: number;
  readonly size?: number;
  readonly levels?: number;
  readonly key?: string;
}

const mdSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'algorithm',
    label: 'Algorithm',
    type: 'select',
    value: 'md5',
    options: [
      { label: 'MD2', value: 'md2' },
      { label: 'MD4', value: 'md4' },
      { label: 'MD5', value: 'md5' },
      { label: 'MD6', value: 'md6' },
    ],
  },
  {
    id: 'rounds',
    label: 'Rounds',
    type: 'number',
    value: 18,
    min: 1,
    dependsOn: [{ spiceId: 'algorithm', value: 'md2' }],
  },
  {
    id: 'size',
    label: 'Size',
    type: 'number',
    value: 256,
    min: 1,
    max: 512,
    dependsOn: [{ spiceId: 'algorithm', value: 'md6' }],
  },
  {
    id: 'levels',
    label: 'Levels',
    type: 'number',
    value: 64,
    min: 1,
    dependsOn: [{ spiceId: 'algorithm', value: 'md6' }],
  },
  {
    id: 'key',
    label: 'Key',
    type: 'string',
    value: '',
    dependsOn: [{ spiceId: 'algorithm', value: 'md6' }],
  },
];

const mdDefinition: IngredientDefinition<MdSpice> = {
  name: 'MD',
  category: CATEGORY_HASHER,
  description: 'Calculates the message digest (hash) of the input using various algorithms.',
  spices: mdSpices,
  run: async (input, spices) => {
    const inputValue = input.cast('string').value;
    if (!inputValue.trim()) {
      return input.warning();
    }

    // Prepare options for the tryHash function, ensuring correct types and conditional inclusion.
    const hashOptions: {
      rounds?: number;
      size?: number;
      levels?: number;
      key?: Uint8Array;
    } = {};

    if (spices.rounds !== undefined) {
      hashOptions.rounds = spices.rounds;
    }
    if (spices.size !== undefined) {
      hashOptions.size = spices.size;
    }
    if (spices.levels !== undefined) {
      hashOptions.levels = spices.levels;
    }
    // Encode the key to Uint8Array if provided.
    if (spices.key !== undefined && spices.key.length > 0) {
      hashOptions.key = new TextEncoder().encode(spices.key);
    }

    const result = tryHash(spices.algorithm, inputValue, hashOptions);
    return input.update(result).cast('hex');
  },
};

Baratie.ingredient.registerIngredient(mdDefinition);
