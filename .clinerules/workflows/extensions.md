# Creating Baratie Ingredients: A Comprehensive Guide

Welcome, culinary coder! This guide will walk you through the process of creating your own custom "ingredients" for the Baratie framework. Ingredients are the heart of Baratie, allowing you to build powerful, reusable data processing recipes.

## 1. What is an Ingredient?

In Baratie, an **Ingredient** is a self-contained, reusable unit of logic that performs a single, well-defined operation on data. Think of it as one step in a cooking recipe: it takes some input, processes it according to its own instructions (and user-configured "spices"), and produces an output for the next step.

An ingredient can:

- Transform data (e.g., encode, encrypt, format).
- Fetch data from external sources.
- Control the flow of a recipe.
- Interact with the main UI panels (Input and Output).

## 2. The Anatomy of an Ingredient

Every ingredient is defined by an `IngredientDefinition` object. Let's break down its structure:

```typescript
// All ingredients are defined using this interface.
// This type is available to your extension via the Baratie global API.
export interface IngredientDefinition<T = unknown> {
  // A user-facing name for the ingredient. Should be unique and descriptive.
  readonly name: string;

  // The category for organizing the ingredient in the UI panel.
  readonly category: string;

  // A helpful description that appears as a tooltip in the UI.
  readonly description: string;

  // An optional array of user-configurable parameters, or "Spices".
  readonly spices?: ReadonlyArray<SpiceDefinition>;

  // The core logic of the ingredient. It can be synchronous or asynchronous.
  readonly run: (input: InputType, spices: T, context: IngredientContext) => InputType | Promise<InputType>;
}
```

---

## 3. The `run` Function: The Core Logic

The `run` function is where your ingredient's magic happens. It's called when the recipe is "cooked".

`run(input, spices, context)`

### a. Input (`input: InputType`)

The `input` parameter is an `InputType` object that wraps the output from the _previous_ ingredient in the recipe. For the first ingredient, it contains the raw data from the main "Input" panel.

`InputType` is a robust wrapper that helps you safely handle and convert data.

- **Getting the value:** `input.value` returns the raw value.
- **Updating the value:** `input.update(newData)` creates a _new_ `InputType` instance with the new data. This is the primary way you will create your return value.
- **Casting data:** The most powerful feature is casting. `InputType` can intelligently convert its value to the type you need. If a cast fails, it will throw an error that the Baratie kitchen can handle.

```typescript
// Example: Safely get a number, defaulting to 0 if input is invalid
const count = input.cast('number', { value: 0 }).value;

// Example: Get a string representation of any input
const text = input.cast('string').value;

// Example: Parse a JSON string into an array
// This will throw if the input is not a valid JSON array string.
try {
  const list = input.cast('array').value;
  console.log('We have an array!', list);
} catch (e) {
  console.error('Input was not a valid array.');
}
```

**Available Casts:**

- `cast('string')`: Converts the input to a string. Objects are stringified.
- `cast('number', { min?, max?, value? })`: Converts to a number. `value` is the default if casting fails.
- `cast('boolean', { value? })`: Converts to a boolean (`"true"`, `1` -> `true`; `"false"`, `0`, `""` -> `false`).
- `cast('array', { value? })`: Parses a JSON string into an array.
- `cast('object', { value? })`: Parses a JSON string into an object.
- `cast('bytearray', { value? })`: Converts a Base64 string into a `Uint8Array`.
- `cast('arraybuffer', { value? })`: Converts a Base64 string or `Uint8Array` into an `ArrayBuffer`.

### b. Spices (`spices: T`)

This object contains the user-configured values for the spices you defined in the `spices` array of your `IngredientDefinition`. The `id` of each spice becomes a key in this object.

```typescript
// If you define a spice with `id: 'delimiter'`, you access it like this:
const userDelimiter = spices.delimiter;
```

### c. Context (`context: IngredientContext`)

The `context` object provides situational awareness about the recipe's execution.

- `ingredient: IngredientItem`: The current instance of your ingredient as it exists in the recipe, including its unique instance `id` and its fully resolved `spices`.
- `currentIndex: number`: The zero-based index of this ingredient in the recipe array.
- `recipe: ReadonlyArray<IngredientItem>`: The entire array of ingredients currently in the recipe panel. This is useful for advanced ingredients that need to look at other steps.
- `initialInput: string`: The original, unmodified content of the main "Input" panel at the start of the cook.

---

## 4. Configuring Ingredients with "Spices"

Spices are what make your ingredients configurable and powerful. They are defined in the optional `spices` array of your `IngredientDefinition`.

### a. The `SpiceDefinition` Structure

Each spice object has a `type` and several other properties depending on that type.

**Common Properties:**

- `id: string`: A unique key for the spice. This becomes the property name in the `spices` object.
- `label: string`: The user-facing label for the form field.
- `description: string`: A helpful tooltip for the user.
- `value`: The default value for the spice.

### b. Spice Types

#### `string` & `textarea`

For single-line and multi-line text input.

```typescript
{
  id: 'prefix',
  label: 'Text Prefix',
  type: 'string',
  value: 'INFO: ',
  placeholder: 'Enter text to add to the start'
},
{
  id: 'notes',
  label: 'Notes',
  type: 'textarea',
  value: '',
  placeholder: 'Enter multi-line notes here...'
}
```

#### `number`

For numeric input, with optional constraints.

```typescript
{
  id: 'timeout',
  label: 'Timeout (ms)',
  type: 'number',
  value: 5000,
  min: 100,
  max: 60000,
  step: 100
}
```

#### `boolean`

A simple true/false toggle switch.

```typescript
{
  id: 'useStrict',
  label: 'Enable Strict Mode',
  type: 'boolean',
  value: true
}
```

