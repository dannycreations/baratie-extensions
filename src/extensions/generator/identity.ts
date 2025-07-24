import { faker } from '@faker-js/faker';

import { CATEGORY_GENERATOR } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface IdentitySpice {
  readonly includeId: boolean;
  readonly includeAddress: boolean;
  readonly includePhone: boolean;
  readonly includeCountry: boolean;
  readonly includeEmail: boolean;
  readonly includeJobTitle: boolean;
  readonly includeCompany: boolean;
  readonly includeBirthday: boolean;
  readonly gender: 'male' | 'female' | 'other' | 'none';
}

const identitySpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'includeId',
    label: 'Include ID Number',
    type: 'boolean',
    value: true,
    description: 'If true, a random id number will be generated.',
  },
  {
    id: 'includeAddress',
    label: 'Include Address',
    type: 'boolean',
    value: true,
    description: 'If true, a random address will be generated.',
  },
  {
    id: 'includePhone',
    label: 'Include Phone Number',
    type: 'boolean',
    value: true,
    description: 'If true, a random phone number will be generated.',
  },
  {
    id: 'includeCountry',
    label: 'Include Country',
    type: 'boolean',
    value: true,
    description: 'If true, a random country will be generated.',
  },
  {
    id: 'includeEmail',
    label: 'Include Email Address',
    type: 'boolean',
    value: true,
    description: 'If true, a random email address will be generated.',
  },
  {
    id: 'includeJobTitle',
    label: 'Include Job Title',
    type: 'boolean',
    value: true,
    description: 'If true, a random job title will be generated.',
  },
  {
    id: 'includeCompany',
    label: 'Include Company',
    type: 'boolean',
    value: true,
    description: 'If true, a random company name will be generated.',
  },
  {
    id: 'includeBirthday',
    label: 'Include Birthday',
    type: 'boolean',
    value: true,
    description: 'If true, a random birthday will be generated.',
  },
  {
    id: 'gender',
    label: 'Gender',
    type: 'select',
    value: 'none',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ],
    description: 'Select a gender to influence name and other gender-specific data.',
  },
];

const identityDefinition: IngredientDefinition<IdentitySpice> = {
  name: 'Identity',
  category: CATEGORY_GENERATOR,
  description: 'Generates a random full fake name and optional identification, address, phone, and country.',
  spices: identitySpices,
  run: (input, spices) => {
    let firstName: string;
    let lastName: string;

    if (spices.gender === 'male') {
      firstName = faker.person.firstName('male');
      lastName = faker.person.lastName('male');
    } else if (spices.gender === 'female') {
      firstName = faker.person.firstName('female');
      lastName = faker.person.lastName('female');
    } else {
      firstName = faker.person.firstName();
      lastName = faker.person.lastName();
    }

    const generatedIdentity = [`Name: ${firstName} ${lastName}`];

    if (spices.includeId) {
      generatedIdentity.push(`ID: ${faker.string.numeric(9)}`);
    }
    if (spices.includeAddress) {
      generatedIdentity.push(
        `Address: ${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}, ${faker.location.zipCode()}`,
      );
    }
    if (spices.includePhone) {
      generatedIdentity.push(`Phone: ${faker.phone.number()}`);
    }
    if (spices.includeCountry) {
      generatedIdentity.push(`Country: ${faker.location.country()}`);
    }
    if (spices.includeEmail) {
      generatedIdentity.push(`Email: ${faker.internet.email({ firstName, lastName })}`);
    }
    if (spices.includeJobTitle) {
      generatedIdentity.push(`Job Title: ${faker.person.jobTitle()}`);
    }
    if (spices.includeCompany) {
      generatedIdentity.push(`Company: ${faker.company.name()}`);
    }
    if (spices.includeBirthday) {
      generatedIdentity.push(`Birthday: ${faker.date.birthdate().toLocaleDateString()}`);
    }

    return input.update(generatedIdentity.join('\n'));
  },
};

Baratie.ingredient.registerIngredient(identityDefinition);
