/**
 * Nutrition Calculator Utility
 *
 * Provides comprehensive nutrition calculation functions for recipes,
 * meal plans, and daily tracking. All calculations use per-serving values.
 */

/**
 * @typedef {Object} NutritionValues
 * @property {number} calories
 * @property {number} protein
 * @property {number} carbs
 * @property {number} fat
 * @property {number} fiber
 * @property {number} sugar
 * @property {number} sodium
 */

/**
 * @typedef {Object} DailyTarget
 * @property {number} calories
 * @property {number} protein
 * @property {number} carbs
 * @property {number} fat
 * @property {number} fiber
 */

/**
 * Empty/zero nutrition values
 * @returns {NutritionValues}
 */
export function emptyNutrition() {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };
}

/**
 * Validate and sanitize nutrition values
 * @param {NutritionValues|Object} nutrition
 * @returns {NutritionValues}
 */
export function sanitizeNutrition(nutrition) {
  if (!nutrition || typeof nutrition !== 'object') {
    return emptyNutrition();
  }

  const sanitize = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : Math.max(0, num);
  };

  return {
    calories: sanitize(nutrition.calories),
    protein: sanitize(nutrition.protein),
    carbs: sanitize(nutrition.carbs),
    fat: sanitize(nutrition.fat),
    fiber: sanitize(nutrition.fiber),
    sugar: sanitize(nutrition.sugar),
    sodium: sanitize(nutrition.sodium),
  };
}

/**
 * Calculate nutrition for a recipe scaled to a specific number of servings
 * @param {NutritionValues} nutritionPerServing - Base per-serving nutrition
 * @param {number} servings - Number of servings to scale to
 * @returns {NutritionValues}
 */
export function scaleNutrition(nutritionPerServing, servings) {
  if (!nutritionPerServing || typeof nutritionPerServing !== 'object') {
    console.warn('scaleNutrition: Invalid nutrition data');
    return emptyNutrition();
  }

  const numServings = Number(servings);
  if (isNaN(numServings) || numServings <= 0) {
    console.warn(`scaleNutrition: Invalid servings "${servings}"`);
    return emptyNutrition();
  }

  const base = sanitizeNutrition(nutritionPerServing);

  return {
    calories: Math.round(base.calories * numServings),
    protein: Math.round(base.protein * numServings * 10) / 10,
    carbs: Math.round(base.carbs * numServings * 10) / 10,
    fat: Math.round(base.fat * numServings * 10) / 10,
    fiber: Math.round(base.fiber * numServings * 10) / 10,
    sugar: Math.round(base.sugar * numServings * 10) / 10,
    sodium: Math.round(base.sodium * numServings),
  };
}

/**
 * Sum nutrition values from multiple sources
 * @param {NutritionValues[]} nutritionArray
 * @returns {NutritionValues}
 */
export function sumNutrition(nutritionArray) {
  if (!Array.isArray(nutritionArray)) {
    console.warn('sumNutrition: Expected array');
    return emptyNutrition();
  }

  const totals = emptyNutrition();

  nutritionArray.forEach((item) => {
    const sanitized = sanitizeNutrition(item);
    totals.calories += sanitized.calories;
    totals.protein += sanitized.protein;
    totals.carbs += sanitized.carbs;
    totals.fat += sanitized.fat;
    totals.fiber += sanitized.fiber;
    totals.sugar += sanitized.sugar;
    totals.sodium += sanitized.sodium;
  });

  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    fiber: Math.round(totals.fiber * 10) / 10,
    sugar: Math.round(totals.sugar * 10) / 10,
    sodium: Math.round(totals.sodium),
  };
}

/**
 * Calculate nutrition for a single meal entry (recipe + servings)
 * @param {Object} recipe
 * @param {number} servings
 * @returns {NutritionValues}
 */
export function calculateMealNutrition(recipe, servings = 1) {
  if (!recipe || typeof recipe !== 'object') {
    console.warn('calculateMealNutrition: Invalid recipe');
    return emptyNutrition();
  }

  return scaleNutrition(recipe.nutritionPerServing, servings);
}

/**
 * Calculate nutrition for a day's meals
 * @param {Array<{recipe: Object, servings: number}>} meals
 * @returns {NutritionValues}
 */
export function calculateDayNutrition(meals) {
  if (!Array.isArray(meals)) {
    console.warn('calculateDayNutrition: Expected array');
    return emptyNutrition();
  }

  const mealNutritions = meals.map((meal) => {
    if (!meal || typeof meal !== 'object') return emptyNutrition();
    return calculateMealNutrition(meal.recipe, meal.servings || 1);
  });

  return sumNutrition(mealNutritions);
}

/**
 * Calculate macro percentages (protein, carbs, fat)
 * @param {NutritionValues} nutrition
 * @returns {{proteinPercent: number, carbsPercent: number, fatPercent: number}}
 */
export function calculateMacroPercentages(nutrition) {
  const sanitized = sanitizeNutrition(nutrition);

  // Calories from each macro: protein=4cal/g, carbs=4cal/g, fat=9cal/g
  const proteinCals = sanitized.protein * 4;
  const carbsCals = sanitized.carbs * 4;
  const fatCals = sanitized.fat * 9;

  const totalCals = proteinCals + carbsCals + fatCals;

  if (totalCals === 0) {
    return { proteinPercent: 0, carbsPercent: 0, fatPercent: 0 };
  }

  return {
    proteinPercent: Math.round((proteinCals / totalCals) * 100),
    carbsPercent: Math.round((carbsCals / totalCals) * 100),
    fatPercent: Math.round((fatCals / totalCals) * 100),
  };
}

