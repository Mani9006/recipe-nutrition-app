/**
 * @jest-environment node
 */

/**
 * Shopping List Tests
 * Comprehensive test suite for shopping list generation and management.
 */

const {
  categorizeIngredient,
  getCategoryLabel,
  consolidateIngredients,
  generateShoppingList,
  formatIngredientAmount,
  toggleItemChecked,
  addCustomItem,
  removeShoppingItem,
  getUncheckedCount,
  clearCheckedItems,
  estimateCost,
} = require('../src/utils/shoppingList');

describe('categorizeIngredient', () => {
  test('categorizes produce correctly', () => {
    expect(categorizeIngredient('chicken breast')).toBe('protein');
    expect(categorizeIngredient('broccoli')).toBe('produce');
    expect(categorizeIngredient('apple')).toBe('produce');
  });

  test('categorizes protein', () => {
    expect(categorizeIngredient('chicken breast')).toBe('protein');
    expect(categorizeIngredient('salmon fillet')).toBe('protein');
    expect(categorizeIngredient('egg')).toBe('protein');
    expect(categorizeIngredient('tofu')).toBe('protein');
  });

  test('categorizes dairy', () => {
    expect(categorizeIngredient('milk')).toBe('dairy');
    expect(categorizeIngredient('cheddar cheese')).toBe('dairy');
    expect(categorizeIngredient('greek yogurt')).toBe('dairy');
  });

  test('categorizes grains', () => {
    expect(categorizeIngredient('rice')).toBe('grains');
    expect(categorizeIngredient('pasta')).toBe('grains');
    expect(categorizeIngredient('bread')).toBe('grains');
  });

  test('categorizes condiments', () => {
    expect(categorizeIngredient('olive oil')).toBe('condiments');
    expect(categorizeIngredient('soy sauce')).toBe('condiments');
  });

  test('categorizes spices', () => {
    expect(categorizeIngredient('salt')).toBe('spices');
    expect(categorizeIngredient('black pepper')).toBe('spices');
  });

  test('returns "other" for unknown ingredients', () => {
    expect(categorizeIngredient('some unknown thing')).toBe('other');
  });

  test('handles invalid input', () => {
    expect(categorizeIngredient('')).toBe('other');
    expect(categorizeIngredient(null)).toBe('other');
  });
});

describe('getCategoryLabel', () => {
  test('returns correct label', () => {
    expect(getCategoryLabel('produce')).toBe('Fresh Produce');
    expect(getCategoryLabel('protein')).toBe('Meat & Protein');
    expect(getCategoryLabel('dairy')).toBe('Dairy & Eggs');
  });

  test('returns input for unknown category', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown');
  });

  test('returns fallback for empty input', () => {
    expect(getCategoryLabel('')).toBe('Other Items');
  });
});

describe('consolidateIngredients', () => {
  test('consolidates duplicate ingredients', () => {
    const ingredients = [
      { name: 'chicken', amount: 1, unit: 'lb' },
      { name: 'chicken', amount: 0.5, unit: 'lb' },
      { name: 'broccoli', amount: 1, unit: 'cup' },
    ];
    const result = consolidateIngredients(ingredients);
    expect(result).toHaveLength(2);
    const chicken = result.find((i) => i.name === 'chicken');
    expect(chicken.amount).toBe(1.5);
  });

  test('handles empty array', () => {
    expect(consolidateIngredients([])).toEqual([]);
  });

  test('handles invalid input', () => {
    expect(consolidateIngredients(null)).toEqual([]);
  });

  test('ignores items without name', () => {
    const ingredients = [
      { name: 'chicken', amount: 1, unit: 'lb' },
      { amount: 1, unit: 'lb' },
    ];
    const result = consolidateIngredients(ingredients);
    expect(result).toHaveLength(1);
  });

  test('preserves original items when no duplicates', () => {
    const ingredients = [
      { name: 'chicken', amount: 1, unit: 'lb' },
      { name: 'broccoli', amount: 2, unit: 'cup' },
    ];
    const result = consolidateIngredients(ingredients);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('chicken');
    expect(result[1].name).toBe('broccoli');
  });
});

describe('generateShoppingList', () => {
  const mealPlan = {
    Monday: {
      breakfast: { recipeId: 'r001', servings: 1 },
      lunch: { recipeId: null, servings: 1 },
    },
  };

  const recipes = [
    {
      id: 'r001',
      title: 'Grilled Chicken',
      servings: 2,
      ingredients: [
        { name: 'chicken breast', amount: 2, unit: 'piece', grams: 340 },
        { name: 'olive oil', amount: 1, unit: 'tbsp', grams: 14 },
        { name: 'salt', amount: 0.5, unit: 'tsp', grams: 3 },
      ],
    },
    {
      id: 'r002',
      title: 'Veggie Stir Fry',
      servings: 3,
      ingredients: [
        { name: 'broccoli', amount: 2, unit: 'cup', grams: 180 },
        { name: 'soy sauce', amount: 2, unit: 'tbsp', grams: 30 },
      ],
    },
  ];

  test('generates shopping list from meal plan', () => {
    const result = generateShoppingList(mealPlan, recipes);
    expect(result.totalItems).toBeGreaterThan(0);
    expect(result.items.length).toBeGreaterThan(0);
  });

  test('returns empty list for empty plan', () => {
    const result = generateShoppingList({}, recipes);
    expect(result.totalItems).toBe(0);
    expect(result.items).toEqual([]);
  });

  test('returns empty for null inputs', () => {
    expect(generateShoppingList(null, recipes).totalItems).toBe(0);
    expect(generateShoppingList(mealPlan, null).totalItems).toBe(0);
  });

  test('scales ingredients by servings', () => {
    const planWithMultipleServings = {
      Monday: {
        breakfast: { recipeId: 'r001', servings: 4 },
      },
    };
    const result = generateShoppingList(planWithMultipleServings, recipes);
    const chickenItem = result.items.find(
      (i) => i.name === 'chicken breast'
    );
    // Original recipe serves 2, plan requests 4 servings, so 2x
    expect(chickenItem).toBeDefined();
    expect(chickenItem.amount).toBe(4);
  });
});

