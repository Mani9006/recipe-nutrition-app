import { useCallback, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';

/**
 * @typedef {Object} MealSlot
 * @property {string|null} recipeId - The recipe ID for this slot
 * @property {number} servings - Number of servings planned
 */

/**
 * @typedef {Object} DayPlan
 * @property {MealSlot} breakfast - Breakfast slot
 * @property {MealSlot} lunch - Lunch slot
 * @property {MealSlot} dinner - Dinner slot
 * @property {MealSlot} snack - Snack slot
 */

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_MEAL_SLOTS = {
  breakfast: { recipeId: null, servings: 1 },
  lunch: { recipeId: null, servings: 1 },
  dinner: { recipeId: null, servings: 1 },
  snack: { recipeId: null, servings: 1 },
};

/**
 * Create a default empty week plan
 * @returns {Object<string, DayPlan>}
 */
function createEmptyWeekPlan() {
  const plan = {};
  DAYS_OF_WEEK.forEach((day) => {
    plan[day] = {
      breakfast: { ...DEFAULT_MEAL_SLOTS.breakfast },
      lunch: { ...DEFAULT_MEAL_SLOTS.lunch },
      dinner: { ...DEFAULT_MEAL_SLOTS.dinner },
      snack: { ...DEFAULT_MEAL_SLOTS.snack },
    };
  });
  return plan;
}

/**
 * Validate and sanitize a stored meal plan
 * @param {Object} stored - The stored plan
 * @returns {Object<string, DayPlan>}
 */
function sanitizeMealPlan(stored) {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return createEmptyWeekPlan();
  }

  const sanitized = createEmptyWeekPlan();

  DAYS_OF_WEEK.forEach((day) => {
    if (stored[day] && typeof stored[day] === 'object') {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
        if (
          stored[day][mealType] &&
          typeof stored[day][mealType] === 'object' &&
          typeof stored[day][mealType].recipeId === 'string' &&
          typeof stored[day][mealType].servings === 'number'
        ) {
          sanitized[day][mealType] = {
            recipeId: stored[day][mealType].recipeId,
            servings: Math.max(1, Math.round(stored[day][mealType].servings)),
          };
        }
      });
    }
  });

  return sanitized;
}

/**
 * Custom hook for managing weekly meal plans.
 *
 * @returns {Object} Meal plan management methods and state
 */
function useMealPlan() {
  const [mealPlan, setMealPlan] = useLocalStorage(
    'nutrichef_mealplan',
    createEmptyWeekPlan()
  );

  // Sanitize the meal plan on retrieval
  const safeMealPlan = useMemo(() => {
    return sanitizeMealPlan(mealPlan);
  }, [mealPlan]);

  /**
   * Assign a recipe to a specific day and meal type
   */
  const assignMeal = useCallback(
    (day, mealType, recipeId, servings = 1) => {
      const validDays = DAYS_OF_WEEK.map((d) => d.toLowerCase());
      if (!validDays.includes(day.toLowerCase())) {
        console.warn(`useMealPlan: Invalid day "${day}"`);
        return;
      }

      const validMeals = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (!validMeals.includes(mealType)) {
        console.warn(`useMealPlan: Invalid meal type "${mealType}"`);
        return;
      }

      if (servings < 1 || servings > 20) {
        console.warn(`useMealPlan: Invalid servings "${servings}". Must be 1-20.`);
        return;
      }

      const normalizedDay = DAYS_OF_WEEK.find(
        (d) => d.toLowerCase() === day.toLowerCase()
      );

      setMealPlan((prev) => ({
        ...prev,
        [normalizedDay]: {
          ...prev[normalizedDay],
          [mealType]: {
            recipeId: recipeId || null,
            servings: Math.round(servings),
          },
        },
      }));
    },
    [setMealPlan]
  );

  /**
   * Remove a meal from the plan
   */
  const removeMeal = useCallback(
    (day, mealType) => {
      assignMeal(day, mealType, null, 1);
    },
    [assignMeal]
  );

  /**
   * Clear the entire week plan
   */
  const clearWeek = useCallback(() => {
    setMealPlan(createEmptyWeekPlan());
  }, [setMealPlan]);

  /**
   * Get all recipes scheduled for a specific day
   */
  const getDayMeals = useCallback(
    (day) => {
      const dayPlan = safeMealPlan[day];
      if (!dayPlan) return [];

      return Object.entries(dayPlan)
        .filter(([, slot]) => slot.recipeId !== null)
        .map(([mealType, slot]) => ({
          mealType,
          ...slot,
        }));
    },
    [safeMealPlan]
  );

  /**
   * Get all scheduled meals across the week
   */
  const getAllScheduledMeals = useMemo(() => {
    const meals = [];
    DAYS_OF_WEEK.forEach((day) => {
      const dayMeals = safeMealPlan[day];
      if (dayMeals) {
        Object.entries(dayMeals).forEach(([mealType, slot]) => {
          if (slot.recipeId) {
            meals.push({
              day,
              mealType,
              recipeId: slot.recipeId,
              servings: slot.servings,
            });
          }
        });
      }
    });
    return meals;
  }, [safeMealPlan]);

  /**
   * Calculate total nutrition for a day's meals using recipe lookup
   */
  const calculateDayNutrition = useCallback(
    (day, recipes) => {
      if (!Array.isArray(recipes)) {
        console.warn('useMealPlan: calculateDayNutrition requires recipes array');
        return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      }

      const dayPlan = safeMealPlan[day];
      if (!dayPlan) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      }

      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

      Object.values(dayPlan).forEach((slot) => {
        if (slot.recipeId) {
          const recipe = recipes.find((r) => r.id === slot.recipeId);
          if (recipe && recipe.nutritionPerServing) {
            const servings = slot.servings || 1;
            totals.calories += (recipe.nutritionPerServing.calories || 0) * servings;
            totals.protein += (recipe.nutritionPerServing.protein || 0) * servings;
            totals.carbs += (recipe.nutritionPerServing.carbs || 0) * servings;
            totals.fat += (recipe.nutritionPerServing.fat || 0) * servings;
            totals.fiber += (recipe.nutritionPerServing.fiber || 0) * servings;
          }
        }
      });

      // Round to 1 decimal place
      return {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10,
      };
    },
    [safeMealPlan]
  );

  return {
    mealPlan: safeMealPlan,
    daysOfWeek: DAYS_OF_WEEK,
    mealTypes: ['breakfast', 'lunch', 'dinner', 'snack'],
    assignMeal,
    removeMeal,
    clearWeek,
    getDayMeals,
    getAllScheduledMeals,
    calculateDayNutrition,
  };
}

export default useMealPlan;
