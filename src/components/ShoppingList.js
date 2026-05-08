import React, { useState, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  generateShoppingList,
  toggleItemChecked,
  addCustomItem,
  removeShoppingItem,
  clearCheckedItems,
  getUncheckedCount,
  estimateCost,
  formatIngredientAmount,
  getCategoryLabel,
} from '../utils/shoppingList';

/**
 * ShoppingList Component
 * Displays an organized shopping list generated from the meal plan
 * with check-off functionality and manual item management.
 */
function ShoppingList({ mealPlan, recipes }) {
  const [customItems, setCustomItems] = useLocalStorage('nutrichef_shopping_custom', []);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Generate shopping list from meal plan
  const generatedList = useMemo(
    () => generateShoppingList(mealPlan, recipes),
    [mealPlan, recipes]
  );

  // Combined items (generated + custom)
  const allItems = useMemo(() => {
    const generated = generatedList.items || [];
    const custom = Array.isArray(customItems) ? customItems : [];
    return [...generated, ...custom];
  }, [generatedList, customItems]);

  // Checked state
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const stored = localStorage.getItem('nutrichef_shopping_checked');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Organize items by category
  const itemsByCategory = useMemo(() => {
    const map = new Map();

    allItems.forEach((item, index) => {
      // Use the item's category from generated list or determine it
      let category = item.category || 'other';

      // For items that came from the generated list, they should have category
      // For custom items, we need to categorize
      if (item.isCustom) {
        // Simple categorization for custom items
        const name = (item.name || '').toLowerCase();
        if (name.match(/(chicken|beef|fish|salmon|shrimp|tofu|egg)/)) category = 'protein';
        else if (name.match(/(milk|cheese|yogurt|butter|cream)/)) category = 'dairy';
        else if (name.match(/(apple|banana|lettuce|tomato|onion|garlic)/)) category = 'produce';
        else if (name.match(/(rice|pasta|bread|oats|flour)/)) category = 'grains';
        else if (name.match(/(oil|sauce|vinegar|salt|pepper)/)) category = 'condiments';
      }

      if (!map.has(category)) {
        map.set(category, []);
      }

      map.get(category).push({ ...item, originalIndex: index });
    });

    // Sort categories
    const categoryOrder = ['produce', 'protein', 'dairy', 'grains', 'canned', 'frozen', 'condiments', 'spices', 'baking', 'other'];
    const sorted = new Map();
    categoryOrder.forEach((cat) => {
      if (map.has(cat)) {
        sorted.set(cat, map.get(cat));
      }
    });
    // Add any remaining categories
    map.forEach((items, cat) => {
      if (!sorted.has(cat)) {
        sorted.set(cat, items);
      }
    });

    return sorted;
  }, [allItems]);

  const uncheckedCount = useMemo(() => getUncheckedCount(allItems), [allItems]);
  const costEstimate = useMemo(() => estimateCost(allItems), [allItems]);

  const toggleChecked = useCallback(
    (index) => {
      setCheckedItems((prev) => {
        const updated = prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index];

        try {
          localStorage.setItem('nutrichef_shopping_checked', JSON.stringify(updated));
        } catch {
          // Ignore
        }

        return updated;
      });
    },
    []
  );

  const handleAddCustomItem = useCallback(() => {
    const trimmed = (newItemName || '').trim();
    if (!trimmed) return;

    const updated = addCustomItem(
      customItems,
      trimmed,
      parseFloat(newItemAmount) || 1,
      newItemUnit
    );
    setCustomItems(updated);
    setNewItemName('');
    setNewItemAmount('');
    setNewItemUnit('');
    setShowAddForm(false);
  }, [newItemName, newItemAmount, newItemUnit, customItems, setCustomItems]);

  const handleClearChecked = useCallback(() => {
    setCheckedItems([]);
    try {
      localStorage.removeItem('nutrichef_shopping_checked');
    } catch {
      // Ignore
    }
  }, []);

  const toggleCategory = useCallback((category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Expand first category by default
  useState(() => {
    const firstCategory = itemsByCategory.keys().next().value;
    if (firstCategory) {
      setExpandedCategories(new Set([firstCategory]));
    }
  });

  if (!generatedList.totalItems && customItems.length === 0) {
    return (
      <div className="shopping-list">
        <h2 className="section-title">Shopping List</h2>
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2L3 7v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-6-5z" />
            <polyline points="3 7 21 7" />
            <line x1="16" y1="11" x2="16" y2="17" />
            <line x1="8" y1="11" x2="8" y2="17" />
            <line x1="12" y1="11" x2="12" y2="17" />
          </svg>
          <p>Your shopping list is empty.</p>
          <p className="empty-hint">Add recipes to your meal plan to generate a list.</p>
          <button
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add Custom Item
          </button>

          {showAddForm && (
            <div className="add-item-form-inline">
              <input
                type="text"
                placeholder="Item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                aria-label="Item name"
              />
              <input
                type="number"
                placeholder="Qty"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                aria-label="Amount"
                min="0"
                step="0.5"
              />
              <input
                type="text"
                placeholder="Unit"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                aria-label="Unit"
              />
              <button className="btn-primary" onClick={handleAddCustomItem}>
                Add
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-list">
      <div className="shopping-header">
        <h2 className="section-title">Shopping List</h2>
        <div className="shopping-meta">
          <span className="shopping-count">
            {uncheckedCount} item{uncheckedCount !== 1 ? 's' : ''} remaining
          </span>
          <span className="shopping-estimate">
            Est. ${costEstimate.estimatedTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="shopping-actions">
        <button
          className="btn-add-item"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Item
        </button>
        <button className="btn-clear-checked" onClick={handleClearChecked}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Uncheck All
        </button>
      </div>

      {/* Add item form */}
      {showAddForm && (
        <div className="add-item-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
              aria-label="Item name"
              autoFocus
            />
            <input
              type="number"
              placeholder="Qty"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              aria-label="Amount"
              min="0"
              step="0.5"
            />
            <input
              type="text"
              placeholder="Unit"
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              aria-label="Unit"
            />
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleAddCustomItem}>
              Add to List
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="shopping-categories">
        {Array.from(itemsByCategory.entries()).map(([category, items]) => (
          <div key={category} className="shopping-category">
            <button
              className="category-header"
              onClick={() => toggleCategory(category)}
              aria-expanded={expandedCategories.has(category)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`category-chevron ${expandedCategories.has(category) ? 'expanded' : ''}`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="category-name">{getCategoryLabel(category)}</span>
              <span className="category-count">({items.length})</span>
            </button>

            {expandedCategories.has(category) && (
              <ul className="shopping-items">
                {items.map((item, idx) => {
                  const originalIndex = item.originalIndex;
                  const isChecked = checkedItems.includes(originalIndex);

                  return (
                    <li
                      key={`${category}-${idx}`}
                      className={`shopping-item ${isChecked ? 'checked' : ''}`}
                    >
                      <button
                        className={`item-checkbox ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleChecked(originalIndex)}
                        aria-label={`${isChecked ? 'Uncheck' : 'Check'} ${item.name}`}
                        aria-checked={isChecked}
                        role="checkbox"
                      >
                        {isChecked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>

                      <span className="item-amount">
                        {formatIngredientAmount(item.amount, item.unit)}
                      </span>

                      <span
                        className="item-name"
                        onClick={() => toggleChecked(originalIndex)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleChecked(originalIndex);
                          }
                        }}
                      >
                        {item.name}
                      </span>

                      {item.isCustom && (
                        <button
                          className="item-remove"
                          onClick={() => {
                            const updated = removeShoppingItem(customItems, items.indexOf(item));
                            setCustomItems(updated);
                          }}
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}

                      {item.recipeTitle && !item.isCustom && (
                        <span className="item-source">{item.recipeTitle}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="shopping-footer">
        <div className="shopping-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${allItems.length > 0 ? ((allItems.length - uncheckedCount) / allItems.length) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="progress-label">
            {allItems.length - uncheckedCount} of {allItems.length} checked
          </span>
        </div>
      </div>
    </div>
  );
}

export default ShoppingList;
