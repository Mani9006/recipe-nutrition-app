/**
 * @jest-environment node
 */

/**
 * Meal Planner Tests
 * Comprehensive test suite for meal planning utilities.
 */

const {
  getMealTypeLabel,
  getDayShortLabel,
  hasAnyMeals,
  countTotalMeals,
  getPlannedRecipeIds,
  suggestRecipesForSlot,
  findMealPlanGaps,
  validateMealPlan,
} = require('../src/utils/mealPlanner');

describe('getMealTypeLabel', () => {
  test('returns capitalized label', () => {
    expect(getMealTypeLabel('breakfast')).toBe('Breakfast');
    expect(getMealTypeLabel('lunch')).toBe('Lunch');
    expect(getMealTypeLabel('dinner')).toBe('Dinner');
    expect(getMealTypeLabel('snack')).toBe('Snack');
  });

  test('returns "Meal" for invalid input', () => {
    expect(getMealTypeLabel('')).toBe('Meal');
    expect(getMealTypeLabel(null)).toBe('Meal');
    expect(getMealTypeLabel(undefined)).toBe('Meal');
  });

  test('returns label for unknown type', () => {
    expect(getMealTypeLabel('brunch')).toBe('Brunch');
  });
});

describe('getDayShortLabel', () => {
  test('returns 3-letter abbreviation', () => {
    expect(getDayShortLabel('Monday')).toBe('Mon');
    expect(getDayShortLabel('Tuesday')).toBe('Tue');
    expect(getDayShortLabel('Wednesday')).toBe('Wed');
  });

  test('handles lowercase input', () => {
    expect(getDayShortLabel('monday')).toBe('Mon');
  });

  test('returns input substring for unknown day', () => {
    expect(getDayShortLabel('Holiday')).toBe('Hol');
  });

  test('handles invalid input', () => {
    expect(getDayShortLabel('')).toBe('');
    expect(getDayShortLabel(null)).toBe('');
  });
});

describe('hasAnyMeals', () => {
  test('returns true when meals exist', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: 'r001', servings: 1 },
        lunch: { recipeId: null, servings: 1 },
      },
    };
    expect(hasAnyMeals(plan)).toBe(true);
  });

  test('returns false for empty plan', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: null, servings: 1 },
        lunch: { recipeId: null, servings: 1 },
      },
    };
    expect(hasAnyMeals(plan)).toBe(false);
  });

  test('returns false for null plan', () => {
    expect(hasAnyMeals(null)).toBe(false);
  });

  test('returns false for non-object', () => {
    expect(hasAnyMeals('string')).toBe(false);
  });
});

describe('countTotalMeals', () => {
  test('counts meals correctly', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: 'r001', servings: 1 },
        lunch: { recipeId: 'r002', servings: 1 },
        dinner: { recipeId: null, servings: 1 },
      },
      Tuesday: {
        breakfast: { recipeId: null, servings: 1 },
        lunch: { recipeId: 'r003', servings: 1 },
        dinner: { recipeId: null, servings: 1 },
      },
    };
    expect(countTotalMeals(plan)).toBe(3);
  });

  test('returns 0 for empty plan', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: null, servings: 1 },
      },
    };
    expect(countTotalMeals(plan)).toBe(0);
  });

  test('returns 0 for null input', () => {
    expect(countTotalMeals(null)).toBe(0);
  });
});

describe('getPlannedRecipeIds', () => {
  test('returns unique recipe IDs', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: 'r001', servings: 1 },
        lunch: { recipeId: 'r002', servings: 1 },
      },
      Tuesday: {
        breakfast: { recipeId: 'r001', servings: 1 },
        lunch: { recipeId: 'r003', servings: 1 },
      },
    };
    const ids = getPlannedRecipeIds(plan);
    expect(ids).toHaveLength(3);
    expect(ids).toContain('r001');
    expect(ids).toContain('r002');
    expect(ids).toContain('r003');
  });

  test('returns empty array for empty plan', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: null, servings: 1 },
      },
    };
    expect(getPlannedRecipeIds(plan)).toEqual([]);
  });

  test('returns empty array for null input', () => {
    expect(getPlannedRecipeIds(null)).toEqual([]);
  });
});

