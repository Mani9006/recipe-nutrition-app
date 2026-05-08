import React, { useState } from 'react';
import NutritionPanel from './NutritionPanel';

/**
 * RecipeDetail Component
 * Full recipe view with ingredients, instructions, nutrition info,
 * and meal plan assignment options.
 */
function RecipeDetail({
  recipe,
  isFavorite,
  onToggleFavorite,
  onBack,
  onAssignToMealPlan,
}) {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [servings, setServings] = useState(recipe?.servings || 1);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [plannerDay, setPlannerDay] = useState('Monday');
  const [plannerMeal, setPlannerMeal] = useState('lunch');

  if (!recipe) {
    return (
      <div className="empty-state">
        <p>Recipe not found.</p>
        <button className="btn-primary" onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  const {
    id,
    title,
    description,
    category,
    cuisine,
    prepTime,
    cookTime,
    difficulty,
    tags,
    ingredients,
    steps,
    nutritionPerServing,
    image,
  } = recipe;

  const totalTime = (Number(prepTime) || 0) + (Number(cookTime) || 0);
  const servingsMultiplier = servings / (recipe.servings || 1);

  const handleServingsChange = (delta) => {
    setServings((prev) => Math.max(1, Math.min(20, prev + delta)));
  };

  const handleAddToPlan = () => {
    if (onAssignToMealPlan) {
      onAssignToMealPlan(plannerDay, plannerMeal);
    }
    setShowPlannerModal(false);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
  ];

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#999';
    }
  };

  return (
    <div className="recipe-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={onBack} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <button
          className={`detail-favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
          onClick={() => onToggleFavorite && onToggleFavorite(id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Image placeholder */}
      <div className="detail-image">
        <div className="detail-image-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {image && <span className="detail-image-label">{title}</span>}
        </div>
      </div>

      {/* Title section */}
      <div className="detail-title-section">
        <h1 className="detail-title">{title}</h1>
        {description && <p className="detail-description">{description}</p>}

        {/* Meta badges */}
        <div className="detail-meta">
          <span className="meta-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {totalTime}m total
          </span>
          <span className="meta-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {recipe.servings || 1} servings
          </span>
          {cuisine && (
            <span className="meta-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {cuisine}
            </span>
          )}
          {difficulty && (
            <span
              className="meta-badge"
              style={{ color: getDifficultyColor(), borderColor: getDifficultyColor() }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              {difficulty}
            </span>
          )}
        </div>

        {/* Tags */}
        {Array.isArray(tags) && tags.length > 0 && (
          <div className="detail-tags">
            {tags.map((tag) => (
              <span key={tag} className="detail-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Servings adjuster */}
      <div className="servings-control">
        <span className="servings-label">Servings:</span>
        <div className="servings-buttons">
          <button
            className="servings-btn"
            onClick={() => handleServingsChange(-1)}
            disabled={servings <= 1}
            aria-label="Decrease servings"
          >
            -
          </button>
          <span className="servings-value" aria-live="polite">
            {servings}
          </span>
          <button
            className="servings-btn"
            onClick={() => handleServingsChange(1)}
            disabled={servings >= 20}
            aria-label="Increase servings"
          >
            +
          </button>
        </div>
        <span className="servings-note">
          Original: {recipe.servings || 1}
          {servings !== (recipe.servings || 1) && (
            <span className="servings-multiplier">
              {' '}
              (x{servingsMultiplier.toFixed(1)})
            </span>
          )}
        </span>
      </div>

      {/* Add to meal plan button */}
      <button
        className="btn-add-to-plan"
        onClick={() => setShowPlannerModal(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="20" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
        Add to Meal Plan
      </button>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`detail-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
          onClick={() => setActiveTab('ingredients')}
        >
          Ingredients
        </button>
        <button
          className={`detail-tab ${activeTab === 'instructions' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructions')}
        >
          Instructions
        </button>
        <button
          className={`detail-tab ${activeTab === 'nutrition' ? 'active' : ''}`}
          onClick={() => setActiveTab('nutrition')}
        >
          Nutrition
        </button>
      </div>

      {/* Tab content */}
      <div className="detail-tab-content">
        {/* Ingredients tab */}
        {activeTab === 'ingredients' && (
          <div className="ingredients-section">
            <p className="ingredients-count">
              {ingredients?.length || 0} ingredients
            </p>
            <ul className="ingredients-list">
              {Array.isArray(ingredients) &&
                ingredients.map((ing, index) => {
                  const scaledAmount =
                    (Number(ing.amount) || 0) * servingsMultiplier;
                  const displayAmount =
                    scaledAmount % 1 === 0
                      ? scaledAmount.toString()
                      : scaledAmount.toFixed(2).replace(/\.?0+$/, '');

                  return (
                    <li key={index} className="ingredient-item">
                      <span className="ingredient-bullet">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </span>
                      <span className="ingredient-amount">
                        {displayAmount} {ing.unit || ''}
                      </span>
                      <span className="ingredient-name">{ing.name}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}

        {/* Instructions tab */}
        {activeTab === 'instructions' && (
          <div className="instructions-section">
            <p className="instructions-count">
              {steps?.length || 0} steps
            </p>
            <ol className="instructions-list">
              {Array.isArray(steps) &&
                steps.map((step, index) => (
                  <li key={index} className="instruction-step">
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{step}</span>
                  </li>
                ))}
            </ol>
            {/* Prep/cook time breakdown */}
            <div className="time-breakdown">
              {prepTime > 0 && (
                <div className="time-block">
                  <span className="time-block-label">Prep</span>
                  <span className="time-block-value">{prepTime} min</span>
                </div>
              )}
              {cookTime > 0 && (
                <div className="time-block">
                  <span className="time-block-label">Cook</span>
                  <span className="time-block-value">{cookTime} min</span>
                </div>
              )}
              <div className="time-block total-time">
                <span className="time-block-label">Total</span>
                <span className="time-block-value">{totalTime} min</span>
              </div>
            </div>
          </div>
        )}

        {/* Nutrition tab */}
        {activeTab === 'nutrition' && (
          <NutritionPanel
            nutritionPerServing={nutritionPerServing}
            servings={servings}
          />
        )}
      </div>

      {/* Meal Plan Modal */}
      {showPlannerModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPlannerModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Add to meal plan"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add to Meal Plan</h3>
              <button
                className="modal-close"
                onClick={() => setShowPlannerModal(false)}
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="plan-day">Day</label>
                <select
                  id="plan-day"
                  value={plannerDay}
                  onChange={(e) => setPlannerDay(e.target.value)}
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="plan-meal">Meal</label>
                <select
                  id="plan-meal"
                  value={plannerMeal}
                  onChange={(e) => setPlannerMeal(e.target.value)}
                >
                  {mealTypes.map((meal) => (
                    <option key={meal.value} value={meal.value}>
                      {meal.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="modal-note">
                Adding <strong>{title}</strong> to{' '}
                <strong>{plannerDay}</strong> for{' '}
                <strong>
                  {mealTypes.find((m) => m.value === plannerMeal)?.label}
                </strong>
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowPlannerModal(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddToPlan}>
                Add to Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeDetail;
