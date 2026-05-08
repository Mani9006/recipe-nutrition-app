/**
 * @jest-environment node
 */

/**
 * Nutrition Calculator Tests
 * Comprehensive test suite for nutrition calculation utilities.
 */

const {
  emptyNutrition,
  sanitizeNutrition,
  scaleNutrition,
  sumNutrition,
  calculateMealNutrition,
  calculateDayNutrition,
  calculateMacroPercentages,
  calculateRemaining,
  calculateProgress,
  formatNutritionValue,
  getDefaultTargets,
  estimateGlycemicInfo,
} = require('../src/utils/nutritionCalculator');

describe('emptyNutrition', () => {
  test('returns zeroed nutrition object', () => {
    const empty = emptyNutrition();
    expect(empty.calories).toBe(0);
    expect(empty.protein).toBe(0);
    expect(empty.carbs).toBe(0);
    expect(empty.fat).toBe(0);
    expect(empty.fiber).toBe(0);
    expect(empty.sugar).toBe(0);
    expect(empty.sodium).toBe(0);
  });
});

describe('sanitizeNutrition', () => {
  test('returns valid nutrition for good input', () => {
    const input = { calories: 100, protein: 10, carbs: 20, fat: 5, fiber: 3, sugar: 4, sodium: 200 };
    const result = sanitizeNutrition(input);
    expect(result.calories).toBe(100);
    expect(result.protein).toBe(10);
  });

  test('handles null input', () => {
    const result = sanitizeNutrition(null);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
  });

  test('handles undefined input', () => {
    const result = sanitizeNutrition(undefined);
    expect(result.calories).toBe(0);
  });

  test('converts string numbers', () => {
    const result = sanitizeNutrition({ calories: '100', protein: '10' });
    expect(result.calories).toBe(100);
    expect(result.protein).toBe(10);
  });

  test('clamps negative values to zero', () => {
    const result = sanitizeNutrition({ calories: -50, protein: -10 });
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
  });

  test('handles NaN values', () => {
    const result = sanitizeNutrition({ calories: NaN, protein: 'abc' });
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
  });
});

describe('scaleNutrition', () => {
  const base = { calories: 200, protein: 20, carbs: 25, fat: 8, fiber: 4, sugar: 5, sodium: 300 };

  test('scales nutrition correctly for servings', () => {
    const result = scaleNutrition(base, 2);
    expect(result.calories).toBe(400);
    expect(result.protein).toBe(40);
    expect(result.carbs).toBe(50);
    expect(result.fat).toBe(16);
  });

  test('returns zeroed nutrition for zero servings', () => {
    const result = scaleNutrition(base, 0);
    expect(result.calories).toBe(0);
  });

  test('returns zeroed nutrition for negative servings', () => {
    const result = scaleNutrition(base, -1);
    expect(result.calories).toBe(0);
  });

  test('returns zeroed nutrition for invalid servings string', () => {
    const result = scaleNutrition(base, 'abc');
    expect(result.calories).toBe(0);
  });

  test('handles null nutrition', () => {
    const result = scaleNutrition(null, 2);
    expect(result.calories).toBe(0);
  });

  test('preserves single serving', () => {
    const result = scaleNutrition(base, 1);
    expect(result.calories).toBe(200);
    expect(result.protein).toBe(20);
  });
});

describe('sumNutrition', () => {
  test('sums multiple nutrition objects', () => {
    const items = [
      { calories: 100, protein: 10, carbs: 15, fat: 5, fiber: 2, sugar: 3, sodium: 100 },
      { calories: 200, protein: 20, carbs: 25, fat: 10, fiber: 4, sugar: 5, sodium: 200 },
      { calories: 150, protein: 15, carbs: 20, fat: 7, fiber: 3, sugar: 4, sodium: 150 },
    ];
    const result = sumNutrition(items);
    expect(result.calories).toBe(450);
    expect(result.protein).toBe(45);
    expect(result.carbs).toBe(60);
    expect(result.fat).toBe(22);
    expect(result.fiber).toBe(9);
  });

  test('returns empty for empty array', () => {
    const result = sumNutrition([]);
    expect(result.calories).toBe(0);
  });

  test('handles invalid array input', () => {
    const result = sumNutrition(null);
    expect(result.calories).toBe(0);
  });

  test('ignores invalid items in array', () => {
    const items = [
      { calories: 100, protein: 10, carbs: 15, fat: 5, fiber: 2, sugar: 3, sodium: 100 },
      null,
      { calories: 200, protein: 20, carbs: 25, fat: 10, fiber: 4, sugar: 5, sodium: 200 },
    ];
    const result = sumNutrition(items);
    expect(result.calories).toBe(300);
  });
});

