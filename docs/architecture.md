# NutriChef Architecture Documentation

## Overview

NutriChef is a mobile-first Progressive Web Application (PWA) built with React that provides recipe browsing, nutrition calculation, meal planning, shopping list generation, and calorie/macro tracking. The application is designed as a single-page application (SPA) with client-side state management and localStorage persistence.

## System Architecture

```
+------------------+     +------------------+     +------------------+
|   Presentation   |---->|     State        |---->|   Persistence    |
|   (Components)   |     |   (Hooks/State)  |     |  (localStorage)  |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+---------------------------------------------------------------+
|                      Business Logic                            |
|            (Utils: Nutrition, Meal Plan, Shopping)            |
+---------------------------------------------------------------+
         |
         v
+------------------+
|   Static Data    |
|  (recipes.json)  |
+------------------+
```

## Directory Structure

```
src/
  components/        # React UI components
    App.js           # Root component, navigation routing
    RecipeBrowser.js # Recipe discovery with search/filter
    RecipeCard.js    # Individual recipe preview card
    RecipeDetail.js  # Full recipe view with tabs
    SearchFilter.js  # Search bar and filter controls
    NutritionPanel.js# Nutrition visualization
    MealPlanner.js   # Weekly meal plan editor
    ShoppingList.js  # Shopping list manager
    CalorieTracker.js# Daily nutrition tracking
    Favorites.js     # Favorite recipes collection
  data/
    recipes.json     # 52 recipes with complete nutrition data
  hooks/
    useLocalStorage.js   # localStorage sync hook
    useRecipes.js        # Recipe data management
    useMealPlan.js       # Meal plan state management
  utils/
    nutritionCalculator.js # Nutrition math & targets
    mealPlanner.js         # Meal plan helpers
    shoppingList.js        # Shopping list generation
  styles/
    app.css          # Complete mobile-first stylesheet
  index.js           # Entry point
```

## Component Hierarchy

```
App
|-- RecipeBrowser (default view)
|   |-- SearchFilter
|   |-- RecipeCard[]
|-- RecipeDetail (dynamic view)
|   |-- NutritionPanel
|-- Favorites
|   |-- RecipeCard[]
|-- MealPlanner
|   |-- DayNutritionPanel
|-- ShoppingList
|-- CalorieTracker
    |-- TargetEditor
```

## Data Flow

### Unidirectional Data Flow
The application follows React's unidirectional data flow pattern:

1. **State lives in hooks** (`useRecipes`, `useMealPlan`, `useLocalStorage`)
2. **Props flow down** from App to child components
3. **Events flow up** via callback props
4. **Side effects** are isolated in hooks and utility functions

### State Management

| State | Location | Persistence |
|-------|----------|-------------|
| Recipe data | `useRecipes` hook (static import) | Static JSON |
| Search query | `useRecipes` hook | Volatile |
| Active filters | `useRecipes` hook | Volatile |
| Favorites | `useRecipes` + `useLocalStorage` | localStorage |
| Recently viewed | `useRecipes` + `useLocalStorage` | localStorage |
| Meal plan | `useMealPlan` + `useLocalStorage` | localStorage |
| Shopping custom items | `useLocalStorage` | localStorage |
| User profile | `useLocalStorage` | localStorage |
| Nutrition targets | `useLocalStorage` | localStorage |

## Module Descriptions

### Components

#### App.js
- Central routing/navigation controller
- Manages `currentView` state for view switching
- Coordinates between useRecipes and useMealPlan hooks
- Renders bottom navigation bar

#### RecipeBrowser.js
- Orchestrates search, filters, and recipe grid display
- Shows featured recipes (high protein) and recently viewed
- Quick category shortcuts for common meal types

#### RecipeCard.js (Memoized)
- Pure display component for recipe preview
- Shows image placeholder, title, time, calories, protein
- Favorite toggle button
- Uses `React.memo` for performance optimization

#### RecipeDetail.js
- Full recipe view with tabbed interface
- Servings adjuster with real-time ingredient scaling
- Add-to-meal-plan modal
- Tab switching between ingredients, instructions, and nutrition

#### SearchFilter.js
- Search input with debounced filtering
- Expandable filter panel (category, cuisine, difficulty, time, calories)
- Tag-based dietary filter chips

#### NutritionPanel.js
- Scaled nutrition display based on servings
- Visual macro breakdown bar and legend
- Detailed nutrition grid (calories, protein, carbs, fat, fiber, sugar, sodium)
- Glycemic impact estimation

#### MealPlanner.js
- Weekly day-by-day meal plan interface
- Day tab navigation with calorie summary
- Empty slot picker with recipe selection modal
- Weekly nutrition summary
- Gap detection and validation

