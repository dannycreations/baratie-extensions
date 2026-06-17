---
name: baratie-ingredient
description: Use this skill when authoring, registering, or debugging a Baratie ingredient. Covers the full IngredientDefinition contract, InputType API (cast, update, warning, render), SpiceDefinition types, conditional spice visibility via dependsOn, IngredientContext, and the registration call. Trigger on any task that involves writing or modifying a Baratie ingredient file.
---

# Baratie Ingredient Authoring

Every ingredient is a single `IngredientDefinition<T>` object passed to `Baratie.ingredient.register(...)`. The generic parameter `T` types the `spices` argument received by `run`.

```typescript
export interface IngredientDefinition<T = unknown> {
  readonly name: string; // Unique, user-facing label
  readonly category: string; // UI panel grouping
  readonly description: string; // Tooltip text
  readonly spices?: ReadonlyArray<SpiceDefinition>;
  readonly run: (input: InputType, spices: T, context: IngredientContext) => InputType | Promise<InputType>;
}
```

---

## The `run` Function

### `InputType` — input parameter

Never access `input.value` directly for processing. Use the cast API to coerce safely.

| Method                    | Purpose                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `input.value`             | Raw value — read-only, do not process without casting                                  |
| `input.update(newData)`   | Returns a new `InputType`; this is the standard return value                           |
| `input.warning(msg?)`     | Skips the ingredient, marks it with a warning UI state, passes input through unchanged |
| `input.cast(type, opts?)` | Returns a new `InputType` with value coerced to `type`; throws on failure              |
| `input.render(config)`    | Returns a `InputType` that drives a custom React panel (see Rendering)                 |

**Cast types:**

| Type            | Options                  | Notes                                                  |
| --------------- | ------------------------ | ------------------------------------------------------ |
| `'string'`      | —                        | Objects are JSON-stringified                           |
| `'number'`      | `{ min?, max?, value? }` | `value` is the fallback default                        |
| `'boolean'`     | `{ value? }`             | `"true"`, `1` → `true`; `"false"`, `0`, `""` → `false` |
| `'array'`       | `{ value? }`             | Parses JSON string to array                            |
| `'object'`      | `{ value? }`             | Parses JSON string to object                           |
| `'bytearray'`   | —                        | Hex / Base64 / UTF-8 → `Uint8Array`                    |
| `'arraybuffer'` | —                        | → `ArrayBuffer`                                        |
| `'hex'`         | —                        | → hex string                                           |
| `'base64'`      | —                        | → Base64 string                                        |

```typescript
// Correct patterns
const text = input.cast('string').value;
const count = input.cast('number', { value: 0 }).value;
const parsed = input.cast('array').value;
```

### `IngredientContext` — context parameter

| Property       | Type                            | Description                                              |
| -------------- | ------------------------------- | -------------------------------------------------------- |
| `ingredient`   | `IngredientItem`                | Current instance, including `.id` and resolved `.spices` |
| `currentIndex` | `number`                        | Zero-based position in the recipe array                  |
| `recipe`       | `ReadonlyArray<IngredientItem>` | Full recipe at time of execution                         |
| `initialInput` | `string`                        | Unmodified content of the Input panel at cook start      |

### `spices` parameter

Typed by `T`. Each spice's `id` becomes a key. Always define a matching interface:

```typescript
interface MySpices {
  readonly mode: string;
  readonly threshold: number;
}
```

---

## Configuring Ingredients with Spices

```typescript
export interface SpiceDefinition {
  id: string;
  label: string;
  description: string;
  value: unknown; // Default value
  type: SpiceType;
  // type-specific extras below
}
```

**Spice types:**

| `type`       | Extra properties                                    |
| ------------ | --------------------------------------------------- |
| `'string'`   | —                                                   |
| `'textarea'` | —                                                   |
| `'number'`   | `min?`, `max?`, `step?`                             |
| `'boolean'`  | —                                                   |
| `'select'`   | `options: Array<{ label: string; value: unknown }>` |

### Conditional visibility — `dependsOn`

A spice is visible only when **all** rules in `dependsOn` evaluate to `true` (AND logic). A rule's `value` can be a scalar or an array (OR within that rule).

