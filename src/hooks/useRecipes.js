import { useState, useMemo, useCallback } from 'react';
import recipesData from '../data/recipes.json';
import useLocalStorage from './useLocalStorage';

/**
 * Custom hook for managing recipe data, search, and filtering.
 *
 * @returns {Object} Recipe management methods and state
 */
function useRecipes() {
  const allRecipes = useMemo(() => {
    try {
      if (!recipesData || !Array.isArray(recipesData.recipes)) {
        console.error('useRecipes: Invalid recipe data format');
        return [];
      }
      return recipesData.recipes;
    } catch (error) {
      console.error('useRecipes: Error loading recipes:', error);
      return [];
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    cuisine: '',
    difficulty: '',
    tags: [],
    maxCalories: null,
    maxPrepTime: null,
  });

  const [favorites, setFavorites] = useLocalStorage('nutrichef_favorites', []);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage('nutrichef_recent', []);

  /**
   * Filter recipes based on search query and active filters
   */
  const filteredRecipes = useMemo(() => {
    let results = [...allRecipes];

    // Text search on title, description, and ingredients
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter((recipe) => {
        if (!recipe || typeof recipe.title !== 'string') return false;

        const inTitle = recipe.title.toLowerCase().includes(query);
        const inDescription = (recipe.description || '').toLowerCase().includes(query);
        const inIngredients = (recipe.ingredients || []).some(
          (ing) => ing && ing.name && ing.name.toLowerCase().includes(query)
        );
        const inTags = (recipe.tags || []).some((tag) => tag.toLowerCase().includes(query));
        const inCuisine = (recipe.cuisine || '').toLowerCase().includes(query);

        return inTitle || inDescription || inIngredients || inTags || inCuisine;
      });
    }

    // Category filter
    if (activeFilters.category) {
      results = results.filter((r) => r.category === activeFilters.category);
    }

    // Cuisine filter
    if (activeFilters.cuisine) {
      results = results.filter((r) => r.cuisine === activeFilters.cuisine);
    }

    // Difficulty filter
    if (activeFilters.difficulty) {
      results = results.filter((r) => r.difficulty === activeFilters.difficulty);
    }

    // Tags filter (must include ALL selected tags)
    if (activeFilters.tags && activeFilters.tags.length > 0) {
      results = results.filter((r) =>
        activeFilters.tags.every((tag) => (r.tags || []).includes(tag))
      );
    }

    // Max calories filter
    if (activeFilters.maxCalories && activeFilters.maxCalories > 0) {
      results = results.filter(
        (r) =>
          r.nutritionPerServing &&
          r.nutritionPerServing.calories <= activeFilters.maxCalories
      );
    }

    // Max prep time filter
    if (activeFilters.maxPrepTime && activeFilters.maxPrepTime > 0) {
      results = results.filter(
        (r) => r.prepTime + r.cookTime <= activeFilters.maxPrepTime
      );
    }

    return results;
  }, [allRecipes, searchQuery, activeFilters]);

  /**
   * Get a single recipe by ID
   */
  const getRecipeById = useCallback(
    (id) => {
      if (!id || typeof id !== 'string') return null;
      return allRecipes.find((r) => r.id === id) || null;
    },
    [allRecipes]
  );

  /**
   * Toggle a recipe in favorites
   */
  const toggleFavorite = useCallback(
    (recipeId) => {
      if (!recipeId || typeof recipeId !== 'string') {
        console.warn('toggleFavorite: Invalid recipeId');
        return;
      }

      setFavorites((prev) => {
        if (prev.includes(recipeId)) {
          return prev.filter((id) => id !== recipeId);
        }
        return [...prev, recipeId];
      });
    },
    [setFavorites]
  );

  /**
   * Check if a recipe is favorited
   */
  const isFavorite = useCallback(
    (recipeId) => {
      if (!recipeId || typeof recipeId !== 'string') return false;
      return favorites.includes(recipeId);
    },
    [favorites]
  );

  /**
   * Get favorite recipe objects
   */
  const favoriteRecipes = useMemo(() => {
    return allRecipes.filter((r) => favorites.includes(r.id));
  }, [allRecipes, favorites]);

  /**
   * Add to recently viewed, maintaining max 20 items
   */
  const addRecentlyViewed = useCallback(
    (recipeId) => {
      if (!recipeId || typeof recipeId !== 'string') return;

      setRecentlyViewed((prev) => {
        const filtered = prev.filter((id) => id !== recipeId);
        return [recipeId, ...filtered].slice(0, 20);
      });
    },
    [setRecentlyViewed]
  );

  /**
   * Get recently viewed recipe objects
   */
  const recentlyViewedRecipes = useMemo(() => {
    return recentlyViewed
      .map((id) => allRecipes.find((r) => r.id === id))
      .filter(Boolean);
  }, [recentlyViewed, allRecipes]);

  /**
   * Get unique filter options from all recipes
   */
  const filterOptions = useMemo(() => {
    const categories = [...new Set(allRecipes.map((r) => r.category).filter(Boolean))].sort();
    const cuisines = [...new Set(allRecipes.map((r) => r.cuisine).filter(Boolean))].sort();
    const difficulties = [...new Set(allRecipes.map((r) => r.difficulty).filter(Boolean))].sort();
    const allTags = allRecipes.flatMap((r) => r.tags || []);
    const tags = [...new Set(allTags)].sort();

    return { categories, cuisines, difficulties, tags };
  }, [allRecipes]);

  /**
   * Update a single filter value
   */
  const updateFilter = useCallback((key, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setActiveFilters({
      category: '',
      cuisine: '',
      difficulty: '',
      tags: [],
      maxCalories: null,
      maxPrepTime: null,
    });
    setSearchQuery('');
  }, []);

  /**
   * Toggle a tag in the active filter
   */
  const toggleTagFilter = useCallback((tag) => {
    setActiveFilters((prev) => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) };
      }
      return { ...prev, tags: [...currentTags, tag] };
    });
  }, []);

  return {
    recipes: allRecipes,
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
    favorites,
    favoriteRecipes,
    recentlyViewed,
    recentlyViewedRecipes,
    addRecentlyViewed,
  };
}

export default useRecipes;
