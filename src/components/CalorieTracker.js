import React, { useState, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  calculateDayNutrition,
  calculateMacroPercentages,
  calculateProgress,
  calculateRemaining,
  emptyNutrition,
  getDefaultTargets,
} from '../utils/nutritionCalculator';

/**
 * CalorieTracker Component
 * Daily calorie and macro tracking with progress visualization.
 * Allows setting custom targets and viewing weekly trends.
 */
function CalorieTracker({ mealPlan, recipes, daysOfWeek }) {
  const [userProfile, setUserProfile] = useLocalStorage('nutrichef_profile', {
    gender: 'male',
    weight: 70,
    activityLevel: 1.375,
    goal: 'maintain',
  });

  const [customTargets, setCustomTargets] = useLocalStorage('nutrichef_targets', null);
  const [showTargetEditor, setShowTargetEditor] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay();
    // Convert JS day (0=Sun) to our day names
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayMap[today] || 'Monday';
  });

  // Calculate targets
  const targets = useMemo(() => {
    if (customTargets && typeof customTargets === 'object') {
      return {
        calories: customTargets.calories || 2000,
        protein: customTargets.protein || 150,
        carbs: customTargets.carbs || 250,
        fat: customTargets.fat || 65,
        fiber: customTargets.fiber || 30,
      };
    }
    return getDefaultTargets(
      userProfile?.goal || 'maintain',
      userProfile?.gender || 'male',
      userProfile?.weight || 70,
      userProfile?.activityLevel || 1.375
    );
  }, [customTargets, userProfile]);

  // Calculate nutrition for each day of the week
  const weeklyData = useMemo(() => {
    const data = {};

    daysOfWeek.forEach((day) => {
      if (!mealPlan || !mealPlan[day]) {
        data[day] = emptyNutrition();
        return;
      }

      const dayMeals = [];
      const dayPlan = mealPlan[day];

      Object.values(dayPlan).forEach((slot) => {
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

      data[day] = calculateDayNutrition(dayMeals);
    });

    return data;
  }, [mealPlan, recipes, daysOfWeek]);

  // Selected day's data
  const selectedDayNutrition = weeklyData[selectedDay] || emptyNutrition();
  const macroPercentages = useMemo(
    () => calculateMacroPercentages(selectedDayNutrition),
    [selectedDayNutrition]
  );
  const progress = useMemo(
    () => calculateProgress(selectedDayNutrition, targets),
    [selectedDayNutrition, targets]
  );
  const remaining = useMemo(
    () => calculateRemaining(selectedDayNutrition, targets),
    [selectedDayNutrition, targets]
  );

  // Weekly average
  const weeklyAverage = useMemo(() => {
    const values = Object.values(weeklyData);
    if (values.length === 0) return emptyNutrition();

    const totals = values.reduce(
      (acc, val) => ({
        calories: acc.calories + val.calories,
        protein: acc.protein + val.protein,
        carbs: acc.carbs + val.carbs,
        fat: acc.fat + val.fat,
        fiber: acc.fiber + val.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const daysWithData = values.filter((v) => v.calories > 0).length || 1;

    return {
      calories: Math.round(totals.calories / daysWithData),
      protein: Math.round((totals.protein / daysWithData) * 10) / 10,
      carbs: Math.round((totals.carbs / daysWithData) * 10) / 10,
      fat: Math.round((totals.fat / daysWithData) * 10) / 10,
      fiber: Math.round((totals.fiber / daysWithData) * 10) / 10,
    };
  }, [weeklyData]);

  const handleResetTargets = useCallback(() => {
    setCustomTargets(null);
    setShowTargetEditor(false);
  }, [setCustomTargets]);

  // Get status color based on progress
  const getProgressColor = (percent) => {
    if (percent < 50) return '#4CAF50';
    if (percent < 80) return '#FF9800';
    if (percent <= 100) return '#2196F3';
    return '#F44336';
  };

  return (
    <div className="calorie-tracker">
      <div className="tracker-header">
        <h2 className="section-title">Nutrition Tracker</h2>
        <button
          className="btn-edit-targets"
          onClick={() => setShowTargetEditor(!showTargetEditor)}
          aria-label="Edit nutrition targets"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Targets
        </button>
      </div>

      {/* Target editor */}
      {showTargetEditor && (
        <TargetEditor
          targets={customTargets || targets}
          profile={userProfile}
          setProfile={setUserProfile}
          onSave={(newTargets) => {
            setCustomTargets(newTargets);
            setShowTargetEditor(false);
          }}
          onReset={handleResetTargets}
          onClose={() => setShowTargetEditor(false)}
        />
      )}

      {/* Current targets display */}
      <div className="targets-display">
        <div className="target-item">
          <span className="target-value">{targets.calories}</span>
          <span className="target-label">cal</span>
        </div>
        <div className="target-item">
          <span className="target-value">{targets.protein}g</span>
          <span className="target-label">protein</span>
        </div>
        <div className="target-item">
          <span className="target-value">{targets.carbs}g</span>
          <span className="target-label">carbs</span>
        </div>
        <div className="target-item">
          <span className="target-value">{targets.fat}g</span>
          <span className="target-label">fat</span>
        </div>
        {customTargets && (
          <button className="btn-reset-targets" onClick={handleResetTargets}>
            Reset
          </button>
        )}
      </div>

      {/* Day selector */}
      <div className="tracker-days">
        {daysOfWeek.map((day) => {
          const dayNutrition = weeklyData[day] || emptyNutrition();
          const isActive = day === selectedDay;
          const hasData = dayNutrition.calories > 0;

          return (
            <button
              key={day}
              className={`tracker-day-btn ${isActive ? 'active' : ''} ${hasData ? 'has-data' : ''}`}
              onClick={() => setSelectedDay(day)}
              aria-label={`${day}${hasData ? `, ${dayNutrition.calories} calories` : ''}`}
            >
              <span className="day-short">{day.substring(0, 3)}</span>
              {hasData && (
                <span className="day-cal">
                  {dayNutrition.calories}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main calorie display */}
      <div className="calorie-main">
        <div className="calorie-ring">
          <svg className="calorie-ring-svg" viewBox="0 0 120 120">
            <circle className="ring-bg" cx="60" cy="60" r="50" />
            <circle
              className="ring-progress"
              cx="60"
              cy="60"
              r="50"
              strokeDasharray={`${Math.min(progress.calories, 100) * 3.14} 314`}
              style={{
                stroke: getProgressColor(progress.calories),
              }}
            />
          </svg>
          <div className="calorie-center">
            <span className="calorie-remaining">{remaining.calories}</span>
            <span className="calorie-label">remaining</span>
          </div>
        </div>

        <div className="calorie-consumed">
          <div className="consumed-item">
            <span className="consumed-value">{selectedDayNutrition.calories}</span>
            <span className="consumed-label">consumed</span>
          </div>
          <div className="consumed-item">
            <span className="consumed-value">{targets.calories}</span>
            <span className="consumed-label">goal</span>
          </div>
        </div>
      </div>

      {/* Macro bars */}
      <div className="macro-section">
        <h3 className="macro-title">Macronutrients</h3>

        {/* Protein */}
        <div className="macro-track">
          <div className="macro-header">
            <span className="macro-label">Protein</span>
            <span className="macro-values">
              {selectedDayNutrition.protein}g / {targets.protein}g
            </span>
          </div>
          <div className="macro-bar-track">
            <div
              className="macro-bar-fill"
              style={{
                width: `${Math.min(progress.protein, 100)}%`,
                backgroundColor: '#2196F3',
              }}
            />
          </div>
          <div className="macro-meta">
            <span>{progress.protein}%</span>
            <span>{remaining.protein}g remaining</span>
          </div>
        </div>

        {/* Carbs */}
        <div className="macro-track">
          <div className="macro-header">
            <span className="macro-label">Carbs</span>
            <span className="macro-values">
              {selectedDayNutrition.carbs}g / {targets.carbs}g
            </span>
          </div>
          <div className="macro-bar-track">
            <div
              className="macro-bar-fill"
              style={{
                width: `${Math.min(progress.carbs, 100)}%`,
                backgroundColor: '#FF9800',
              }}
            />
          </div>
          <div className="macro-meta">
            <span>{progress.carbs}%</span>
            <span>{remaining.carbs}g remaining</span>
          </div>
        </div>

        {/* Fat */}
        <div className="macro-track">
          <div className="macro-header">
            <span className="macro-label">Fat</span>
            <span className="macro-values">
              {selectedDayNutrition.fat}g / {targets.fat}g
            </span>
          </div>
          <div className="macro-bar-track">
            <div
              className="macro-bar-fill"
              style={{
                width: `${Math.min(progress.fat, 100)}%`,
                backgroundColor: '#F44336',
              }}
            />
          </div>
          <div className="macro-meta">
            <span>{progress.fat}%</span>
            <span>{remaining.fat}g remaining</span>
          </div>
        </div>

        {/* Fiber */}
        <div className="macro-track">
          <div className="macro-header">
            <span className="macro-label">Fiber</span>
            <span className="macro-values">
              {selectedDayNutrition.fiber}g / {targets.fiber}g
            </span>
          </div>
          <div className="macro-bar-track">
            <div
              className="macro-bar-fill"
              style={{
                width: `${Math.min(progress.fiber, 100)}%`,
                backgroundColor: '#4CAF50',
              }}
            />
          </div>
          <div className="macro-meta">
            <span>{progress.fiber}%</span>
            <span>{remaining.fiber}g remaining</span>
          </div>
        </div>
      </div>

      {/* Macro pie chart representation */}
      <div className="macro-distribution">
        <h3 className="macro-title">Macro Distribution</h3>
        <div className="macro-pie">
          <div className="pie-visual">
            {macroPercentages.proteinPercent > 0 && (
              <div
                className="pie-slice"
                style={{
                  background: `conic-gradient(#2196F3 0% ${macroPercentages.proteinPercent}%, transparent ${macroPercentages.proteinPercent}%)`,
                }}
              />
            )}
            {macroPercentages.carbsPercent > 0 && (
              <div
                className="pie-slice"
                style={{
                  background: `conic-gradient(#FF9800 ${macroPercentages.proteinPercent}% ${macroPercentages.proteinPercent + macroPercentages.carbsPercent}%, transparent ${macroPercentages.proteinPercent + macroPercentages.carbsPercent}%)`,
                }}
              />
            )}
            {macroPercentages.fatPercent > 0 && (
              <div
                className="pie-slice"
                style={{
                  background: `conic-gradient(#F44336 ${macroPercentages.proteinPercent + macroPercentages.carbsPercent}% 100%, transparent 100%)`,
                }}
              />
            )}
          </div>
          <div className="pie-legend">
            <div className="pie-legend-item">
              <span className="pie-dot" style={{ backgroundColor: '#2196F3' }} />
              <span>Protein {macroPercentages.proteinPercent}%</span>
            </div>
            <div className="pie-legend-item">
              <span className="pie-dot" style={{ backgroundColor: '#FF9800' }} />
              <span>Carbs {macroPercentages.carbsPercent}%</span>
            </div>
            <div className="pie-legend-item">
              <span className="pie-dot" style={{ backgroundColor: '#F44336' }} />
              <span>Fat {macroPercentages.fatPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly overview */}
      <div className="weekly-overview">
        <h3 className="macro-title">Weekly Average</h3>
        <div className="weekly-grid">
          <div className="weekly-item">
            <span className="weekly-value">{weeklyAverage.calories}</span>
            <span className="weekly-label">cal/day</span>
          </div>
          <div className="weekly-item">
            <span className="weekly-value">{weeklyAverage.protein}g</span>
            <span className="weekly-label">protein/day</span>
          </div>
          <div className="weekly-item">
            <span className="weekly-value">{weeklyAverage.carbs}g</span>
            <span className="weekly-label">carbs/day</span>
          </div>
          <div className="weekly-item">
            <span className="weekly-value">{weeklyAverage.fat}g</span>
            <span className="weekly-label">fat/day</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TargetEditor sub-component
 */
function TargetEditor({ targets, profile, setProfile, onSave, onReset, onClose }) {
  const [localTargets, setLocalTargets] = useState({ ...targets });
  const [localProfile, setLocalProfile] = useState({ ...profile });

  const handleSave = () => {
    setProfile(localProfile);
    onSave(localTargets);
  };

  const handleChange = (field, value) => {
    setLocalTargets((prev) => ({
      ...prev,
      [field]: Number(value) || 0,
    }));
  };

  const handleProfileChange = (field, value) => {
    setLocalProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="target-editor">
      <div className="editor-section">
        <h4>Profile</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Gender</label>
            <select
              value={localProfile.gender || 'male'}
              onChange={(e) => handleProfileChange('gender', e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              value={localProfile.weight || 70}
              onChange={(e) => handleProfileChange('weight', parseFloat(e.target.value) || 0)}
              min="30"
              max="300"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Activity</label>
            <select
              value={localProfile.activityLevel || 1.375}
              onChange={(e) => handleProfileChange('activityLevel', parseFloat(e.target.value))}
            >
              <option value="1.2">Sedentary</option>
              <option value="1.375">Light Active</option>
              <option value="1.55">Moderate</option>
              <option value="1.725">Very Active</option>
              <option value="1.9">Extra Active</option>
            </select>
          </div>
          <div className="form-group">
            <label>Goal</label>
            <select
              value={localProfile.goal || 'maintain'}
              onChange={(e) => handleProfileChange('goal', e.target.value)}
            >
              <option value="lose">Weight Loss</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Weight Gain</option>
              <option value="muscle">Muscle Gain</option>
            </select>
          </div>
        </div>
      </div>

      <div className="editor-section">
        <h4>Custom Targets (optional)</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Calories</label>
            <input
              type="number"
              value={localTargets.calories || 0}
              onChange={(e) => handleChange('calories', e.target.value)}
              min="500"
              max="10000"
            />
          </div>
          <div className="form-group">
            <label>Protein (g)</label>
            <input
              type="number"
              value={localTargets.protein || 0}
              onChange={(e) => handleChange('protein', e.target.value)}
              min="0"
              max="500"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Carbs (g)</label>
            <input
              type="number"
              value={localTargets.carbs || 0}
              onChange={(e) => handleChange('carbs', e.target.value)}
              min="0"
              max="1000"
            />
          </div>
          <div className="form-group">
            <label>Fat (g)</label>
            <input
              type="number"
              value={localTargets.fat || 0}
              onChange={(e) => handleChange('fat', e.target.value)}
              min="0"
              max="500"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Fiber (g)</label>
            <input
              type="number"
              value={localTargets.fiber || 0}
              onChange={(e) => handleChange('fiber', e.target.value)}
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      <div className="editor-actions">
        <button className="btn-primary" onClick={handleSave}>
          Save Targets
        </button>
        <button className="btn-secondary" onClick={onReset}>
          Auto-Calculate
        </button>
        <button className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CalorieTracker;
