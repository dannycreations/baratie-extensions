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
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
