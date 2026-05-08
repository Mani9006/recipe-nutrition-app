import React, { useState, useCallback } from 'react';

/**
 * SearchFilter Component
 * Provides search input, filter dropdowns, and tag selection for recipe browsing.
 */
function SearchFilter({
  searchQuery,
  setSearchQuery,
  activeFilters,
  filterOptions,
  updateFilter,
  resetFilters,
  toggleTagFilter,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = useCallback(
    (e) => {
      if (setSearchQuery) {
        setSearchQuery(e.target.value);
      }
    },
    [setSearchQuery]
  );

  const handleClearSearch = useCallback(() => {
    if (setSearchQuery) {
      setSearchQuery('');
    }
  }, [setSearchQuery]);

  const handleCategoryChange = useCallback(
    (e) => {
      if (updateFilter) {
        updateFilter('category', e.target.value);
      }
    },
    [updateFilter]
  );

  const handleCuisineChange = useCallback(
    (e) => {
      if (updateFilter) {
        updateFilter('cuisine', e.target.value);
      }
    },
    [updateFilter]
  );

  const handleDifficultyChange = useCallback(
    (e) => {
      if (updateFilter) {
        updateFilter('difficulty', e.target.value);
      }
    },
    [updateFilter]
  );

  const handleMaxCaloriesChange = useCallback(
    (e) => {
      if (updateFilter) {
        const value = e.target.value;
        updateFilter('maxCalories', value ? parseInt(value, 10) : null);
      }
    },
    [updateFilter]
  );

  const handleMaxTimeChange = useCallback(
    (e) => {
      if (updateFilter) {
        const value = e.target.value;
        updateFilter('maxPrepTime', value ? parseInt(value, 10) : null);
      }
    },
    [updateFilter]
  );

  const handleReset = useCallback(() => {
    if (resetFilters) {
      resetFilters();
    }
  }, [resetFilters]);

  // Count active filters
  const activeFilterCount = [
    activeFilters?.category,
    activeFilters?.cuisine,
    activeFilters?.difficulty,
    activeFilters?.maxCalories,
    activeFilters?.maxPrepTime,
  ].filter(Boolean).length + (activeFilters?.tags?.length || 0);

  return (
    <div className="search-filter">
      {/* Search bar */}
      <div className="search-bar">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search recipes, ingredients, cuisines..."
          value={searchQuery || ''}
          onChange={handleSearchChange}
          aria-label="Search recipes"
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Category filter */}
            <div className="filter-group">
              <label htmlFor="filter-category">Category</label>
              <select
                id="filter-category"
                value={activeFilters?.category || ''}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {(filterOptions?.categories || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Cuisine filter */}
            <div className="filter-group">
              <label htmlFor="filter-cuisine">Cuisine</label>
              <select
                id="filter-cuisine"
                value={activeFilters?.cuisine || ''}
                onChange={handleCuisineChange}
              >
                <option value="">All Cuisines</option>
                {(filterOptions?.cuisines || []).map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty filter */}
            <div className="filter-group">
              <label htmlFor="filter-difficulty">Difficulty</label>
              <select
                id="filter-difficulty"
                value={activeFilters?.difficulty || ''}
                onChange={handleDifficultyChange}
              >
                <option value="">Any Difficulty</option>
                {(filterOptions?.difficulties || []).map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Max calories */}
            <div className="filter-group">
              <label htmlFor="filter-calories">Max Calories</label>
              <select
                id="filter-calories"
                value={activeFilters?.maxCalories || ''}
                onChange={handleMaxCaloriesChange}
              >
                <option value="">No Limit</option>
                <option value="200">Under 200</option>
                <option value="300">Under 300</option>
                <option value="400">Under 400</option>
                <option value="500">Under 500</option>
                <option value="600">Under 600</option>
                <option value="800">Under 800</option>
              </select>
            </div>

            {/* Max time */}
            <div className="filter-group">
              <label htmlFor="filter-time">Max Time (min)</label>
              <select
                id="filter-time"
                value={activeFilters?.maxPrepTime || ''}
                onChange={handleMaxTimeChange}
              >
                <option value="">No Limit</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hour</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          {filterOptions?.tags && filterOptions.tags.length > 0 && (
            <div className="filter-tags">
              <span className="filter-label">Dietary Tags:</span>
              <div className="tag-filters">
                {filterOptions.tags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-filter-btn ${
                      activeFilters?.tags?.includes(tag) ? 'active' : ''
                    }`}
                    onClick={() => toggleTagFilter && toggleTagFilter(tag)}
                    aria-pressed={activeFilters?.tags?.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeFilterCount > 0 && (
            <button className="btn-reset-filters" onClick={handleReset}>
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
