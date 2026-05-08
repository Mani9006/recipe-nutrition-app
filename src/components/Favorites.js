import React from 'react';
import RecipeCard from './RecipeCard';

/**
 * Favorites Component
 * Displays all favorited recipes with management options.
 */
function Favorites({
  recipes,
  onRecipeClick,
  onToggleFavorite,
  isFavorite,
}) {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="favorites">
        <h2 className="section-title">Favorites</h2>
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p>No favorite recipes yet.</p>
          <p className="empty-hint">
            Tap the heart icon on any recipe to add it to your favorites.
          </p>
        </div>
      </div>
    );
  }

  // Nutrition summary of favorites
  const avgCalories =
    Math.round(
      recipes.reduce(
        (sum, r) => sum + (r.nutritionPerServing?.calories || 0),
        0
      ) / recipes.length
    ) || 0;

  const avgProtein =
    Math.round(
      (recipes.reduce(
        (sum, r) => sum + (r.nutritionPerServing?.protein || 0),
        0
      ) /
        recipes.length) *
        10
    ) / 10 || 0;

  const totalCookTime = recipes.reduce(
    (sum, r) => sum + (r.prepTime || 0) + (r.cookTime || 0),
    0
  );

  // Tag breakdown
  const allTags = recipes.flatMap((r) => r.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="favorites">
      <div className="favorites-header">
        <h2 className="section-title">Favorites</h2>
        <span className="favorites-count">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Summary stats */}
      <div className="favorites-stats">
        <div className="fav-stat">
          <span className="fav-stat-value">{avgCalories}</span>
          <span className="fav-stat-label">avg cal</span>
        </div>
        <div className="fav-stat">
          <span className="fav-stat-value">{avgProtein}g</span>
          <span className="fav-stat-label">avg protein</span>
        </div>
        <div className="fav-stat">
          <span className="fav-stat-value">{Math.round(totalCookTime / recipes.length)}m</span>
          <span className="fav-stat-label">avg time</span>
        </div>
      </div>

      {/* Top tags */}
      {topTags.length > 0 && (
        <div className="favorites-tags">
          {topTags.map(([tag, count]) => (
            <span key={tag} className="fav-tag">
              {tag} ({count})
            </span>
          ))}
        </div>
      )}

      {/* Recipe grid */}
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
    </div>
  );
}

export default Favorites;