#### ShoppingList.js
- Categorized shopping list from meal plan
- Item check-off functionality
- Custom item addition
- Category-based organization (produce, protein, dairy, etc.)
- Cost estimation and progress tracking

#### CalorieTracker.js
- Daily calorie and macro tracking
- Circular progress ring for remaining calories
- Macro progress bars
- Weekly average summary
- User profile and target editor

#### Favorites.js
- Grid of favorited recipes
- Summary statistics (avg calories, protein, cook time)
- Tag frequency breakdown

### Hooks

#### useLocalStorage.js
- Generic localStorage synchronization
- Handles JSON parse/stringify
- Error handling for corrupted data
- Cross-tab sync via `storage` event listener
- Returns `[value, setValue, removeValue]`

#### useRecipes.js
- Manages recipe search and filtering
- Maintains favorites and recently viewed lists
- Provides filter options from recipe metadata
- Exposes `filteredRecipes`, `favoriteRecipes`, `recentlyViewedRecipes`

#### useMealPlan.js
- Manages weekly meal plan state
- Provides `assignMeal`, `removeMeal`, `clearWeek` operations
- Calculates day nutrition totals
- Sanitizes stored plan data on load

### Utilities

#### nutritionCalculator.js
Core nutrition calculation engine:
- `scaleNutrition()` - Scale per-serving nutrition by servings count
- `sumNutrition()` - Aggregate multiple nutrition objects
- `calculateMacroPercentages()` - Calculate protein/carbs/fat ratios
- `calculateRemaining()` - Remaining nutrition against targets
- `calculateProgress()` - Percentage completion of targets
- `getDefaultTargets()` - Calculate daily targets using Mifflin-St Jeor equation
- `estimateGlycemicInfo()` - Simple glycemic load estimation

#### mealPlanner.js
Meal planning helper functions:
- `calculateWeeklyNutrition()` - Full week nutrition aggregation
- `findMealPlanGaps()` - Detect missing meals
- `validateMealPlan()` - Validate against nutrition targets
- `suggestRecipesForSlot()` - Smart recipe suggestions

#### shoppingList.js
Shopping list generation and management:
- `generateShoppingList()` - Create consolidated list from meal plan
- `consolidateIngredients()` - Merge duplicate ingredients
- `categorizeIngredient()` - Sort ingredients into categories
- `estimateCost()` - Rough price estimation

## PWA Architecture

### Service Worker
- Caches static assets for offline access
- Implements stale-while-revalidate strategy
- Registers via `navigator.serviceWorker.register()`

### Web App Manifest
- `manifest.json` defines app metadata
- Icons at multiple resolutions (72x72 to 512x512)
- Standalone display mode
- Theme color matching brand green
- App shortcuts for quick navigation

### Performance Optimizations
- `React.memo` on RecipeCard to prevent unnecessary re-renders
- `useMemo` for expensive calculations (filtering, nutrition math)
- `useCallback` for stable callback references
- CSS animations use GPU-accelerated transforms
- CSS containment via `contain: layout` patterns

## Responsive Design

### Breakpoints
- **Mobile (default)**: < 480px - Single/double column layouts
- **Tablet**: 481px - 767px - Optimized spacing
- **Desktop**: 768px+ - 3-column recipe grid, centered max-width container

### Mobile-First Approach
- Base styles target mobile devices
- Progressive enhancement via `@media (min-width: ...)` queries
- Touch-friendly tap targets (min 44px)
- Bottom navigation for thumb reachability
- Safe area insets for notched devices

## Error Handling Strategy

1. **Data Validation**: All utility functions validate inputs and return safe defaults
2. **localStorage Safety**: try/catch around all storage operations
3. **Corrupted Data Recovery**: Sanitize functions detect and reset bad data
4. **Graceful Degradation**: Components render empty states when data is missing
5. **Console Logging**: Errors logged in development, suppressed in production

## Testing Strategy

| Layer | Approach | Coverage |
|-------|----------|----------|
| Unit (utils) | Jest | 70%+ branches, functions, lines |
| Integration (hooks) | Jest + Testing Library | State management logic |
| Component | React Testing Library | Rendering, user events |

Test files:
- `tests/test_nutritionCalculator.js` - 14 test suites
- `tests/test_mealPlanner.js` - 8 test suites
- `tests/test_shoppingList.js` - 14 test suites

## Future Enhancements

1. **Server-side storage** - Cloud sync for multi-device access
2. **Image integration** - Recipe photo uploads or API integration
3. **Barcode scanner** - For quick ingredient logging
4. **Social features** - Share recipes, meal plans with friends
5. **AI suggestions** - Smart recipe recommendations based on preferences
6. **Export functionality** - PDF meal plans, shopping lists
7. **Timer integration** - In-app cooking timers per step
