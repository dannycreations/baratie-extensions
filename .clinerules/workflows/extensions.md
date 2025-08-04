# Creating Baratie Ingredients: A Comprehensive Guide

Welcome, culinary coder! This guide will walk you through the process of creating your own custom "ingredients" for the Baratie framework. Ingredients are the heart of Baratie, allowing you to build powerful, reusable data processing recipes.

## 1. The Ingredient Definition

Every ingredient is defined by an `IngredientDefinition` object.

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

## 2. The `run` Function: The Core Logic

The `run` function is where your ingredient's magic happens. It's called when the recipe is "cooked".

`run(input, spices, context)`

### a. Input (`input: InputType`)

The `input` parameter is an `InputType` object that wraps the output from the _previous_ ingredient in the recipe. For the first ingredient, it contains the raw data from the main "Input" panel.

`InputType` is a robust wrapper that helps you safely handle and convert data.

- **Getting the value:** `input.value` returns the raw value.
- **Updating the value:** `input.update(newData)` creates a _new_ `InputType` instance with the new data. This is the primary way you will create your return value.
- **Skipping Execution:** To skip an ingredient (e.g., if a condition isn't met), return `input.warning()`. This marks the ingredient with a "warning" status in the UI and passes the original input to the next ingredient. You can optionally provide a message: `input.warning('Condition not met.')`.
- **Casting data:** The most powerful feature is casting. `InputType` can intelligently convert its value to the type you need. If a cast fails, it will throw an error that the Baratie kitchen can handle.

```typescript
// Example: Safely get a number, defaulting to 0 if input is invalid
const count = input.cast('number', { value: 0 }).value;

// Example: Get a string representation of any input
const text = input.cast('string').value;
```

**Available Casts:**

- `cast('string')`: Converts the input to a string. Objects are stringified.
- `cast('number', { min?, max?, value? })`: Converts to a number. `value` is the default if casting fails.
- `cast('boolean', { value? })`: Converts to a boolean (`"true"`, `1` -> `true`; `"false"`, `0`, `""` -> `false`).
- `cast('array', { value? })`: Parses a JSON string into an array.
- `cast('object', { value? })`: Parses a JSON string into an object.
- `cast('bytearray')`: Converts Hex/Base64/UTF8 string to `Uint8Array`.
- `cast('arraybuffer')`: Converts input to an `ArrayBuffer`.
- `cast('hex')`: Converts input to a hex string.
- `cast('base64')`: Converts input to a Base64 string.

### b. Spices (`spices: T`)

This object contains the user-configured values for the spices you defined in the `spices` array of your `IngredientDefinition`. The `id` of each spice becomes a key in this object.

### c. Context (`context: IngredientContext`)

The `context` object provides situational awareness about the recipe's execution.

- `ingredient: IngredientItem`: The current instance of your ingredient as it exists in the recipe, including its unique instance `id` and its fully resolved `spices`.
- `currentIndex: number`: The zero-based index of this ingredient in the recipe array.
- `recipe: ReadonlyArray<IngredientItem>`: The entire array of ingredients currently in the recipe panel.
- `initialInput: string`: The original, unmodified content of the main "Input" panel at the start of the cook.

### d. Controlling UI Panels

Your ingredient can take control of the Input or Output panels. This is useful for creating custom user interfaces for complex options or for displaying results in a special format.

The primary way to do this is by calling the `.render()` method on the `InputType` object you are about to return. This method allows you to define a fully custom React component to be displayed in either the `input` or `output` panel.

```typescript
// Inside the run function, to show a custom component in the Output panel:
// Assume `React` and the `AppTheme` type are available in your extension's scope.

const MyCustomComponent = ({ inputValue }) => {
  const theme = Baratie.helpers.theme.get();
  // You can use hooks and other React features here.
  // The `theme` object gives you access to all the current theme's colors.
  return (
    <div className={`p-4 rounded-lg bg-${theme.surfaceTertiary} text-${theme.contentPrimary}`}>
      <h3 className={`font-bold text-${theme.infoFg}`}>Custom Output</h3>
      <p>This is a custom React component styled with the current theme.</p>
      <p>The input was: {inputValue}</p>
    </div>
  );
};

// Note: we're calling .render() on the input object
return input.render({
  panelType: 'output',
  // Important: identifies which ingredient is controlling the panel
  providerId: context.ingredient.id,
  title: () => 'Custom View',
  content: () => <MyCustomComponent inputValue={input.value} />,
  actions: (defaultActions) => {
    // You can optionally add, remove, or modify the default header buttons
    const myCustomButton = <button onClick={() => alert('Clicked!')}>Custom Action</button>;
    return [myCustomButton, ...defaultActions];
  },
});
```

---

## 3. Configuring Ingredients with "Spices"

Spices are what make your ingredients configurable and powerful. They are defined in the optional `spices` array of your `IngredientDefinition`.

### a. The `SpiceDefinition` Structure

Each spice object has a `type` and several other properties depending on that type.

- `id: string`: A unique key for the spice.
- `label: string`: The user-facing label for the form field.
- `description: string`: A helpful tooltip for the user.
- `value`: The default value for the spice.

### b. Spice Types

- **`string` & `textarea`**: For single-line and multi-line text input.
- **`number`**: For numeric input, with optional `min`, `max`, and `step`.
- **`boolean`**: A simple true/false toggle switch.
- **`select`**: A dropdown menu. Requires an `options` array: `[{ label: 'AES 256', value: 'aes-256' }]`.

### c. Advanced: Conditional Spices (`dependsOn`)

You can show or hide spices based on the values of other spices using the `dependsOn` property. This property takes an array of rules, all of which must be true (AND logic) for the spice to be visible.

```typescript
const notificationSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'deliveryMethod',
    label: 'Delivery Method',
    type: 'select',
    value: 'email',
    options: [
      { label: 'Email', value: 'email' },
      { label: 'SMS', value: 'sms' },
      { label: 'Push Notification', value: 'push' },
    ],
  },
  {
    id: 'emailAddress',
    label: 'Recipient Email',
    type: 'string',
    value: 'test@example.com',
    // Only show this spice if 'deliveryMethod' is 'email'
    dependsOn: [{ spiceId: 'deliveryMethod', value: 'email' }],
  },
  {
    id: 'addSound',
    label: 'Play Sound',
    type: 'boolean',
    value: true,
    // Show this for 'push' notifications or 'sms'
    dependsOn: [{ spiceId: 'deliveryMethod', value: ['push', 'sms'] }],
  },
  {
    id: 'soundFile',
    label: 'Sound',
    type: 'select',
    value: 'default.mp3',
    options: [
      { label: 'Default', value: 'default.mp3' },
      { label: 'Tritone', value: 'tritone.mp3' },
    ],
    // This demonstrates a chained dependency. It depends on TWO conditions.
    dependsOn: [
      { spiceId: 'deliveryMethod', value: 'push' },
      { spiceId: 'addSound', value: true },
    ],
  },
];
```

---

## 4. Complete Example: "Gemini Prompt" Ingredient

This example uses the Gemini API. It assumes the `@google/genai` library is available in the environment.

```typescript
import { GoogleGenAI } from '@google/genai';

import { CATEGORY_AI } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

// --- Type definition for our spices for better type safety ---
interface GeminiPromptSpice {
  readonly model: string;
  readonly systemInstruction: string;
}

// --- Spice Definitions ---
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

// --- Ingredient Definition ---
const geminiPromptDefinition: IngredientDefinition<GeminiPromptSpice> = {
  name: 'Gemini Prompt',
  category: CATEGORY_AI,
  description: 'Sends the input text to a Google Gemini model and returns the response.',
  spices: geminiPromptSpices,
  run: async (input, spices) => {
    // 1. API Key is handled by the environment, a core requirement of the framework.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // This error will be caught by the kitchen and displayed to the user.
      throw new Error('API_KEY environment variable not set. Please configure it to use this ingredient.');
    }

    // 2. Get prompt text from input.
    const prompt = input.cast('string').value;
    if (!prompt.trim()) {
      // If there's no prompt, skip execution and show a warning in the UI.
      return input.warning('Input prompt is empty.');
    }

    // 3. Use the framework's error handler for the API call for graceful failure.
    const { result: response, error } = await Baratie.error.attemptAsync(async () => {
      const ai = new GoogleGenAI({ apiKey });
      return await ai.models.generateContent({
        model: spices.model,
        contents: prompt,
        config: {
          systemInstruction: spices.systemInstruction,
        },
      });
    }, 'Gemini API Call');

    if (error) {
      // The error handler shows a notification. We can also return the error message in the output panel.
      return input.update(`Gemini API Error: ${error.message}`);
    }

    // 4. Extract text and return the result in a new InputType.
    const textResult = response.text;
    return input.update(textResult);
  },
};

// --- Register the ingredient with the framework ---
Baratie.ingredient.register(geminiPromptDefinition);
```

---

## 5. Best Practices (Do's and Don'ts)

#### Allowed Practices (Do's)

- **DO** keep ingredients focused on a single responsibility.
- **DO** use descriptive names, categories, and descriptions.
- **DO** provide sensible default values for all your spices.
- **DO** throw `Error` objects to signal a failure that should halt the recipe.
- **DO** use `Baratie.error.attemptAsync` for any operation that might fail.
- **DO** return `input.warning()` when your ingredient performs a no-op or is intentionally skipped.
- **DO** use the `input.update(newData)` method to create your return `InputType` object.
- **DO** make your ingredient's logic pure and stateless.

#### Prohibited Practices (Don'ts)

- **DO NOT** store state within your ingredient's closure. Each `run` call should be independent.
- **DO NOT** assume the `input` type. Always use `input.cast()` to safely get the data format you expect.
- **DO NOT** access global objects like `window`, `localStorage`, or `sessionStorage` for storing state.
- **DO NOT** mutate the `input` or `context` objects passed to your `run` function.
- **DO NOT** create overly complex `dependsOn` chains. If options are too convoluted, consider breaking them into multiple variable category of spices.
