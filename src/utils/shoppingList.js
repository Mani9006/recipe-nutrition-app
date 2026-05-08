/**
 * Shopping List Utility Functions
 *
 * Generates consolidated shopping lists from meal plans,
 * handles ingredient grouping, categorization, and formatting.
 */

/**
 * Ingredient category mapping for organizing shopping lists
 */
const INGREDIENT_CATEGORIES = {
  produce: [
    'apple', 'avocado', 'banana', 'basil', 'bell pepper', 'berries', 'blueberry',
    'broccoli', 'cabbage', 'carrot', 'cauliflower', 'celery', 'cherry', 'cilantro',
    'coconut', 'corn', 'cucumber', 'dill', 'garlic', 'ginger', 'grape', 'greens',
    'kale', 'lemon', 'lettuce', 'lime', 'mango', 'melon', 'mint', 'mushroom',
    'onion', 'orange', 'parsley', 'peach', 'pear', 'pineapple', 'potato', 'pumpkin',
    'spinach', 'sprout', 'squash', 'strawberry', 'sweet potato', 'tomato', 'zucchini',
    'asparagus', 'snap pea', 'edamame', 'jalapeo',
  ],
  protein: [
    'chicken', 'beef', 'pork', 'turkey', 'salmon', 'tuna', 'shrimp', 'fish',
    'egg', 'tofu', 'tempeh', 'sausage', 'bacon', 'ham', 'lamb', 'cod',
    'tilapia', 'scallop', 'crab', 'lobster', 'duck',
  ],
  dairy: [
    'milk', 'cheese', 'yogurt', 'butter', 'cream', 'cheddar', 'mozzarella',
    'parmesan', 'feta', 'ricotta', 'cottage cheese', 'sour cream', 'half and half',
    'whipped cream', 'greek yogurt',
  ],
  grains: [
    'rice', 'pasta', 'noodle', 'bread', 'tortilla', 'oats', 'quinoa', 'flour',
    'cereal', 'couscous', 'barley', 'crouton', 'pita', 'naan', 'bagel',
    'vermicelli', 'spaghetti', 'penne', 'fettuccine',
  ],
  canned: [
    'beans', 'chickpeas', 'lentils', 'tomatoes', 'corn', 'tuna', 'soup',
    'coconut milk', 'broth', 'sauce', 'paste',
  ],
  frozen: [
    'frozen', 'ice', 'pizza', 'waffle',
  ],
  condiments: [
    'sauce', 'vinegar', 'oil', 'dressing', 'mayonnaise', 'mustard', 'ketchup',
    'relish', 'syrup', 'honey', 'jam', 'peanut butter', 'tahini', 'paste',
    'hummus', 'pesto', 'salsa', 'teriyaki', 'hoisin',
  ],
  spices: [
    'salt', 'pepper', 'cumin', 'paprika', 'cinnamon', 'oregano', 'thyme',
    'basil dried', 'rosemary', 'nutmeg', 'turmeric', 'chili', 'curry',
    'seasoning', 'spice', 'blend', 'flakes', 'bay leaf', 'garam masala',
    'coriander', 'sesame seeds', 'chia seeds',
  ],
  baking: [
    'baking powder', 'baking soda', 'yeast', 'sugar', 'brown sugar',
    'vanilla', 'cocoa', 'chocolate', 'chip',
  ],
};

/**
 * Categorize an ingredient name into a shopping category
 * @param {string} ingredientName
 * @returns {string}
 */
export function categorizeIngredient(ingredientName) {
  if (!ingredientName || typeof ingredientName !== 'string') return 'other';

  const normalized = ingredientName.toLowerCase().trim();

  for (const [category, items] of Object.entries(INGREDIENT_CATEGORIES)) {
    for (const item of items) {
      if (normalized.includes(item)) {
        return category;
      }
    }
  }

  return 'other';
}

/**
 * Category display names
 */
const CATEGORY_LABELS = {
  produce: 'Fresh Produce',
  protein: 'Meat & Protein',
  dairy: 'Dairy & Eggs',
  grains: 'Grains & Bread',
  canned: 'Canned Goods',
  frozen: 'Frozen',
  condiments: 'Condiments & Sauces',
  spices: 'Spices & Seasonings',
  baking: 'Baking',
  other: 'Other Items',
};

/**
 * Get human-readable label for a category
 * @param {string} category
 * @returns {string}
 */
export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category || 'Other Items';
}

/**
 * Category sort order
 */
const CATEGORY_ORDER = [
  'produce',
  'protein',
  'dairy',
  'grains',
  'canned',
  'frozen',
  'condiments',
  'baking',
  'spices',
  'other',
];

/**
 * Consolidate duplicate ingredients by name
 * @param {Array} ingredients
 * @returns {Array}
 */
export function consolidateIngredients(ingredients) {
  if (!Array.isArray(ingredients)) return [];

  const ingredientMap = new Map();

  ingredients.forEach((item) => {
    if (!item || !item.name) return;

    const key = item.name.toLowerCase().trim();

    if (ingredientMap.has(key)) {
      const existing = ingredientMap.get(key);
      // Prefer the larger amount
      const newAmount = Number(item.amount) || 0;
      const existingAmount = Number(existing.amount) || 0;

      // Use the unit from the item with the larger amount
      if (newAmount > existingAmount) {
        ingredientMap.set(key, {
          ...existing,
          amount: existingAmount + newAmount,
          unit: item.unit || existing.unit,
        });
      } else {
        ingredientMap.set(key, {
          ...existing,
          amount: existingAmount + newAmount,
        });
      }
    } else {
      ingredientMap.set(key, { ...item });
    }
  });

  return Array.from(ingredientMap.values());
}

