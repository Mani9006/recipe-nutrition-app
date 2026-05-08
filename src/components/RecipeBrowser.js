import React, { useMemo } from 'react';
import SearchFilter from './SearchFilter';
import RecipeCard from './RecipeCard';

/**
 * RecipeBrowser Component
 * Main recipe discovery view with search, filtering, and recipe grid.
 */
function RecipeBrowser({
  recipes,
  searchQuery,
  setSearchQuery,
  activeFilters,
  filterOptions,
  updateFilter,
  resetFilters,
  toggleTagFilter,
  onRecipeClick,
  onToggleFavorite,
  isFavorite,
  recentlyViewedRecipes,
}) {
  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    activeFilters?.category ||
    activeFilters?.cuisine ||
    activeFilters?.difficulty ||
    (activeFilters?.tags && activeFilters.tags.length > 0) ||
    activeFilters?.maxCalories ||
    activeFilters?.maxPrepTime;

  // Featured recipes (high protein, reasonable calories)
  const featuredRecipes = useMemo(() => {
    if (!recipes || recipes.length === 0) return [];

    const scored = recipes
      .filter((r) => r.nutritionPerServing?.protein > 15)
      .sort((a, b) => {
        const scoreA = a.nutritionPerServing?.protein || 0;
        const scoreB = b.nutritionPerServing?.protein || 0;
        return scoreB - scoreA;
      });

    return scored.slice(0, 5);
  }, [recipes]);

  // Quick categories for easy browsing
  const quickCategories = [
    { name: 'breakfast', icon: '🍳', label: 'Breakfast' },
    { name: 'lunch', icon: '🥗', label: 'Lunch' },
    { name: 'dinner', icon: '🍽️', label: 'Dinner' },
    { name: 'snack', icon: '🍎', label: 'Snacks' },
  ];

  const handleQuickCategory = (category) => {
    if (updateFilter) {
      updateFilter('category', category);
    }
  };

  return (
    <div className="recipe-browser">
      {/* Search and Filters */}
      <SearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilters={activeFilters}
        filterOptions={filterOptions}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        toggleTagFilter={toggleTagFilter}
      />

      {/* Quick categories */}
      {!hasActiveFilters && (
        <div className="quick-categories">
          {quickCategories.map((cat) => (
            <button
              key={cat.name}
              className="quick-category-btn"
              onClick={() => handleQuickCategory(cat.name)}
              aria-label={`Filter by ${cat.label}`}
            >
              <span className="category-emoji">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Featured section (only when no filters active) */}
      {!hasActiveFilters && featuredRecipes.length > 0 && (
        <section className="featured-section" aria-label="Featured high-protein recipes">
          <h2 className="section-title">Featured: High Protein</h2>
          <div className="recipe-grid recipe-grid-horizontal">
            {featuredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={onRecipeClick}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite(recipe.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed (only when no filters active) */}
      {!hasActiveFilters && recentlyViewedRecipes && recentlyViewedRecipes.length > 0 && (
        <section className="recent-section" aria-label="Recently viewed recipes">
          <h2 className="section-title">Recently Viewed</h2>
          <div className="recipe-grid recipe-grid-horizontal">
            {recentlyViewedRecipes.slice(0, 5).map((recipe) => (
              <RecipeCard
                key={`recent-${recipe.id}`}
                recipe={recipe}
                onClick={onRecipeClick}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite(recipe.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recipe grid */}
      <section className="recipes-section" aria-label="Recipe results">
        <div className="section-header">
          <h2 className="section-title">
            {hasActiveFilters ? 'Filtered Results' : 'All Recipes'}
          </h2>
          <span className="results-count">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</span>
        </div>

        {recipes.length > 0 ? (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={onRecipeClick}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite(recipe.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>No recipes found matching your criteria.</p>
            <button className="btn-primary" onClick={resetFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default RecipeBrowser;
