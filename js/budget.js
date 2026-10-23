/**
 * Budget allocation, recalculation, and analytics module.
 */

import { sanitizeText } from './security.js';
import { DEFAULT_SPLITS } from './data/default-data.js';

/**
 * @typedef {object} BudgetItem
 * @property {string} id - Unique identifier for the budget row
 * @property {string} category - Budget category name
 * @property {number} percentage - Percentage allocation (sums to 100)
 * @property {number} allocated - Monetary amount allocated
 * @property {number} spent - Monetary amount spent so far
 * @property {string} notes - Recommendation or operational notes
 */

/**
 * @typedef {object} BudgetSummary
 * @property {number} totalBudget - Total planned event budget
 * @property {number} totalAllocated - Sum of all category allocations
 * @property {number} totalSpent - Sum of all expenses logged
 * @property {number} remaining - Leftover funds before hitting budget
 * @property {boolean} isOverBudget - Whether expenses exceed total budget
 * @property {number} utilizationPercent - Percentage of total budget used (0-100)
 */

/**
 * Builds normalized budget items. Percentages are normalized and rounding remainder
 * goes to the final item so percentages sum to exactly 100% and allocations to the total.
 * @param {number | string} totalBudget - Total event budget
 * @param {'wedding' | 'birthday' | 'community'} [eventType='wedding'] - Event category
 * @param {Array<{category?: string, percentage?: number, notes?: string, spent?: number}>} [customBreakdown=[]]
 * @returns {BudgetItem[]}
 */
export function buildBudgetAllocation(totalBudget, eventType = 'wedding', customBreakdown = []) {
  const safeTotal = Math.max(1000, Number(totalBudget) || 50000);
  const template =
    Array.isArray(customBreakdown) && customBreakdown.length > 0
      ? customBreakdown
      : DEFAULT_SPLITS[eventType] || DEFAULT_SPLITS.wedding;

  const totalPercent =
    template.reduce((sum, item) => sum + (Number(item.percentage) || 10), 0) || 100;

  let percentUsed = 0;
  let allocatedUsed = 0;
  return template.map((item, idx) => {
    const isLast = idx === template.length - 1;
    const percentage = isLast
      ? 100 - percentUsed
      : Math.round(((Number(item.percentage) || 10) / totalPercent) * 100);
    const allocated = isLast
      ? safeTotal - allocatedUsed
      : Math.round((safeTotal * percentage) / 100);
    percentUsed += percentage;
    allocatedUsed += allocated;
    return {
      id: `budget-${idx + 1}`,
      category: sanitizeText(item.category, 60) || `Category ${idx + 1}`,
      percentage,
      allocated,
      spent: Number(item.spent) >= 0 ? Math.round(Number(item.spent)) : 0,
      notes: sanitizeText(item.notes || '', 160),
    };
  });
}

/**
 * Calculates current budget utilization metrics and balance.
 * @param {number | string} totalBudget - Total planned budget
 * @param {BudgetItem[]} [items=[]] - Current list of budget items
 * @returns {BudgetSummary}
 */
export function calculateBudgetSummary(totalBudget, items = []) {
  const safeTotal = Math.max(0, Number(totalBudget) || 0);
  const totalAllocated = items.reduce((acc, item) => acc + (Number(item.allocated) || 0), 0);
  const totalSpent = items.reduce((acc, item) => acc + (Number(item.spent) || 0), 0);
  const remaining = safeTotal - totalSpent;
  const utilizationPercent =
    safeTotal > 0 ? Math.min(100, Math.round((totalSpent / safeTotal) * 100)) : 0;
  return {
    totalBudget: safeTotal,
    totalAllocated,
    totalSpent,
    remaining,
    isOverBudget: totalSpent > safeTotal,
    utilizationPercent,
  };
}

/**
 * Immutably updates the spent amount on a specific budget row.
 * @param {BudgetItem[]} items - List of budget items
 * @param {string} id - Item identifier to update
 * @param {number | string} newSpent - New spent amount
 * @returns {BudgetItem[]} New items array with the updated item
 */
export function updateBudgetSpent(items, id, newSpent) {
  const cleanSpent = Math.max(0, Math.round(Number(newSpent) || 0));
  return items.map((item) => (item.id === id ? { ...item, spent: cleanSpent } : item));
}
