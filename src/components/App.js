import React, { useState, useCallback } from 'react';
import useRecipes from '../hooks/useRecipes';
import useMealPlan from '../hooks/useMealPlan';
import RecipeBrowser from './RecipeBrowser';
import RecipeDetail from './RecipeDetail';
import MealPlanner from './MealPlanner';
import ShoppingList from './ShoppingList';
import CalorieTracker from './CalorieTracker';
import Favorites from './Favorites';
import '../styles/app.css';

/**
 * Main App Component
 * Manages global navigation state and coordinates between all feature modules.
 */
function App() {
  const [currentView, setCurrentView] = useState('browser');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  const {
    filteredRecipes,
    searchQuery,
    setSearchQuery,
    activeFilters,
    filterOptions,
    updateFilter,
    resetFilters,
    toggleTagFilter,
    getRecipeById,
    toggleFavorite,
    isFavorite,
    favoriteRecipes,
    addRecentlyViewed,
    recentlyViewedRecipes,
  } = useRecipes();

  const {
    mealPlan,
    daysOfWeek,
    mealTypes,
    assignMeal,
    removeMeal,
    clearWeek,
    getDayMeals,
    getAllScheduledMeals,
    calculateDayNutrition,
  } = useMealPlan();

  const allRecipes = filteredRecipes;

  // Navigation handlers
  const navigateTo = useCallback((view) => {
    setCurrentView(view);
    if (view !== 'detail') {
      setSelectedRecipeId(null);
    }
  }, []);

  const openRecipeDetail = useCallback(
    (recipeId) => {
      if (!recipeId) return;
      setSelectedRecipeId(recipeId);
      addRecentlyViewed(recipeId);
      setCurrentView('detail');
    },
    [addRecentlyViewed]
  );

  const goBack = useCallback(() => {
    setCurrentView('browser');
    setSelectedRecipeId(null);
  }, []);

  // Render navigation tabs
  const renderNav = () => (
    <nav className="app-nav" role="navigation" aria-label="Main navigation">
      <button
        className={`nav-btn ${currentView === 'browser' || currentView === 'detail' ? 'active' : ''}`}
        onClick={() => navigateTo('browser')}
        aria-label="Browse recipes"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        <span>Browse</span>
      </button>
      <button
        className={`nav-btn ${currentView === 'favorites' ? 'active' : ''}`}
        onClick={() => navigateTo('favorites')}
        aria-label="Favorite recipes"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>Favorites</span>
      </button>
      <button
        className={`nav-btn ${currentView === 'planner' ? 'active' : ''}`}
        onClick={() => navigateTo('planner')}
        aria-label="Meal planner"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>Planner</span>
      </button>
      <button
        className={`nav-btn ${currentView === 'shopping' ? 'active' : ''}`}
        onClick={() => navigateTo('shopping')}
        aria-label="Shopping list"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2L3 7v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-6-5z" />
          <polyline points="3 7 21 7" />
          <line x1="16" y1="11" x2="16" y2="17" />
          <line x1="8" y1="11" x2="8" y2="17" />
          <line x1="12" y1="11" x2="12" y2="17" />
        </svg>
        <span>Shopping</span>
      </button>
      <button
        className={`nav-btn ${currentView === 'tracker' ? 'active' : ''}`}
        onClick={() => navigateTo('tracker')}
        aria-label="Calorie tracker"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span>Tracker</span>
      </button>
    </nav>
  );

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'browser':
        return (
          <RecipeBrowser
            recipes={filteredRecipes}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilters={activeFilters}
            filterOptions={filterOptions}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            toggleTagFilter={toggleTagFilter}
            onRecipeClick={openRecipeDetail}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            recentlyViewedRecipes={recentlyViewedRecipes}
          />
        );

      case 'detail': {
        const recipe = getRecipeById(selectedRecipeId);
        if (!recipe) {
          return (
            <div className="empty-state">
              <p>Recipe not found.</p>
              <button className="btn-primary" onClick={goBack}>
                Go Back
              </button>
            </div>
          );
        }
        return (
          <RecipeDetail
            recipe={recipe}
            isFavorite={isFavorite(recipe.id)}
            onToggleFavorite={toggleFavorite}
            onBack={goBack}
            onAssignToMealPlan={(day, mealType) =>
              assignMeal(day, mealType, recipe.id)
            }
          />
        );
      }

      case 'favorites':
        return (
          <Favorites
            recipes={favoriteRecipes}
            onRecipeClick={openRecipeDetail}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        );

      case 'planner':
        return (
          <MealPlanner
            mealPlan={mealPlan}
            daysOfWeek={daysOfWeek}
            mealTypes={mealTypes}
            recipes={allRecipes}
            assignMeal={assignMeal}
            removeMeal={removeMeal}
            clearWeek={clearWeek}
            getDayMeals={getDayMeals}
            calculateDayNutrition={calculateDayNutrition}
            onRecipeClick={openRecipeDetail}
          />
        );

      case 'shopping':
        return (
          <ShoppingList
            mealPlan={mealPlan}
            recipes={allRecipes}
          />
        );

      case 'tracker':
        return (
          <CalorieTracker
            mealPlan={mealPlan}
            recipes={allRecipes}
            daysOfWeek={daysOfWeek}
          />
        );

      default:
        return (
          <div className="empty-state">
            <p>Page not found.</p>
            <button className="btn-primary" onClick={() => navigateTo('browser')}>
              Go Home
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title" onClick={() => navigateTo('browser')} role="button" tabIndex={0}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            NutriChef
          </h1>
          <p className="app-subtitle">Recipe & Nutrition Tracker</p>
        </div>
      </header>

      <main className="app-main">{renderView()}</main>

      {renderNav()}
    </div>
  );
}

export default App;
