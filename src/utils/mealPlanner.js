/**
 * Meal Planner Utility Functions
 *
 * Provides helper functions for planning, organizing, and analyzing
 * weekly meal plans including nutrition summaries and plan validation.
 */

import { emptyNutrition, sumNutrition, scaleNutrition } from './nutritionCalculator';

/**
 * Get display name for a meal type
 * @param {string} mealType
 * @returns {string}
 */
export function getMealTypeLabel(mealType) {
  if (!mealType || typeof mealType !== 'string') return 'Meal';

  const labels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  };

  return labels[mealType.toLowerCase()] || mealType;
}

/**
 * Get short display name for a day
 * @param {string} day
 * @returns {string}
 */
export function getDayShortLabel(day) {
  if (!day || typeof day !== 'string') return '';

  const labels = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };

  return labels[day.toLowerCase()] || day.substring(0, 3);
}

/**
 * Check if a meal plan has any assigned meals
 * @param {Object} mealPlan
 * @returns {boolean}
 */
export function hasAnyMeals(mealPlan) {
  if (!mealPlan || typeof mealPlan !== 'object') return false;

  return Object.values(mealPlan).some((day) => {
    if (!day || typeof day !== 'object') return false;
    return Object.values(day).some((slot) => slot && slot.recipeId !== null);
  });
}

/**
 * Count total number of meals in a plan
 * @param {Object} mealPlan
 * @returns {number}
 */
export function countTotalMeals(mealPlan) {
  if (!mealPlan || typeof mealPlan !== 'object') return 0;

  let count = 0;
  Object.values(mealPlan).forEach((day) => {
    if (day && typeof day === 'object') {
      Object.values(day).forEach((slot) => {
        if (slot && slot.recipeId !== null) {
          count++;
        }
      });
    }
  });

  return count;
}

/**
 * Get all unique recipe IDs used in a meal plan
 * @param {Object} mealPlan
 * @returns {string[]}
 */
export function getPlannedRecipeIds(mealPlan) {
  if (!mealPlan || typeof mealPlan !== 'object') return [];

  const ids = new Set();

  Object.values(mealPlan).forEach((day) => {
    if (day && typeof day === 'object') {
      Object.values(day).forEach((slot) => {
        if (slot && slot.recipeId) {
          ids.add(slot.recipeId);
        }
      });
    }
  });

  return [...ids];
}

/**
 * Calculate weekly nutrition summary
 * @param {Object} mealPlan
 * @param {Array} recipes
 * @returns {Object}
 */