describe('calculateMealNutrition', () => {
  const recipe = {
    nutritionPerServing: { calories: 300, protein: 25, carbs: 30, fat: 10, fiber: 5, sugar: 8, sodium: 400 },
  };

  test('calculates for default servings', () => {
    const result = calculateMealNutrition(recipe);
    expect(result.calories).toBe(300);
    expect(result.protein).toBe(25);
  });

  test('calculates for multiple servings', () => {
    const result = calculateMealNutrition(recipe, 3);
    expect(result.calories).toBe(900);
    expect(result.protein).toBe(75);
  });

  test('handles invalid recipe', () => {
    const result = calculateMealNutrition(null);
    expect(result.calories).toBe(0);
  });

  test('handles missing nutritionPerServing', () => {
    const result = calculateMealNutrition({});
    expect(result.calories).toBe(0);
  });
});

describe('calculateDayNutrition', () => {
  const meals = [
    {
      recipe: {
        nutritionPerServing: { calories: 400, protein: 30, carbs: 40, fat: 12, fiber: 5, sugar: 6, sodium: 350 },
      },
      servings: 1,
    },
    {
      recipe: {
        nutritionPerServing: { calories: 600, protein: 35, carbs: 55, fat: 20, fiber: 8, sugar: 10, sodium: 500 },
      },
      servings: 1,
    },
    {
      recipe: {
        nutritionPerServing: { calories: 200, protein: 5, carbs: 25, fat: 8, fiber: 3, sugar: 15, sodium: 200 },
      },
      servings: 1,
    },
  ];

  test('calculates daily totals correctly', () => {
    const result = calculateDayNutrition(meals);
    expect(result.calories).toBe(1200);
    expect(result.protein).toBe(70);
    expect(result.carbs).toBe(120);
  });

  test('scales by servings', () => {
    const scaledMeals = [
      { ...meals[0], servings: 2 },
    ];
    const result = calculateDayNutrition(scaledMeals);
    expect(result.calories).toBe(800);
    expect(result.protein).toBe(60);
  });

  test('returns zero for empty meals', () => {
    const result = calculateDayNutrition([]);
    expect(result.calories).toBe(0);
  });

  test('handles invalid input', () => {
    const result = calculateDayNutrition(null);
    expect(result.calories).toBe(0);
  });
});