describe('formatIngredientAmount', () => {
  test('formats amount with unit', () => {
    expect(formatIngredientAmount(2, 'cup')).toBe('2 cup');
    expect(formatIngredientAmount(0.5, 'tbsp')).toBe('0.5 tbsp');
  });

  test('formats whole numbers without decimals', () => {
    expect(formatIngredientAmount(1, 'piece')).toBe('1 piece');
  });

  test('handles empty unit', () => {
    expect(formatIngredientAmount(5, '')).toBe('5');
  });

  test('handles invalid amount', () => {
    expect(formatIngredientAmount(NaN, 'cup')).toBe('');
  });
});

describe('toggleItemChecked', () => {
  test('toggles item at index', () => {
    const items = [
      { name: 'a', checked: false },
      { name: 'b', checked: false },
      { name: 'c', checked: true },
    ];
    const result = toggleItemChecked(items, 0);
    expect(result[0].checked).toBe(true);
    expect(result[1].checked).toBe(false);
  });

  test('returns original array for invalid index', () => {
    const items = [{ name: 'a', checked: false }];
    expect(toggleItemChecked(items, -1)).toBe(items);
    expect(toggleItemChecked(items, 5)).toBe(items);
  });

  test('returns original for non-array', () => {
    expect(toggleItemChecked(null, 0)).toBe(null);
  });
});

describe('addCustomItem', () => {
  test('adds a new item', () => {
    const items = [];
    const result = addCustomItem(items, 'bananas', 3, 'piece');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('bananas');
    expect(result[0].amount).toBe(3);
    expect(result[0].unit).toBe('piece');
    expect(result[0].checked).toBe(false);
    expect(result[0].isCustom).toBe(true);
  });

  test('trims item name', () => {
    const result = addCustomItem([], '  bananas  ', 2, '');
    expect(result[0].name).toBe('bananas');
  });

  test('does not add empty name', () => {
    const result = addCustomItem([], '', 1, '');
    expect(result).toEqual([]);
  });

  test('does not add whitespace-only name', () => {
    const result = addCustomItem([], '   ', 1, '');
    expect(result).toEqual([]);
  });

  test('defaults amount to 1', () => {
    const result = addCustomItem([], 'item', NaN, '');
    expect(result[0].amount).toBe(1);
  });
});

describe('removeShoppingItem', () => {
  test('removes item at index', () => {
    const items = [
      { name: 'a' },
      { name: 'b' },
      { name: 'c' },
    ];
    const result = removeShoppingItem(items, 1);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('a');
    expect(result[1].name).toBe('c');
  });

  test('returns original array for invalid index', () => {
    const items = [{ name: 'a' }];
    expect(removeShoppingItem(items, -1)).toBe(items);
    expect(removeShoppingItem(items, 5)).toBe(items);
  });
});

describe('getUncheckedCount', () => {
  test('counts unchecked items', () => {
    const items = [
      { name: 'a', checked: false },
      { name: 'b', checked: true },
      { name: 'c', checked: false },
    ];
    expect(getUncheckedCount(items)).toBe(2);
  });

  test('returns 0 for all checked', () => {
    const items = [
      { name: 'a', checked: true },
      { name: 'b', checked: true },
    ];
    expect(getUncheckedCount(items)).toBe(0);
  });

  test('returns 0 for empty array', () => {
    expect(getUncheckedCount([])).toBe(0);
  });
});

describe('clearCheckedItems', () => {
  test('removes checked items', () => {
    const items = [
      { name: 'a', checked: false },
      { name: 'b', checked: true },
      { name: 'c', checked: false },
    ];
    const result = clearCheckedItems(items);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('a');
    expect(result[1].name).toBe('c');
  });

  test('returns empty for all checked', () => {
    const items = [
      { name: 'a', checked: true },
      { name: 'b', checked: true },
    ];
    expect(clearCheckedItems(items)).toEqual([]);
  });

  test('handles invalid input', () => {
    expect(clearCheckedItems(null)).toEqual([]);
  });
});

describe('estimateCost', () => {
  test('returns cost estimate', () => {
    const items = [
      { name: 'chicken breast' },
      { name: 'broccoli' },
      { name: 'rice' },
      { name: 'milk' },
    ];
    const result = estimateCost(items);
    expect(result.estimatedTotal).toBeGreaterThan(0);
    expect(result.currency).toBe('USD');
  });

  test('returns zero for empty array', () => {
    const result = estimateCost([]);
    expect(result.estimatedTotal).toBe(0);
  });

  test('returns zero for null', () => {
    const result = estimateCost(null);
    expect(result.estimatedTotal).toBe(0);
  });
});
