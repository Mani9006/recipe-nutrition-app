import React, { memo } from 'react';

/**
 * RecipeCard Component
 * Displays a recipe preview card with image placeholder, title, and quick nutrition info.
 */
const RecipeCard = memo(function RecipeCard({
  recipe,
  onClick,
  onToggleFavorite,
  isFavorite,
}) {
  if (!recipe || typeof recipe !== 'object') {
    return null;
  }

  const {
    id,
    title = 'Untitled Recipe',
    description = '',
    category = '',
    cuisine = '',
    prepTime = 0,
    cookTime = 0,
    servings = 1,
    difficulty = '',
    tags = [],
    nutritionPerServing = {},
    image = '',
  } = recipe;

  const totalTime = (Number(prepTime) || 0) + (Number(cookTime) || 0);
  const calories = nutritionPerServing?.calories || 0;
  const protein = nutritionPerServing?.protein || 0;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite && id) {
      onToggleFavorite(id);
    }
  };

  const handleCardClick = () => {
    if (onClick && id) {
      onClick(id);
    }
  };

  // Difficulty badge color
  const getDifficultyClass = () => {
    switch (difficulty) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return '';
    }
  };

  return (
    <article
      className="recipe-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Recipe: ${title}`}
    >
      {/* Image placeholder */}
      <div className="recipe-card-image">
        <div className="recipe-image-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {image && <span className="recipe-image-label">{image.replace(/-/g, ' ')}</span>}
        </div>
        <button
          className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {difficulty && (
          <span className={`difficulty-badge ${getDifficultyClass()}`}>
            {difficulty}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{title}</h3>
        {description && (
          <p className="recipe-card-description">
            {description.length > 80 ? `${description.substring(0, 80)}...` : description}
          </p>
        )}

        {/* Meta info */}
        <div className="recipe-card-meta">
          <span className="meta-item" aria-label={`Total time: ${totalTime} minutes`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {totalTime}m
          </span>
          <span className="meta-item" aria-label={`${servings} servings`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {servings}
          </span>
          {calories > 0 && (
            <span className="meta-item" aria-label={`${calories} calories per serving`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              {calories} cal
            </span>
          )}
          {protein > 0 && (
            <span className="meta-item meta-protein" aria-label={`${protein}g protein`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              {protein}g
            </span>
          )}
        </div>

        {/* Tags */}
        {Array.isArray(tags) && tags.length > 0 && (
          <div className="recipe-card-tags">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="recipe-tag">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="recipe-tag tag-more">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
});

export default RecipeCard;