describe('calculateMacroPercentages', () => {
  test('calculates correct percentages', () => {
    // 100g protein = 400 cal, 100g carbs = 400 cal, 100g fat = 900 cal = 1700 total
    const nutrition = { calories: 1700, protein: 100, carbs: 100, fat: 100, fiber: 10, sugar: 20, sodium: 500 };
    const result = calculateMacroPercentages(nutrition);
    expect(result.proteinPercent).toBe(24); // ~24%
    expect(result.carbsPercent).toBe(24);   // ~24%
    expect(result.fatPercent).toBe(53);     // ~53%
  });

  test('handles zero nutrition', () => {
    const result = calculateMacroPercentages(emptyNutrition());
    expect(result.proteinPercent).toBe(0);
    expect(result.carbsPercent).toBe(0);
    expect(result.fatPercent).toBe(0);
  });

  test('rounds to nearest integer', () => {
    const nutrition = { calories: 100, protein: 10, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
    const result = calculateMacroPercentages(nutrition);
    expect(result.proteinPercent).toBe(100);
  });
});

describe('calculateRemaining', () => {
  const targets = { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 };

  test('calculates remaining correctly', () => {
    const consumed = { calories: 1200, protein: 80, carbs: 150, fat: 40, fiber: 15, sugar: 20, sodium: 500 };
    const result = calculateRemaining(consumed, targets);
    expect(result.calories).toBe(800);
    expect(result.protein).toBe(70);
    expect(result.carbs).toBe(100);
  });

  test('does not go below zero', () => {
    const consumed = { calories: 2500, protein: 200, carbs: 300, fat: 80, fiber: 35, sugar: 20, sodium: 500 };
    const result = calculateRemaining(consumed, targets);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
  });

  test('handles null targets', () => {
    const consumed = { calories: 1000, protein: 50, carbs: 100, fat: 30, fiber: 10, sugar: 10, sodium: 200 };
    const result = calculateRemaining(consumed, null);
    expect(result.calories).toBe(0);
  });
});

describe('calculateProgress', () => {
  const targets = { calories: 2000, protein: 100, carbs: 250, fat: 65, fiber: 30 };

  test('calculates progress percentage', () => {
    const consumed = { calories: 1000, protein: 50, carbs: 125, fat: 32.5, fiber: 15, sugar: 20, sodium: 500 };
    const result = calculateProgress(consumed, targets);
    expect(result.calories).toBe(50);
    expect(result.protein).toBe(50);
  });

  test('caps at 100%', () => {
    const consumed = { calories: 3000, protein: 150, carbs: 400, fat: 100, fiber: 50, sugar: 20, sodium: 500 };
    const result = calculateProgress(consumed, targets);
    expect(result.calories).toBe(100);
    expect(result.protein).toBe(100);
  });

  test('handles zero targets', () => {
    const consumed = { calories: 1000, protein: 50, carbs: 100, fat: 30, fiber: 10, sugar: 10, sodium: 200 };
    const result = calculateProgress(consumed, { calories: 0 });
    expect(result.calories).toBe(0);
  });
});

describe('formatNutritionValue', () => {
  test('formats grams', () => {
    expect(formatNutritionValue(10.5)).toBe('10.5g');
    expect(formatNutritionValue(10)).toBe('10g');
  });

  test('formats calories', () => {
    expect(formatNutritionValue(200, 'calories')).toBe('200 cal');
  });

  test('formats milligrams', () => {
    expect(formatNutritionValue(500, 'mg')).toBe('500 mg');
  });

  test('handles NaN', () => {
    expect(formatNutritionValue(NaN)).toBe('0');
  });
});

describe('getDefaultTargets', () => {
  test('returns targets for male maintenance', () => {
    const result = getDefaultTargets('maintain', 'male', 70, 1.375);
    expect(result.calories).toBeGreaterThan(1000);
    expect(result.protein).toBeGreaterThan(0);
    expect(result.carbs).toBeGreaterThan(0);
    expect(result.fat).toBeGreaterThan(0);
  });

  test('returns targets for female weight loss', () => {
    const result = getDefaultTargets('lose', 'female', 60, 1.2);
    expect(result.calories).toBeGreaterThan(0);
    expect(result.protein).toBeGreaterThan(0);
  });

  test('handles invalid weight', () => {
    const result = getDefaultTargets('maintain', 'male', -10, 1.375);
    expect(result.calories).toBeGreaterThan(1000);
  });

  test('handles invalid activity level', () => {
    const result = getDefaultTargets('maintain', 'male', 70, -1);
    expect(result.calories).toBeGreaterThan(1000);
  });

  test('weight loss has lower calories than maintain', () => {
    const maintain = getDefaultTargets('maintain', 'male', 70, 1.375);
    const lose = getDefaultTargets('lose', 'male', 70, 1.375);
    expect(lose.calories).toBeLessThan(maintain.calories);
  });

  test('muscle gain has higher protein', () => {
    const maintain = getDefaultTargets('maintain', 'male', 70, 1.375);
    const muscle = getDefaultTargets('muscle', 'male', 70, 1.375);
    expect(muscle.protein).toBeGreaterThanOrEqual(maintain.protein);
  });

  test('caps minimum calories at 1200', () => {
    const result = getDefaultTargets('lose', 'female', 30, 1.2);
    expect(result.calories).toBeGreaterThanOrEqual(1200);
  });
});

describe('estimateGlycemicInfo', () => {
  test('returns low for high fiber', () => {
    const result = estimateGlycemicInfo({ calories: 300, protein: 10, carbs: 30, fat: 10, fiber: 10, sugar: 2, sodium: 200 });
    expect(result.load).toBe('Low');
  });

  test('returns high for high sugar low fiber', () => {
    const result = estimateGlycemicInfo({ calories: 300, protein: 2, carbs: 60, fat: 5, fiber: 1, sugar: 40, sodium: 100 });
    expect(result.load).toBe('High');
  });

  test('handles zero carbs', () => {
    const result = estimateGlycemicInfo({ calories: 200, protein: 20, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 100 });
    expect(result.load).toBe('N/A');
  });
});