/**
 * Generate a shopping list from a meal plan
 * @param {Object} mealPlan - The meal plan object
 * @param {Array} recipes - All available recipes
 * @returns {Object} - Organized shopping list by category
 */
export function generateShoppingList(mealPlan, recipes) {
  if (!mealPlan || !Array.isArray(recipes)) {
    return { categories: [], items: [], totalItems: 0 };
  }

  // Collect all ingredients from planned meals
  const allIngredients = [];

  Object.values(mealPlan).forEach((day) => {
    if (!day || typeof day !== 'object') return;

    Object.values(day).forEach((slot) => {
      if (!slot || !slot.recipeId) return;

      const recipe = recipes.find((r) => r.id === slot.recipeId);
      if (!recipe || !Array.isArray(recipe.ingredients)) return;

      const servings = slot.servings || 1;
      const recipeServings = recipe.servings || 1;
      const scaleFactor = servings / recipeServings;

      recipe.ingredients.forEach((ingredient) => {
        if (!ingredient || !ingredient.name) return;

        const scaledAmount = (Number(ingredient.amount) || 0) * scaleFactor;

        allIngredients.push({
          name: ingredient.name,
          amount: Math.round(scaledAmount * 100) / 100,
          unit: ingredient.unit || '',
          recipeTitle: recipe.title,
          checked: false,
        });
      });
    });
  });

  // Consolidate duplicates
  const consolidated = consolidateIngredients(allIngredients);

  // Categorize and organize
  const categorized = {};

  consolidated.forEach((item) => {
    const category = categorizeIngredient(item.name);
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(item);
  });

  // Sort categories by defined order
  const sortedCategories = CATEGORY_ORDER.filter((cat) => categorized[cat] && categorized[cat].length > 0);

  // Build final structure
  const categories = sortedCategories.map((category) => ({
    name: category,
    label: getCategoryLabel(category),
    items: categorized[category].sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return {
    categories,
    items: consolidated,
    totalItems: consolidated.length,
  };
}

/**
 * Format ingredient amount with unit for display
 * @param {number} amount
 * @param {string} unit
 * @returns {string}
 */
export function formatIngredientAmount(amount, unit) {
  const num = Number(amount);
  if (isNaN(num)) return '';

  // Format to reasonable decimal places
  const formatted = num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '');

  if (!unit) return formatted;
  return `${formatted} ${unit}`;
}

/**
 * Check off an item in the shopping list
 * @param {Array} items
 * @param {number} index
 * @returns {Array}
 */
export function toggleItemChecked(items, index) {
  if (!Array.isArray(items) || index < 0 || index >= items.length) {
    return items;
  }

  const updated = [...items];
  updated[index] = {
    ...updated[index],
    checked: !updated[index].checked,
  };

  return updated;
}

/**
 * Add a custom item to the shopping list
 * @param {Array} items
 * @param {string} name
 * @param {number} amount
 * @param {string} unit
 * @returns {Array}
 */
export function addCustomItem(items, name, amount = 1, unit = '') {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return items;
  }

  const trimmed = name.trim();
  if (trimmed.length > 100) {
    console.warn('addCustomItem: Item name too long');
    return items;
  }

  const newItem = {
    name: trimmed,
    amount: Math.max(0, Number(amount) || 1),
    unit: (unit || '').trim(),
    checked: false,
    isCustom: true,
  };

  return [...(Array.isArray(items) ? items : []), newItem];
}

/**
 * Remove an item from the shopping list
 * @param {Array} items
 * @param {number} index
 * @returns {Array}
 */
export function removeShoppingItem(items, index) {
  if (!Array.isArray(items) || index < 0 || index >= items.length) {
    return items;
  }

  return items.filter((_, i) => i !== index);
}

/**
 * Get count of unchecked items
 * @param {Array} items
 * @returns {number}
 */
export function getUncheckedCount(items) {
  if (!Array.isArray(items)) return 0;
  return items.filter((item) => !item.checked).length;
}

/**
 * Clear all checked items from the list
 * @param {Array} items
 * @returns {Array}
 */
export function clearCheckedItems(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => !item.checked);
}

/**
 * Estimate total cost of a shopping list (rough approximation)
 * @param {Array} items
 * @returns {{estimatedTotal: number, currency: string}}
 */
export function estimateCost(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { estimatedTotal: 0, currency: 'USD' };
  }

  // Very rough price estimates by category
  const priceEstimates = {
    produce: 1.5,
    protein: 5.0,
    dairy: 3.0,
    grains: 2.5,
    canned: 1.5,
    frozen: 3.0,
    condiments: 3.5,
    spices: 2.0,
    baking: 2.5,
    other: 2.0,
  };

  let total = 0;
  const countedItems = new Set();

  items.forEach((item) => {
    if (!item || !item.name) return;

    const category = categorizeIngredient(item.name);
    const basePrice = priceEstimates[category] || 2.0;

    // Don't double-count same ingredient
    const key = item.name.toLowerCase().trim();
    if (!countedItems.has(key)) {
      total += basePrice;
      countedItems.add(key);
    } else {
      // Add 50% for additional quantity
      total += basePrice * 0.5;
    }
  });

  return {
    estimatedTotal: Math.round(total * 100) / 100,
    currency: 'USD',
  };
}