/**
 * Calculate remaining nutrition against daily targets
 * @param {NutritionValues} consumed
 * @param {DailyTarget} targets
 * @returns {Object}
 */
export function calculateRemaining(consumed, targets) {
  if (!targets || typeof targets !== 'object') {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  }

  const safeConsumed = sanitizeNutrition(consumed);

  return {
    calories: Math.max(0, Math.round((targets.calories || 0) - safeConsumed.calories)),
    protein: Math.max(0, Math.round(((targets.protein || 0) - safeConsumed.protein) * 10) / 10),
    carbs: Math.max(0, Math.round(((targets.carbs || 0) - safeConsumed.carbs) * 10) / 10),
    fat: Math.max(0, Math.round(((targets.fat || 0) - safeConsumed.fat) * 10) / 10),
    fiber: Math.max(0, Math.round(((targets.fiber || 0) - safeConsumed.fiber) * 10) / 10),
  };
}

/**
 * Calculate nutrition progress as percentage of target
 * @param {NutritionValues} consumed
 * @param {DailyTarget} targets
 * @returns {Object}
 */
export function calculateProgress(consumed, targets) {
  if (!targets || typeof targets !== 'object') {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  }

  const safeConsumed = sanitizeNutrition(consumed);

  const calc = (val, target) => {
    if (!target || target <= 0) return 0;
    return Math.min(100, Math.round((val / target) * 100));
  };

  return {
    calories: calc(safeConsumed.calories, targets.calories),
    protein: calc(safeConsumed.protein, targets.protein),
    carbs: calc(safeConsumed.carbs, targets.carbs),
    fat: calc(safeConsumed.fat, targets.fat),
    fiber: calc(safeConsumed.fiber, targets.fiber),
  };
}

/**
 * Format a nutrition value with appropriate unit
 * @param {number} value
 * @param {string} type - 'calories', 'grams', or 'mg'
 * @returns {string}
 */
export function formatNutritionValue(value, type = 'grams') {
  const num = Number(value);
  if (isNaN(num)) return '0';

  switch (type) {
    case 'calories':
      return `${Math.round(num)} cal`;
    case 'mg':
      return `${Math.round(num)} mg`;
    case 'grams':
    default:
      return `${Math.round(num * 10) / 10}g`;
  }
}

/**
 * Get default daily nutrition targets based on user profile
 * @param {string} goal - 'lose', 'maintain', 'gain', or 'muscle'
 * @param {string} gender - 'male' or 'female'
 * @param {number} weightKg - Weight in kilograms
 * @param {number} activityLevel - 1.2 (sedentary) to 1.9 (very active)
 * @returns {DailyTarget}
 */
export function getDefaultTargets(goal = 'maintain', gender = 'male', weightKg = 70, activityLevel = 1.375) {
  if (typeof weightKg !== 'number' || weightKg <= 0) {
    weightKg = 70;
  }
  if (typeof activityLevel !== 'number' || activityLevel < 1) {
    activityLevel = 1.375;
  }

  // Base BMR using Mifflin-St Jeor Equation (simplified)
  // Using average height ~170cm, age ~30 for estimation
  const heightCm = gender === 'male' ? 175 : 162;
  const age = 30;

  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  let calories = Math.round(bmr * activityLevel);

  // Adjust based on goal
  switch (goal) {
    case 'lose':
      calories = Math.round(calories * 0.8); // 20% deficit
      break;
    case 'gain':
      calories = Math.round(calories * 1.15); // 15% surplus
      break;
    case 'muscle':
      calories = Math.round(calories * 1.1); // 10% surplus
      break;
    case 'maintain':
    default:
      break;
  }

  // Macro targets based on goal
  let protein, carbs, fat;
  switch (goal) {
    case 'lose':
      protein = weightKg * 2.0; // High protein for satiety
      fat = weightKg * 0.8;
      carbs = (calories - (protein * 4 + fat * 9)) / 4;
      break;
    case 'muscle':
      protein = weightKg * 2.2; // High protein for muscle building
      fat = weightKg * 1.0;
      carbs = (calories - (protein * 4 + fat * 9)) / 4;
      break;
    case 'gain':
      protein = weightKg * 1.8;
      fat = weightKg * 1.0;
      carbs = (calories - (protein * 4 + fat * 9)) / 4;
      break;
    case 'maintain':
    default:
      protein = weightKg * 1.6;
      fat = weightKg * 1.0;
      carbs = (calories - (protein * 4 + fat * 9)) / 4;
      break;
  }

  return {
    calories: Math.max(1200, calories),
    protein: Math.round(protein),
    carbs: Math.round(Math.max(50, carbs)),
    fat: Math.round(fat),
    fiber: 30,
  };
}

/**
 * Calculate the glycemic load approximation for a meal
 * Note: This is a simplified estimation
 * @param {NutritionValues} nutrition
 * @returns {{load: string, label: string}}
 */
export function estimateGlycemicInfo(nutrition) {
  const sanitized = sanitizeNutrition(nutrition);

  // Simplified estimation based on carb/sugar to fiber ratio
  if (sanitized.carbs === 0) {
    return { load: 'N/A', label: 'No carbs' };
  }

  const sugarRatio = sanitized.sugar / sanitized.carbs;
  const fiberRatio = sanitized.fiber / sanitized.carbs;

  if (fiberRatio > 0.15 || sugarRatio < 0.1) {
    return { load: 'Low', label: 'Low glycemic impact' };
  } else if (fiberRatio > 0.08 || sugarRatio < 0.25) {
    return { load: 'Medium', label: 'Moderate glycemic impact' };
  } else {
    return { load: 'High', label: 'High glycemic impact' };
  }
}
