import React, { useState, useMemo } from 'react';
import {
  calculateWeeklyNutrition,
  findMealPlanGaps,
  validateMealPlan,
  getMealTypeLabel,
  hasAnyMeals,
  countTotalMeals,
} from '../utils/mealPlanner';
import { getDefaultTargets } from '../utils/nutritionCalculator';

/**
 * MealPlanner Component
 * Weekly meal planning interface with drag-and-drop style recipe assignment.
 */
function MealPlanner({
  mealPlan,
  daysOfWeek,
  mealTypes,
  recipes,
  assignMeal,
  removeMeal,
  clearWeek,
  getDayMeals,
  calculateDayNutrition,
  onRecipeClick,
}) {
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0]);
  const [showRecipePicker, setShowRecipePicker] = useState(null); // { day, mealType }
  const [filterCategory, setFilterCategory] = useState('');
  const [weeklyTargets] = useState(() => getDefaultTargets('maintain', 'male', 70, 1.375));

  // Weekly nutrition summary
  const weeklyNutrition = useMemo(
    () => calculateWeeklyNutrition(mealPlan, recipes),
    [mealPlan, recipes]
  );

  // Validation results
  const validation = useMemo(
    () => validateMealPlan(mealPlan, recipes, weeklyTargets),
    [mealPlan, recipes, weeklyTargets]
  );

  // Gaps in plan
  const gaps = useMemo(() => findMealPlanGaps(mealPlan), [mealPlan]);

  // Filtered recipes for picker
  const filteredRecipesForPicker = useMemo(() => {
    if (!Array.isArray(recipes)) return [];
    if (!filterCategory) return recipes;
    return recipes.filter((r) => r.category === filterCategory);
  }, [recipes, filterCategory]);

  const hasMeals = hasAnyMeals(mealPlan);
  const totalMeals = countTotalMeals(mealPlan);

  const handleAssign = (recipeId) => {
    if (showRecipePicker) {
      assignMeal(showRecipePicker.day, showRecipePicker.mealType, recipeId, 1);
      setShowRecipePicker(null);
    }
  };

  const handleRemove = (day, mealType) => {
    removeMeal(day, mealType);
  };

  const getValidationForDay = (day) => {
    return validation.find((v) => v.day === day);
  };

  const getRecipeForSlot = (day, mealType) => {
    const slot = mealPlan[day]?.[mealType];
    if (!slot?.recipeId) return null;
    return recipes.find((r) => r.id === slot.recipeId) || null;
  };

  const getDayTotalCalories = (day) => {
    const nutrition = calculateDayNutrition(day, recipes);
    return nutrition.calories || 0;
  };

  return (
    <div className="meal-planner">
      {/* Header */}
      <div className="planner-header">
        <h2 className="section-title">Weekly Meal Plan</h2>
        <div className="planner-stats">
          <span className="stat-badge">{totalMeals} meals planned</span>
          {hasMeals && (
            <span className="stat-badge">
              {weeklyNutrition.average?.calories || 0} cal/day avg
            </span>
          )}
        </div>
      </div>

      {/* Clear button */}
      {hasMeals && (
        <button className="btn-clear-week" onClick={clearWeek}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Clear Week
        </button>
      )}

      {/* Weekly summary */}
      {hasMeals && (
        <div className="weekly-summary">
          <h3 className="summary-title">Weekly Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Avg Daily</span>
              <span className="summary-value">
                {weeklyNutrition.average?.calories || 0} cal
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg Protein</span>
              <span className="summary-value">
                {weeklyNutrition.average?.protein || 0}g
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg Carbs</span>
              <span className="summary-value">
                {weeklyNutrition.average?.carbs || 0}g
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg Fat</span>
              <span className="summary-value">
                {weeklyNutrition.average?.fat || 0}g
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gaps warning */}
      {gaps.length > 0 && (
        <div className="gaps-warning">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {gaps.length} day{gaps.length > 1 ? 's' : ''} missing main meals
        </div>
      )}

      {/* Day tabs */}
      <div className="day-tabs">
        {daysOfWeek.map((day) => {
          const dayCalories = getDayTotalCalories(day);
          const dayValidation = getValidationForDay(day);

          return (
            <button
              key={day}
              className={`day-tab ${selectedDay === day ? 'active' : ''} ${dayValidation?.status || ''}`}
              onClick={() => setSelectedDay(day)}
              aria-label={`${day}${dayCalories > 0 ? `, ${dayCalories} calories` : ''}`}
            >
              <span className="day-name">{day.substring(0, 3)}</span>
              {dayCalories > 0 && (
                <span className="day-calories">{dayCalories}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail */}
      <div className="day-detail">
        <div className="day-header">
          <h3 className="day-title">{selectedDay}</h3>
          {getDayTotalCalories(selectedDay) > 0 && (
            <span className="day-total-calories">
              {getDayTotalCalories(selectedDay)} calories
            </span>
          )}
        </div>

        {/* Meal slots */}
        <div className="meal-slots">
          {mealTypes.map((mealType) => {
            const recipe = getRecipeForSlot(selectedDay, mealType);
            const label = getMealTypeLabel(mealType);

            return (
              <div key={mealType} className="meal-slot">
                <div className="meal-slot-header">
                  <span className="meal-slot-label">{label}</span>
                  {recipe && (
                    <span className="meal-slot-calories">
                      {recipe.nutritionPerServing?.calories || 0} cal
                    </span>
                  )}
                </div>

                {recipe ? (
                  <div className="meal-slot-recipe">
                    <div
                      className="meal-recipe-info"
                      onClick={() => onRecipeClick && onRecipeClick(recipe.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRecipeClick && onRecipeClick(recipe.id);
                        }
                      }}
                    >
                      <span className="meal-recipe-title">{recipe.title}</span>
                      <span className="meal-recipe-meta">
                        {recipe.nutritionPerServing?.protein || 0}g protein
                      </span>
                    </div>
                    <button
                      className="meal-remove-btn"
                      onClick={() => handleRemove(selectedDay, mealType)}
                      aria-label={`Remove ${recipe.title} from ${label}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    className="meal-slot-empty"
                    onClick={() => setShowRecipePicker({ day: selectedDay, mealType })}
                    aria-label={`Add recipe to ${label}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add {label}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Day nutrition summary */}
        {getDayTotalCalories(selectedDay) > 0 && (
          <div className="day-nutrition">
            <h4>Daily Nutrition</h4>
            <DayNutritionPanel
              nutrition={calculateDayNutrition(selectedDay, recipes)}
              targets={weeklyTargets}
            />
          </div>
        )}
      </div>

      {/* Recipe picker modal */}
      {showRecipePicker && (
        <div
          className="modal-overlay"
          onClick={() => setShowRecipePicker(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Select a recipe"
        >
          <div className="modal-content modal-recipe-picker" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Add to {showRecipePicker.day} -{' '}
                {getMealTypeLabel(showRecipePicker.mealType)}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowRecipePicker(null)}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Category filter */}
              <div className="picker-filter">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              {/* Recipe list */}
              <div className="picker-recipe-list">
                {filteredRecipesForPicker.length > 0 ? (
                  filteredRecipesForPicker.map((recipe) => (
                    <button
                      key={recipe.id}
                      className="picker-recipe-item"
                      onClick={() => handleAssign(recipe.id)}
                    >
                      <div className="picker-recipe-info">
                        <span className="picker-recipe-title">
                          {recipe.title}
                        </span>
                        <span className="picker-recipe-meta">
                          {recipe.nutritionPerServing?.calories || 0} cal
                          {' | '}
                          {recipe.nutritionPerServing?.protein || 0}g protein
                          {' | '}
                          {recipe.prepTime + recipe.cookTime}m
                        </span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  ))
                ) : (
                  <p className="empty-message">No recipes found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DayNutritionPanel - shows day's nutrition vs targets
 */
function DayNutritionPanel({ nutrition, targets }) {
  if (!nutrition || !targets) return null;

  const items = [
    { label: 'Calories', value: nutrition.calories || 0, target: targets.calories || 0, unit: '' },
    { label: 'Protein', value: nutrition.protein || 0, target: targets.protein || 0, unit: 'g' },
    { label: 'Carbs', value: nutrition.carbs || 0, target: targets.carbs || 0, unit: 'g' },
    { label: 'Fat', value: nutrition.fat || 0, target: targets.fat || 0, unit: 'g' },
    { label: 'Fiber', value: nutrition.fiber || 0, target: targets.fiber || 0, unit: 'g' },
  ];

  return (
    <div className="day-nutrition-grid">
      {items.map((item) => {
        const percent = item.target > 0 ? Math.min(100, Math.round((item.value / item.target) * 100)) : 0;
        const isOver = item.value > item.target;

        return (
          <div key={item.label} className="day-nutrition-item">
            <div className="nutrition-bar-track">
              <div
                className={`nutrition-bar-fill ${isOver ? 'over' : ''}`}
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </div>
            <div className="nutrition-info">
              <span className="nutrition-label">{item.label}</span>
              <span className={`nutrition-value ${isOver ? 'over' : ''}`}>
                {item.value}
                {item.unit} / {item.target}
                {item.unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MealPlanner;
