# NutriChef

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" />
  <img src="https://img.shields.io/badge/Mobile--First-Optimized-4CAF50" alt="Mobile-First" />
</p>

<p align="center">
  <b>A mobile-first recipe browser, nutrition calculator, and meal planner</b>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#setup">Setup</a> •
  <a href="#usage">Usage</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api">API</a>
</p>

---

## Features

### Recipe Browser
- **52 hand-curated recipes** with complete nutrition data
- Full-text search across titles, descriptions, ingredients, and cuisines
- Multi-faceted filtering: category, cuisine, difficulty, calories, prep time
- Dietary tag filtering (vegan, high-protein, low-carb, etc.)
- Featured and recently viewed sections

### Recipe Detail
- Complete ingredient lists with scalable servings
- Step-by-step cooking instructions
- Detailed nutrition panel with macro breakdown
- Glycemic impact estimation
- One-tap add to meal plan

### Nutrition Calculator
- Per-serving and scaled nutrition calculations
- Macro percentage visualization (protein, carbs, fat)
- Custom daily targets based on user profile (gender, weight, activity, goal)
- Mifflin-St Jeor equation for BMR calculation
- Remaining nutrition tracking

### Meal Planner
- Weekly 7-day meal planner with breakfast, lunch, dinner, snack slots
- Visual day navigation with calorie summaries
- Recipe picker with category filtering
- Weekly nutrition aggregation and daily validation
- Gap detection for missing meals

### Shopping List
- Auto-generated from meal plan with consolidated ingredients
- Smart categorization (produce, protein, dairy, grains, etc.)
- Check-off items with visual progress
- Custom item addition
- Cost estimation

### Calorie Tracker
- Real-time calorie and macro tracking from meal plan
- Circular progress ring for daily calories
- Macro progress bars (protein, carbs, fat, fiber)
- Weekly average overview
- Custom target editor with profile-based auto-calculation

### Favorites
- Save favorite recipes with one-tap heart icon
- Favorites summary stats (avg calories, protein, cook time)
- Tag frequency analysis

### PWA Features
- Installable as a standalone app
- Works offline with service worker caching
- Responsive design optimized for mobile (up to desktop)
- Web App Manifest with app shortcuts

---

## Demo

> Screenshots will be added here.

| Browser | Recipe Detail | Meal Planner | Nutrition Tracker |
|---------|---------------|--------------|-------------------|
| TBD | TBD | TBD | TBD |

---

## Setup

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nutrichef.git
cd nutrichef

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`. Open it on your mobile device or use browser DevTools mobile emulation.

### Build for Production

```bash
# Create optimized production build
npm run build

# Serve the PWA
npx serve -s build
```

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Lint

```bash
npm run lint
```

---

## Usage

### Browsing Recipes
1. Open the app - the **Browse** tab is active by default
2. Use the search bar to find recipes by name, ingredient, or cuisine
3. Tap the filter icon to refine by category, difficulty, calories, or dietary tags
4. Tap on any recipe card to view full details

### Viewing Recipe Details
1. From the recipe grid, tap a recipe card
2. View ingredients, instructions, and nutrition tabs
3. Adjust servings with the +/- buttons - ingredients scale automatically
4. Tap the heart icon to add to favorites
5. Tap "Add to Meal Plan" to schedule the recipe

### Planning Meals
1. Navigate to the **Planner** tab
2. Select a day from the day tabs
3. Tap "Add Breakfast/Lunch/Dinner" on an empty slot
4. Select a recipe from the picker
5. View daily and weekly nutrition summaries

### Using the Shopping List
1. After planning meals, go to the **Shopping** tab
2. Your list is auto-generated from planned recipes
3. Tap checkboxes as you shop
4. Add custom items with the "Add Item" button

### Tracking Nutrition
1. Go to the **Tracker** tab
2. View your daily calorie ring and macro progress
3. Tap "Targets" to customize your nutrition goals
4. Set your profile (gender, weight, activity) for auto-calculated targets

### Managing Favorites
1. Tap the heart icon on any recipe to favorite it
2. Go to the **Favorites** tab to see all saved recipes
3. Tap the heart again to remove from favorites

---

## Architecture

The application is built with a modular, component-based architecture:

```
src/
  components/     # React UI components (10 components)
  data/           # 52-recipe database with full nutrition
  hooks/          # Custom React hooks (3 hooks)
  utils/          # Pure utility functions (3 modules)
  styles/         # Mobile-first CSS
