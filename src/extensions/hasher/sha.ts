import { CATEGORY_HASHER } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface ShaSpice {
  readonly algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
}

const shaSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'algorithm',
    label: 'Algorithm',
    type: 'select',
    value: 'SHA-256',
    options: [
      { label: 'SHA-1', value: 'SHA-1' },
      { label: 'SHA-256', value: 'SHA-256' },
      { label: 'SHA-384', value: 'SHA-384' },
      { label: 'SHA-512', value: 'SHA-512' },
    ],
  },
];

const shaDefinition: IngredientDefinition<ShaSpice> = {
  name: 'SHA',
  category: CATEGORY_HASHER,
  description: 'Calculates the message digest (hash) of the input using various algorithms.',
  spices: shaSpices,
  run: async (input, spices) => {
    const text = input.cast('string').value;
    if (!text.trim()) {
      return input.warning();
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const { result: hashBuffer, error } = await Baratie.error.attemptAsync(async () => {
      return await crypto.subtle.digest(spices.algorithm, data);
    }, `${spices.algorithm} Calculation`);

    if (error || !hashBuffer) {
      return input.update(`Error calculating digest: ${error ? error.message : 'An unknown error occurred'}`);
    }
    return input.update(new Uint8Array(hashBuffer)).cast('hex');
  },
};

Baratie.ingredient.register(shaDefinition);
