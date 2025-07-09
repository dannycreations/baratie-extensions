import { CATEGORY_API_TESTS, KEY_TEST_COOKBOOK } from '../core/constants';

import type { Ingredient, IngredientDefinition, InputType, RecipeBookItem, ResultType, SpiceDefinition } from 'baratie';

interface CookbookTestSpice {
  readonly action: 'save_current' | 'delete_last' | 'export_last' | 'load_last' | 'get_all' | 'merge';
}

const COOKBOOK_TEST_SPICES: readonly SpiceDefinition[] = [
  {
    id: 'action',
    label: 'Action',
    type: 'select',
    value: 'save_current',
    options: [
      { label: 'Save the Current Recipe', value: 'save_current' },
      { label: 'Delete the Last Saved Recipe', value: 'delete_last' },
      { label: 'Export the Last Saved Recipe', value: 'export_last' },
      { label: 'Load the Last Saved Recipe', value: 'load_last' },
      { label: 'Get All Saved Recipes', value: 'get_all' },
      { label: 'Merge a Dummy Recipe', value: 'merge' },
    ],
  },
];

const COOKBOOK_TEST_DEFINITION: IngredientDefinition<CookbookTestSpice> = {
  id: KEY_TEST_COOKBOOK,
  name: 'Test: Cookbook Helper',
  category: CATEGORY_API_TESTS,
  description: 'Tests saving, deleting, and exporting recipes using the cookbook helper.',
  spices: COOKBOOK_TEST_SPICES,
  run: (input: InputType<unknown>, spices: CookbookTestSpice): ResultType<string> | null => {
    const { cookbook, recipe } = Baratie.helpers;
    const { action } = spices;

    switch (action) {
      case 'save_current': {
        const activeIngredients: readonly Ingredient[] = recipe.getAll();
        if (activeIngredients.length === 0) {
          return input.update('Cannot save an empty recipe.');
        }
        const recipeName: string = `Test Recipe ${new Date().toLocaleTimeString()}`;
        const activeRecipeId = recipe.getActiveId();
        cookbook.addOrUpdate(recipeName, activeIngredients, activeRecipeId);
        const foundRecipe = cookbook.getAll().find((recipeItem) => recipeItem.name === recipeName);
        return input.update(`Called addOrUpdate with name: "${recipeName}". Success: ${!!foundRecipe}`);
      }
      case 'delete_last': {
        const allRecipes: readonly RecipeBookItem[] = cookbook.getAll();
        const lastRecipe: RecipeBookItem | undefined = allRecipes[0];
        if (lastRecipe) {
          const initialCount = allRecipes.length;
          cookbook.delete(lastRecipe.id);
          const recipesAfterDelete = cookbook.getAll();
          const wasSuccessful =
            recipesAfterDelete.length === initialCount - 1 && !recipesAfterDelete.find((recipeItem) => recipeItem.id === lastRecipe.id);
          return input.update(`Called delete for '${lastRecipe.name}'. Success: ${wasSuccessful}`);
        }
        return input.update('The cookbook is empty; there is nothing to delete.');
      }
      case 'export_last': {
        const allRecipes: readonly RecipeBookItem[] = cookbook.getAll();
        const lastRecipe: RecipeBookItem | undefined = allRecipes[0];
        if (lastRecipe) {
          cookbook.exportSingle(lastRecipe.name, lastRecipe.ingredients);
          return input.update(`Called exportSingle for '${lastRecipe.name}'. Check downloads.`);
        }
        return input.update('The cookbook is empty; there is nothing to export.');
      }
      case 'load_last': {
        const allRecipes: readonly RecipeBookItem[] = cookbook.getAll();
        const lastRecipe: RecipeBookItem | undefined = allRecipes[0];
        if (lastRecipe) {
          cookbook.load(lastRecipe.id);
          const loadedRecipeId = recipe.getActiveId();
          return input.update(`Called load for '${lastRecipe.name}'. New active ID: ${loadedRecipeId}. Success: ${loadedRecipeId === lastRecipe.id}`);
        }
        return input.update('The cookbook is empty; there is nothing to load.');
      }
      case 'get_all': {
        const allRecipes: readonly RecipeBookItem[] = cookbook.getAll();
        const recipeNames = allRecipes.map((recipeItem) => recipeItem.name).join(', ');
        return input.update(`Found ${allRecipes.length} recipes: ${recipeNames || 'None'}`);
      }
      case 'merge': {
        const dummyRecipe: RecipeBookItem = {
          id: crypto.randomUUID(),
          name: `Merged Recipe ${new Date().toLocaleTimeString()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ingredients: [],
        };
        const initialCount = cookbook.getAll().length;
        cookbook.merge([dummyRecipe]);
        const finalCount = cookbook.getAll().length;
        return input.update(`Called merge. Initial count: ${initialCount}, final count: ${finalCount}. Success: ${finalCount > initialCount}`);
      }
      default:
        return null;
    }
  },
};

Baratie.ingredientRegistry.registerIngredient(COOKBOOK_TEST_DEFINITION);