export function calculateWeeklyNutrition(mealPlan, recipes) {
  if (!mealPlan || !Array.isArray(recipes)) {
    return {
      total: emptyNutrition(),
      daily: {},
      average: emptyNutrition(),
    };
  }

  const dailyTotals = {};
  const days = Object.keys(mealPlan);

  days.forEach((day) => {
    const dayMeals = [];
    const dayPlan = mealPlan[day];

    if (dayPlan && typeof dayPlan === 'object') {
      Object.entries(dayPlan).forEach(([, slot]) => {
        if (slot && slot.recipeId) {
          const recipe = recipes.find((r) => r.id === slot.recipeId);
          if (recipe) {
            dayMeals.push({
              recipe,
              servings: slot.servings || 1,
            });
          }
        }
      });
    }

    dailyTotals[day] = dayMeals.reduce(
      (acc, meal) => {
        const scaled = scaleNutrition(meal.recipe.nutritionPerServing, meal.servings);
        return {
          calories: acc.calories + scaled.calories,
          protein: acc.protein + scaled.protein,
          carbs: acc.carbs + scaled.carbs,
          fat: acc.fat + scaled.fat,
          fiber: acc.fiber + scaled.fiber,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  });

  const totalNutrition = Object.values(dailyTotals).reduce(
    (acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat,
      fiber: acc.fiber + day.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const plannedDays = Object.values(dailyTotals).filter(
    (d) => d.calories > 0
  ).length;

  const average = plannedDays > 0
    ? {
        calories: Math.round(totalNutrition.calories / plannedDays),
        protein: Math.round((totalNutrition.protein / plannedDays) * 10) / 10,
        carbs: Math.round((totalNutrition.carbs / plannedDays) * 10) / 10,
        fat: Math.round((totalNutrition.fat / plannedDays) * 10) / 10,
        fiber: Math.round((totalNutrition.fiber / plannedDays) * 10) / 10,
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  return {
    total: totalNutrition,
    daily: dailyTotals,
    average,
  };
}

/**
 * Generate suggestions for filling empty meal slots
 * @param {Object} mealPlan
 * @param {Array} recipes
 * @param {string} day
 * @param {string} mealType
 * @param {number} limit
 * @returns {Array}
 */
export function suggestRecipesForSlot(recipes, mealType, limit = 5) {
  if (!Array.isArray(recipes) || recipes.length === 0) return [];

  const validMealType = (mealType || '').toLowerCase();

  // Filter by category matching meal type
  const matching = recipes.filter((r) => {
    if (!r || !r.category) return false;
    return r.category.toLowerCase() === validMealType;
  });

  if (matching.length > 0) {
    // Sort by nutrition quality (higher protein, reasonable calories)
    const scored = matching.map((recipe) => {
      let score = 0;
      const nutrition = recipe.nutritionPerServing || {};

      // Prefer recipes with good protein content
      score += (nutrition.protein || 0) * 2;

      // Penalize very high calorie recipes
      const calories = nutrition.calories || 0;
      if (calories > 0 && calories < 800) {
        score += 10;
      }

      // Prefer shorter cook times
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      if (totalTime < 20) score += 5;

      return { recipe, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.recipe);
  }

  // Fallback: return recipes sorted by prep time
  return [...recipes]
    .sort((a, b) => {
      const timeA = (a.prepTime || 0) + (a.cookTime || 0);
      const timeB = (b.prepTime || 0) + (b.cookTime || 0);
      return timeA - timeB;
    })
    .slice(0, limit);
}

/**
 * Find gaps in the meal plan (days with missing meals)
 * @param {Object} mealPlan
 * @returns {Array<{day: string, missingMeals: string[]}>}
 */
export function findMealPlanGaps(mealPlan) {
  if (!mealPlan || typeof mealPlan !== 'object') return [];

  const gaps = [];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  Object.entries(mealPlan).forEach(([day, dayPlan]) => {
    if (!dayPlan || typeof dayPlan !== 'object') return;

    const missingMeals = mealTypes.filter(
      (mealType) => !dayPlan[mealType] || dayPlan[mealType].recipeId === null
    );

    if (missingMeals.length > 0) {
      gaps.push({ day, missingMeals });
    }
  });

  return gaps;
}

/**
 * Validate a meal plan against daily nutrition targets
 * @param {Object} mealPlan
 * @param {Array} recipes
 * @param {Object} targets
 * @returns {Array<{day: string, status: string, message: string}>}
 */
export function validateMealPlan(mealPlan, recipes, targets) {
  if (!mealPlan || !Array.isArray(recipes) || !targets) {
    return [];
  }

  const weekly = calculateWeeklyNutrition(mealPlan, recipes);
  const results = [];

  Object.entries(weekly.daily).forEach(([day, nutrition]) => {
    if (nutrition.calories === 0) {
      results.push({
        day,
        status: 'empty',
        message: 'No meals planned for this day',
      });
      return;
    }

    const issues = [];

    if (nutrition.calories > (targets.calories || 0) * 1.2) {
      issues.push('Calories significantly above target');
    } else if (nutrition.calories < (targets.calories || 0) * 0.6) {
      issues.push('Calories significantly below target');
    }

    if (nutrition.protein < (targets.protein || 0) * 0.5) {
      issues.push('Protein may be too low');
    }

    if (issues.length > 0) {
      results.push({
        day,
        status: 'warning',
        message: issues.join('; '),
      });
    } else {
      results.push({
        day,
        status: 'good',
        message: 'Nutrition looks balanced',
      });
    }
  });

  return results;
}
