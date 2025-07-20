import { CATEGORY_API_TEST } from '../core/constants';

import type { IngredientDefinition, NotificationType, SpiceDefinition } from 'baratie';

interface NotificationSpice {
  readonly action: 'show' | 'clear';
  readonly message: string;
  readonly type: NotificationType;
  readonly title: string;
}

const notificationSpices: readonly SpiceDefinition[] = [
  {
    id: 'action',
    label: 'Action',
    type: 'select',
    value: 'show',
    options: [
      { label: 'Show Notification', value: 'show' },
      { label: 'Clear Notifications', value: 'clear' },
    ],
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
    id: 'message',
    label: 'Message',
    type: 'string',
    value: 'This is a test notification.',
    dependsOn: [{ spiceId: 'action', value: 'show' }],
  },
  {
    id: 'title',
    label: 'Title',
    type: 'string',
    value: 'API Test',
    dependsOn: [{ spiceId: 'action', value: 'show' }],
  },
];

const notificationDefinition: IngredientDefinition<NotificationSpice> = {
  name: Symbol('Test: Notification Helper'),
  category: CATEGORY_API_TEST,
  description: 'Tests the notification helper API.',
  spices: notificationSpices,
  run: (input, spices) => {
    if (spices.action === 'show') {
      Baratie.helpers.notification.show(spices.message, spices.type, spices.title);
      return input.update(`Notification helper called with message: "${spices.message}"`);
    }

    Baratie.helpers.notification.clear();
    return input.update('Cleared all notifications.');
  },
};

Baratie.ingredient.registerIngredient(notificationDefinition);
