import { CATEGORY_GENERATOR } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface UuidSpice {
  readonly uuidVersion: 'v1' | 'v4';
}

const uuidSpices: readonly SpiceDefinition[] = [
  {
    id: 'uuidVersion',
    label: 'UUID Version',
    type: 'select',
    value: 'v4',
    options: [
      { label: 'Version 4 (Random)', value: 'v4' },
      { label: 'Version 1 (Time-based)', value: 'v1' },
    ],
    description: 'Choose the version of UUID to generate.',
  },
];

function generateUuidV1(): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error('Cryptographically secure random number generator not available.');
  }

  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const randomBytes = new Uint8Array(1);
    crypto.getRandomValues(randomBytes);
    const r = (dt + (randomBytes[0] % 16)) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function generateUuidV4(): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {
    throw new Error('Cryptographically secure random number generator not available.');
  }

  return crypto.randomUUID();
}

const uuidDefinition: IngredientDefinition<UuidSpice> = {
  name: 'UUID',
  category: CATEGORY_GENERATOR,
  description: 'Generates Universally Unique Identifiers (UUIDs).',
  spices: uuidSpices,
  run: (input, spices) => {
    let generatedUuid: string;
    if (spices.uuidVersion === 'v1') {
      generatedUuid = generateUuidV1();
    } else {
      generatedUuid = generateUuidV4();
    }
    return input.update(generatedUuid);
  },
};

Baratie.ingredient.registerIngredient(uuidDefinition);