```

Key architectural decisions:

| Decision | Rationale |
|----------|-----------|
| **Custom hooks over Redux** | Local state + localStorage sufficient for this scope |
| **Static recipe data** | No API dependency, works fully offline |
| **CSS over CSS-in-JS** | Simpler, smaller bundle, no runtime overhead |
| **React.memo on cards** | Prevents unnecessary re-renders during filtering |
| **PWA approach** | Installable, offline-capable, app-like experience |

For full architecture documentation, see [docs/architecture.md](docs/architecture.md).

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.2 |
| Language | JavaScript (ES6+) |
| Styling | Plain CSS with CSS Variables |
| Testing | Jest, React Testing Library |
| Build Tool | Create React App |
| PWA | Service Worker, Web App Manifest |
| State | React useState/useMemo/useCallback |
| Persistence | localStorage |

---

## Project Structure

```
project_17_recipe_nutrition/
src/
  components/
    App.js              # Root with navigation
    RecipeBrowser.js    # Recipe discovery
    RecipeCard.js       # Recipe preview card
    RecipeDetail.js     # Full recipe view
    SearchFilter.js     # Search and filter UI
    NutritionPanel.js   # Nutrition visualization
    MealPlanner.js      # Weekly planner
    ShoppingList.js     # Shopping list
    CalorieTracker.js   # Nutrition tracking
    Favorites.js        # Favorites collection
  data/
    recipes.json        # 52 recipes database
  hooks/
    useLocalStorage.js  # Storage sync
    useRecipes.js       # Recipe management
    useMealPlan.js      # Meal plan state
  utils/
    nutritionCalculator.js # Nutrition engine
    mealPlanner.js         # Planner helpers
    shoppingList.js        # List generation
  styles/
    app.css             # All styles
  index.js              # Entry point
public/
  index.html          # HTML shell
  manifest.json       # PWA manifest
  icons/              # App icons
tests/
  test_nutritionCalculator.js
  test_mealPlanner.js
  test_shoppingList.js
docs/
  architecture.md
package.json
README.md
LICENSE
.gitignore
```

---

## API Reference

### useRecipes Hook

```js
const {
  recipes,           // Array - all recipes
  filteredRecipes,   // Array - filtered by search/filters
  searchQuery,       // String - current search
  setSearchQuery,    // Function - update search
  activeFilters,     // Object - current filters
  filterOptions,     // Object - available filter values
  updateFilter,      // Function(key, value) - set filter
  resetFilters,      // Function - clear all filters
  toggleTagFilter,   // Function(tag) - toggle dietary tag
  getRecipeById,     // Function(id) -> recipe
  toggleFavorite,    // Function(recipeId)
  isFavorite,        // Function(recipeId) -> boolean
  favoriteRecipes,   // Array - favorited recipes
  addRecentlyViewed, // Function(recipeId)
  recentlyViewedRecipes, // Array
} = useRecipes();
```

### useMealPlan Hook

```js
const {
  mealPlan,          // Object - weekly plan
  daysOfWeek,        // Array - day names
  mealTypes,         // Array - ['breakfast', 'lunch', 'dinner', 'snack']
  assignMeal,        // Function(day, mealType, recipeId, servings)
  removeMeal,        // Function(day, mealType)
  clearWeek,         // Function - clear all
  getDayMeals,       // Function(day) -> Array
  calculateDayNutrition, // Function(day, recipes) -> NutritionValues
} = useMealPlan();
```

### Nutrition Calculator Utils

```js
import {
  scaleNutrition,           // (nutrition, servings) -> scaledNutrition
  sumNutrition,             // (nutrition[]) -> totalNutrition
  calculateMacroPercentages, // (nutrition) -> {protein%, carbs%, fat%}
  calculateRemaining,       // (consumed, targets) -> remaining
  calculateProgress,        // (consumed, targets) -> progress%
  getDefaultTargets,        // (goal, gender, weight, activity) -> targets
} from './utils/nutritionCalculator';
```

### Shopping List Utils

```js
import {
  generateShoppingList,     // (mealPlan, recipes) -> {categories, items, totalItems}
  consolidateIngredients,   // (ingredients[]) -> consolidated[]
  categorizeIngredient,     // (name) -> category
  estimateCost,             // (items) -> {estimatedTotal, currency}
} from './utils/shoppingList';
```

---

## Future Improvements

- [ ] **Cloud sync** - Multi-device data synchronization
- [ ] **Recipe photos** - Image upload or API integration
- [ ] **Barcode scanner** - Quick ingredient logging
- [ ] **Social features** - Share recipes and meal plans
- [ ] **AI recommendations** - Smart recipe suggestions
- [ ] **Export** - PDF meal plans and shopping lists
- [ ] **Cooking timers** - In-app step timers
- [ ] **Dark mode** - Theme switching
- [ ] **Localization** - Multiple language support
- [ ] **Voice search** - Hands-free recipe discovery

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with care for healthy eating and home cooking.
</p>
