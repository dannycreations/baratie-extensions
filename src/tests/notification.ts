import { CATEGORY_API_TESTS } from '../core/constants';

import type { IngredientDefinition, InputType, NotificationType, ResultType, SpiceDefinition } from 'baratie';

interface NotifyTestSpice {
  readonly action: 'show' | 'clear_all';
  readonly message: string;
  readonly type: NotificationType;
  readonly title: string;
}

const NOTIFY_TEST_SPICES: readonly SpiceDefinition[] = [
  {
    id: 'action',
    label: 'Action',
    type: 'select',
    value: 'show',
    options: [
      { label: 'Show Notification', value: 'show' },
      { label: 'Clear All Notifications', value: 'clear_all' },
    ],
  },
  {
    id: 'message',
    label: 'Message',
    type: 'string',
    value: 'This is a test notification.',
    dependsOn: [{ spiceId: 'action', value: 'show' }],
  },
  {
    id: 'type',
    label: 'Type',
    type: 'select',
    value: 'info',
    options: [
      { label: 'Info', value: 'info' },
      { label: 'Success', value: 'success' },
      { label: 'Warning', value: 'warning' },
      { label: 'Error', value: 'error' },
    ],
    dependsOn: [{ spiceId: 'action', value: 'show' }],
  },
  {
    id: 'title',
    label: 'Title (Optional)',
    type: 'string',
    value: 'API Test',
    dependsOn: [{ spiceId: 'action', value: 'show' }],
  },
];

const NOTIFY_TEST_DEFINITION: IngredientDefinition<NotifyTestSpice> = {
  name: Symbol('Test: Notification Helper'),
  category: CATEGORY_API_TESTS,
  description: 'Tests the notification helper API.',
  spices: NOTIFY_TEST_SPICES,
  run: (input: InputType<unknown>, spices: NotifyTestSpice): ResultType<string> => {
    const { action, message, type, title } = spices;

    if (action === 'show') {
      Baratie.helpers.notification.show(message, type, title || undefined);
      return input.update(`Notification helper called with message: "${message}"`);
    }

    Baratie.helpers.notification.clear();
    return input.update('Cleared all notifications.');
  },
};

Baratie.ingredient.registerIngredient(NOTIFY_TEST_DEFINITION);