describe('suggestRecipesForSlot', () => {
  const recipes = [
    { id: 'r001', title: 'Oatmeal', category: 'breakfast', nutritionPerServing: { calories: 300, protein: 12 }, prepTime: 5, cookTime: 5 },
    { id: 'r002', title: 'Eggs', category: 'breakfast', nutritionPerServing: { calories: 250, protein: 20 }, prepTime: 2, cookTime: 5 },
    { id: 'r003', title: 'Chicken Salad', category: 'lunch', nutritionPerServing: { calories: 400, protein: 35 }, prepTime: 10, cookTime: 10 },
    { id: 'r004', title: 'Smoothie', category: 'breakfast', nutritionPerServing: { calories: 200, protein: 8 }, prepTime: 3, cookTime: 0 },
    { id: 'r005', title: 'Steak', category: 'dinner', nutritionPerServing: { calories: 600, protein: 40 }, prepTime: 5, cookTime: 15 },
  ];

  test('returns recipes matching meal type', () => {
    const result = suggestRecipesForSlot(recipes, 'breakfast', 5);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].category).toBe('breakfast');
  });

  test('returns limited number of recipes', () => {
    const result = suggestRecipesForSlot(recipes, 'breakfast', 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  test('returns empty array for no matches', () => {
    const result = suggestRecipesForSlot([], 'breakfast');
    expect(result).toEqual([]);
  });

  test('returns empty for invalid input', () => {
    expect(suggestRecipesForSlot(null, 'breakfast')).toEqual([]);
  });
});

describe('findMealPlanGaps', () => {
  test('finds days missing main meals', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: 'r001', servings: 1 },
        lunch: { recipeId: 'r002', servings: 1 },
        dinner: { recipeId: 'r003', servings: 1 },
      },
      Tuesday: {
        breakfast: { recipeId: null, servings: 1 },
        lunch: { recipeId: null, servings: 1 },
        dinner: { recipeId: 'r004', servings: 1 },
      },
    };
    const gaps = findMealPlanGaps(plan);
    expect(gaps.length).toBe(1);
    expect(gaps[0].day).toBe('Tuesday');
    expect(gaps[0].missingMeals).toContain('breakfast');
    expect(gaps[0].missingMeals).toContain('lunch');
  });

  test('returns empty array for complete plan', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: 'r001', servings: 1 },
        lunch: { recipeId: 'r002', servings: 1 },
        dinner: { recipeId: 'r003', servings: 1 },
      },
    };
    expect(findMealPlanGaps(plan)).toEqual([]);
  });

  test('returns empty for null input', () => {
    expect(findMealPlanGaps(null)).toEqual([]);
  });

  test('snack is not required', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: 'r001', servings: 1 },
        lunch: { recipeId: 'r002', servings: 1 },
        dinner: { recipeId: null, servings: 1 },
        snack: { recipeId: null, servings: 1 },
      },
    };
    const gaps = findMealPlanGaps(plan);
    expect(gaps.length).toBe(1);
    expect(gaps[0].missingMeals).toContain('dinner');
    expect(gaps[0].missingMeals).not.toContain('snack');
  });
});

describe('validateMealPlan', () => {
  const recipes = [
    { id: 'r001', nutritionPerServing: { calories: 500, protein: 30, carbs: 50, fat: 20, fiber: 5 } },
    { id: 'r002', nutritionPerServing: { calories: 600, protein: 40, carbs: 60, fat: 25, fiber: 8 } },
  ];

  const targets = { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 };

  test('validates a healthy day', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: 'r001', servings: 1 },
        lunch: { recipeId: 'r002', servings: 1 },
        dinner: { recipeId: 'r001', servings: 1 },
      },
    };
    const results = validateMealPlan(plan, recipes, targets);
    const mondayResult = results.find((r) => r.day === 'Monday');
    expect(mondayResult).toBeDefined();
    expect(mondayResult.status).toBe('good');
  });

  test('validates an empty day', () => {
    const plan = {
      Monday: {
        breakfast: { recipeId: null, servings: 1 },
        lunch: { recipeId: null, servings: 1 },
        dinner: { recipeId: null, servings: 1 },
      },
    };
    const results = validateMealPlan(plan, recipes, targets);
    const mondayResult = results.find((r) => r.day === 'Monday');
    expect(mondayResult.status).toBe('empty');
  });

  test('returns empty array for null inputs', () => {
    expect(validateMealPlan(null, recipes, targets)).toEqual([]);
    expect(validateMealPlan({}, null, targets)).toEqual([]);
    expect(validateMealPlan({}, recipes, null)).toEqual([]);
  });
});
