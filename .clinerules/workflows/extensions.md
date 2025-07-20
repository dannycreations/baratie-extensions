# Cline Workflow: Adding New Baratie Extensions

This workflow outlines the steps to add a new extension (Ingredient) to the Baratie application, making it accessible within Cline.

## Workflow Steps

### Step 1: Create the Extension File

Create a new TypeScript file for your extension. It's recommended to organize extensions into logical categories (e.g., `formatter`, `generator`, `web`) within the `src/extensions/` directory.

**Example File Path:** `src/extensions/your_category/yourExtensionName.ts`

### Step 2: Define the Ingredient

Inside your new extension file, define an `IngredientDefinition`. This involves:

1.  **Imports**: Import `IngredientDefinition`, `InputType`, `ResultType`, `SpiceDefinition` from `baratie`, and any relevant `CATEGORY_` constants from `../../core/constants`.
2.  **Spice Interface (Optional but Recommended)**: Define an interface for your extension's spices (parameters), if any.
3.  **Spices Definition (Optional)**: Define an array of `SpiceDefinition` objects if your extension requires user input or configuration.
4.  **Ingredient Definition**: Create the `IngredientDefinition` object with the following properties:
    - `name`: A unique `symbol` that identifies your ingredient (e.g., `Symbol('YourExtensionName')`).
    - `category`: A `symbol` representing the category of your ingredient, imported from `../../core/constants` (e.g., `CATEGORY_CONVERTERS`).
    - `description`: A `string` providing a brief explanation of what your extension does.
    - `spices?`: An optional `readonly SpiceDefinition[]` array defining the input parameters for your extension. Each `SpiceDefinition` specifies a UI control (string, number, boolean, select, textarea) for user input.
    - `run`: The core logic of your extension, defined as an `IngredientRunner` function. This function takes `input: InputType<InType>`, `spices: T` (your custom spice interface), and `context: IngredientContext` as arguments, and must return a `ResultType<OutType>` or `Promise<ResultType<OutType>>`.

**Detailed Type Information:**

- **`SpiceDefinition`**: A union type that can be `StringSpice`, `TextareaSpice`, `NumberSpice`, `BooleanSpice`, or `SelectSpice`. Each spice type has common properties:
  - `id`: A unique `string` identifier for the spice.
  - `label`: A `string` displayed in the UI.
  - `type`: The `string` type of the UI control (`'string'`, `'number'`, `'boolean'`, `'select'`, `'textarea'`).
  - `value`: The default value for the spice.
  - `description?`: An optional `string` for a tooltip or help text.
  - `dependsOn?`: An optional `readonly SpiceDependency[]` to control visibility based on other spice values.
- **`IngredientRunner<T>`**:
  - `T`: The TypeScript interface for your custom spices (e.g., `YourExtensionSpice`).
  - `context`: Provides additional runtime information about the current ingredient and recipe execution.
  - **Important Note on Input Validation**: If your extension requires input to function and that input is missing or invalid (e.g., `input.cast('string').getValue()` returns `null` or an empty string), it is good practice to return `null` from the `run` function. This signals that the extension cannot produce a meaningful output without the necessary input, preventing errors or misleading results.

- **`ResultType<OutType>`**: The return type of the `run` function, which can be:
  - `InputType<OutType>`: To update the main input/output panel with a new value or error message.
  - `PanelControlSignal<OutType>`: To control specific UI panels (e.g., switch input mode).
  - `null`: If the extension doesn't produce an output for the main panel (e.g., due to missing input).

**Example Structure:**

```typescript
import { CATEGORY_YOUR_EXTENSION } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface YourExtensionSpice {
  readonly someParam: string;
  readonly someBoolean: boolean;
}

const yourExtensionSpices: readonly SpiceDefinition[] = [
  {
    id: 'someParam',
    label: 'Some Parameter',
    type: 'string',
    value: '',
    description: 'A string parameter for your extension.',
  },
  {
    id: 'someBoolean',
    label: 'Enable Feature',
    type: 'boolean',
    value: true,
    description: 'A boolean flag to enable/disable a feature.',
  },
];

const yourExtensionDefinition: IngredientDefinition<YourExtensionSpice> = {
  name: Symbol('Your Extension Name'),
  category: CATEGORY_YOUR_EXTENSION,
  description: 'A brief description of what this extension does.',
  spices: yourExtensionSpices,
  run: (input, spices, context) => {
    const inputValue = input.cast('string').getValue();

    let result = `Processed "${inputValue}" with param: ${spices.someParam}`;
    if (spices.someBoolean) {
      result += ' (Feature Enabled)';
    }

    return input.update(result);
  },
};

Baratie.ingredient.registerIngredient(yourExtensionDefinition);
```

### Step 3: Import the New Extension

Open `src/index.ts` and add an import statement for your new extension file. This ensures that your extension is loaded when the application starts.

**Example:**

```typescript
import './extensions/your_category/yourExtensionName';
```