```typescript
const spices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'deliveryMethod',
    type: 'select',
    label: 'Delivery Method',
    value: 'email',
    options: [
      { label: 'Email', value: 'email' },
      { label: 'SMS', value: 'sms' },
      { label: 'Push', value: 'push' },
    ],
  },
  {
    id: 'emailAddress',
    type: 'string',
    label: 'Recipient Email',
    value: 'test@example.com',
    dependsOn: [{ spiceId: 'deliveryMethod', value: 'email' }],
  },
  {
    id: 'addSound',
    type: 'boolean',
    label: 'Play Sound',
    value: true,
    // Array value = OR: visible for 'push' OR 'sms'
    dependsOn: [{ spiceId: 'deliveryMethod', value: ['push', 'sms'] }],
  },
  {
    id: 'soundFile',
    type: 'select',
    label: 'Sound',
    value: 'default.mp3',
    options: [
      { label: 'Default', value: 'default.mp3' },
      { label: 'Tritone', value: 'tritone.mp3' },
    ],
    // Chained AND: both conditions must be true
    dependsOn: [
      { spiceId: 'deliveryMethod', value: 'push' },
      { spiceId: 'addSound', value: true },
    ],
  },
];
```

---

## Rendering Custom Panels

Call `.render(config)` on the `InputType` you are about to return. It replaces the specified panel with a React component.

```typescript
return input.render({
  panelType: 'output',                    // 'input' | 'output'
  providerId: context.ingredient.id,      // Required — identifies the controlling ingredient
  title: () => 'Custom View',
  content: () => <MyComponent inputValue={input.value} />,
  actions: (defaultActions) => [
    <button onClick={() => alert('!')}>My Action</button>,
    ...defaultActions,
  ],
});
```

Access the current theme inside your component via `Baratie.helpers.theme.get()`. The returned object exposes all theme color tokens (e.g., `theme.surfaceTertiary`, `theme.contentPrimary`, `theme.infoFg`).

---

## Error Handling

- **Throw** an `Error` to halt the recipe and surface the message to the user.
- **Wrap** any fallible async operation in `Baratie.error.attemptAsync(fn, label)`. It returns `{ result, error }` — never throws.
- **Return** `input.warning(msg?)` for no-ops or intentionally skipped execution; do not throw.

```typescript
const { result, error } = await Baratie.error.attemptAsync(async () => {
  return await someExternalCall();
}, 'Descriptive Label');

if (error) return input.update(`Error: ${error.message}`);
return input.update(result);
```

---

## Complete Example — Gemini Prompt

```typescript
import { GoogleGenAI } from '@google/genai';

import { CATEGORY_AI } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface GeminiPromptSpice {
  readonly model: string;
  readonly systemInstruction: string;
}

const geminiPromptSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'model',
    label: 'Model',
    type: 'select',
    value: 'gemini-2.5-flash',
    options: [{ label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' }],
  },
  {
    id: 'systemInstruction',
    label: 'System Instruction',
    type: 'textarea',
    value: 'You are a helpful assistant.',
    placeholder: 'Describe how the AI should behave.',
  },
];

const geminiPromptDefinition: IngredientDefinition<GeminiPromptSpice> = {
  name: 'Gemini Prompt',
  category: CATEGORY_AI,
  description: 'Sends input text to a Google Gemini model and returns the response.',
  spices: geminiPromptSpices,
  run: async (input, spices) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error('API_KEY environment variable not set.');

    const prompt = input.cast('string').value;
    if (!prompt.trim()) return input.warning('Input prompt is empty.');

    const { result: response, error } = await Baratie.error.attemptAsync(async () => {
      const ai = new GoogleGenAI({ apiKey });
      return await ai.models.generateContent({
        model: spices.model,
        contents: prompt,
        config: { systemInstruction: spices.systemInstruction },
      });
    }, 'Gemini API Call');

    if (error) return input.update(`Gemini API Error: ${error.message}`);
    return input.update(response.text);
  },
};

Baratie.ingredient.register(geminiPromptDefinition);
```

---

## Mandatory Rules

**Always:**

- Keep `run` pure and stateless.
- One responsibility per ingredient.
- Use `input.cast()` before processing; never assume the input type.
- Use `input.update(newData)` to construct return values.
- Use `Baratie.error.attemptAsync` for any operation that can fail.
- Return `input.warning()` for deliberate skips.
- Throw `Error` objects to signal failures that should halt execution.
- Provide sensible default `value` for every spice.

**Never:**

- Store state in the ingredient closure; each `run` invocation must be independent.
- Access `window`, `localStorage`, or `sessionStorage` for state.
- Mutate the `input` or `context` objects.
- Build deeply chained `dependsOn` trees; split into separate spice groups if logic becomes convoluted.