#### `select`

A dropdown menu for a predefined set of choices.

```typescript
{
  id: 'algorithm',
  label: 'Encryption Algorithm',
  type: 'select',
  value: 'aes-256', // Default value must match one of the option values
  options: [
    { label: 'AES 256', value: 'aes-256' },
    { label: 'AES 128', value: 'aes-128' },
    { label: 'Blowfish', value: 'blowfish' }
  ]
}
```

### c. Advanced: Conditional Spices

You can show or hide spices based on the values of other spices using the `dependsOn` property.

```typescript
// An array of spices where one depends on another.
const exampleSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'enableAuth',
    label: 'Enable Authentication',
    type: 'boolean',
    value: false,
  },
  {
    id: 'apiKey',
    label: 'API Key',
    type: 'string',
    value: '',
    placeholder: 'Enter your API key',
    dependsOn: [
      {
        spiceId: 'enableAuth',
        // This spice will only be visible if 'enableAuth' is true.
        value: true,
        // This spice will only be visible if 'enableAuth' is true or false.
        value: [true, false],
      },
    ],
  },
];
```

---

## 5. Controlling the Kitchen: Ingredient Outputs

The `InputType` object you return becomes the `input` for the next ingredient.

```typescript
run: (input, spices, context) => {
  const text = input.cast('string').value;
  if (!text.trim()) {
    // This signify that ingredient has no output and should be skipped. The data flow is not interrupted; the next ingredient simply receives the same `input` that the current one did. This is useful for ingredients that only have side effects or act as filters. The ingredient's status in the UI will be marked as a "warning".
    return input.warning();
  }

  const reversedText = text.split('').reverse().join('');

  // Use the `update` method on the existing input object to create a new one.
  return input.update(reversedText);
};
```

---

## 6. Asynchronous Ingredients

Your `run` function can be `async` and return a `Promise`. This is essential for tasks like fetching data from external APIs.

```typescript
// An ingredient that fetches content from a URL specified in its spices.
const fetchIngredient = {
  name: 'Fetch URL',
  category: 'Network',
  description: 'Fetches content from a given URL.',
  spices: [{ id: 'url', type: 'string', label: 'URL', value: 'https://api.example.com/data' }],
  run: async (input, spices) => {
    // Use the framework's built-in error handler for robust async operations
    const { result, error } = await Baratie.error.attemptAsync(async () => {
      const response = await fetch(spices.url);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.text();
    });

    if (error) {
      // The error handler will have already shown a notification.
      // We can re-throw to stop the recipe or return an error message.
      return input.update(`Error fetching URL: ${error.message}`);
    }

    return input.update(result);
  },
};
```

---

## 7. A Complex Example: "Gemini Prompt" Ingredient

Let's build a sophisticated ingredient that uses the Gemini API. This example assumes `@google/genai` has been loaded by another extension or is available globally.

```typescript
import { CATEGORY_WEB } from '../../core/constants';

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
  category: CATEGORY_WEB,
  description: 'Sends the input text to a Google Gemini model and returns the response.',
  spices: geminiPromptSpices,
  run: async (input, spices) => {
    // 1. Get API Key from environment (A hard requirement for the framework)
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY environment variable not set.');
    }

    // 2. Get prompt text from input
    const prompt = input.cast('string').value;
    if (!prompt.trim()) {
      // Skip if there's no prompt
      return null;
    }

    // 3. Use error handler for the API call
    const { result: response, error } = await Baratie.error.attemptAsync(async () => {
      // This assumes `GoogleGenAI` has been loaded and is available on `window`
      const ai = new window.GoogleGenAI({ apiKey });
      return await ai.models.generateContent({
        model: spices.model,
        contents: prompt,
        config: {
          systemInstruction: spices.systemInstruction,
        },
      });
    }, 'Gemini API Call');

    if (error) {
      return input.update(`Gemini API Error: ${error.message}`);
    }

    // 4. Return the result in a new InputType
    return input.update(response.text);
  },
};

Baratie.ingredient.registerIngredient(geminiPromptDefinition);
```

---

## 8: Import the New Extension

Open `src/index.ts` and add an import statement for your new extension file. This ensures that your extension is loaded when the application starts.

```typescript
import './extensions/web/geminiPromptDefinition';
```

---

## 9. Allowed and Prohibited Practices

Follow these rules to create high-quality, stable ingredients.

#### Allowed Practices (Do's)

- **DO** keep ingredients focused on a single responsibility. An ingredient to "Format JSON" should not also "Upload to S3".
- **DO** use descriptive names, categories, and descriptions. This is crucial for user experience.
- **DO** provide sensible default values for all your spices.
- **DO** throw `Error` objects to signal a failure that should halt the recipe.
- **DO** use `Baratie.error.attemptAsync` for any operation that might fail, especially network requests.
- **DO** return `null` when your ingredient performs a no-op or is intentionally skipped. This marks its status as "warning" in the UI.
- **DO** use the `input.update(newData)` method to create your return `InputType` object.
- **DO** make your ingredient's logic pure and stateless. All state should come from `input` and `spices`.

#### Prohibited Practices (Don'ts)

- **DO NOT** store state within your ingredient's closure. Each `run` call should be independent.
- **DO NOT** assume the `input` type. Always use `input.cast()` to safely get the data format you expect.
- **DO NOT** access global objects like `window`, `localStorage`, or `sessionStorage` for storing state. This can lead to conflicts and instability. All state should be managed via the recipe's data flow.
- **DO NOT** mutate the `input` or `context` objects passed to your `run` function. They should be treated as immutable. Use `input.update()` to return new data.
- **DO NOT** create overly complex `dependsOn` chains. If a component's options are too convoluted, it might be a sign that it should be broken into multiple spices.
