import React, { useMemo } from 'react';
import {
  scaleNutrition,
  calculateMacroPercentages,
  estimateGlycemicInfo,
} from '../utils/nutritionCalculator';

/**
 * NutritionPanel Component
 * Displays detailed nutrition information with visual macro breakdown.
 */
function NutritionPanel({ nutritionPerServing, servings = 1 }) {
  const scaled = useMemo(
    () => scaleNutrition(nutritionPerServing, servings),
    [nutritionPerServing, servings]
  );

  const macros = useMemo(
    () => calculateMacroPercentages(scaled),
    [scaled]
  );

  const glycemicInfo = useMemo(
    () => estimateGlycemicInfo(scaled),
    [scaled]
  );

  if (!nutritionPerServing || typeof nutritionPerServing !== 'object') {
    return (
      <div className="nutrition-panel">
        <p className="empty-nutrition">No nutrition data available.</p>
      </div>
    );
  }

  // Macro color mapping
  const macroColors = {
    protein: '#2196F3',
    carbs: '#FF9800',
    fat: '#F44336',
  };

  return (
    <div className="nutrition-panel">
      {/* Calories */}
      <div className="nutrition-calories">
        <span className="calories-value">{scaled.calories}</span>
        <span className="calories-unit">calories</span>
        {servings > 1 && (
          <span className="calories-serving">
            {' '}
            ({nutritionPerServing.calories || 0} per serving)
          </span>
        )}
      </div>

      {/* Macro breakdown bars */}
      <div className="macro-breakdown">
        <h4>Macro Breakdown</h4>

        {/* Visual bar */}
        <div className="macro-bar" role="img" aria-label={`Macro breakdown: ${macros.proteinPercent}% protein, ${macros.carbsPercent}% carbs, ${macros.fatPercent}% fat`}>
          {macros.proteinPercent > 0 && (
            <div
              className="macro-segment macro-protein"
              style={{ width: `${macros.proteinPercent}%` }}
            />
          )}
          {macros.carbsPercent > 0 && (
            <div
              className="macro-segment macro-carbs"
              style={{ width: `${macros.carbsPercent}%` }}
            />
          )}
          {macros.fatPercent > 0 && (
            <div
              className="macro-segment macro-fat"
              style={{ width: `${macros.fatPercent}%` }}
            />
          )}
        </div>

        {/* Macro legend */}
        <div className="macro-legend">
          <div className="macro-legend-item">
            <span
              className="macro-dot"
              style={{ backgroundColor: macroColors.protein }}
            />
            <span className="macro-name">Protein</span>
            <span className="macro-value">{scaled.protein}g</span>
            <span className="macro-percent">({macros.proteinPercent}%)</span>
          </div>
          <div className="macro-legend-item">
            <span
              className="macro-dot"
              style={{ backgroundColor: macroColors.carbs }}
            />
            <span className="macro-name">Carbs</span>
            <span className="macro-value">{scaled.carbs}g</span>
            <span className="macro-percent">({macros.carbsPercent}%)</span>
          </div>
          <div className="macro-legend-item">
            <span
              className="macro-dot"
              style={{ backgroundColor: macroColors.fat }}
            />
            <span className="macro-name">Fat</span>
            <span className="macro-value">{scaled.fat}g</span>
            <span className="macro-percent">({macros.fatPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Detailed nutrition grid */}
      <div className="nutrition-grid">
        <div className="nutrition-item">
          <span className="nutrition-label">Protein</span>
          <span className="nutrition-value">{scaled.protein}g</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">Carbohydrates</span>
          <span className="nutrition-value">{scaled.carbs}g</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">Fat</span>
          <span className="nutrition-value">{scaled.fat}g</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">Fiber</span>
          <span className="nutrition-value">{scaled.fiber}g</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">Sugar</span>
          <span className="nutrition-value">{scaled.sugar}g</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">Sodium</span>
          <span className="nutrition-value">{scaled.sodium}mg</span>
        </div>
      </div>

      {/* Glycemic info */}
      <div className="glycemic-info">
        <span className="glycemic-label">Glycemic Impact:</span>
        <span className={`glycemic-badge glycemic-${glycemicInfo.load.toLowerCase()}`}>
          {glycemicInfo.load}
        </span>
        <span className="glycemic-note">{glycemicInfo.label}</span>
      </div>

      {/* Per-serving note */}
      {servings > 1 && (
        <p className="serving-note">
          Values shown for {servings} servings. Per serving: {nutritionPerServing.calories || 0}{' '}
          cal, {nutritionPerServing.protein || 0}g protein
        </p>
      )}
    </div>
  );
}

export default NutritionPanel;
