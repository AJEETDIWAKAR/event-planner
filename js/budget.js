/**
 * Budget allocation, recalculation, and analytics module.
 */

import { sanitizeText } from './security.js';
import { DEFAULT_SPLITS } from './data/default-data.js';

/**
 * Builds budget items. Percentages are normalized and the rounding remainder goes
 * to the last item, so percentages sum to exactly 100 and allocations to the total.
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

export function updateBudgetSpent(items, id, newSpent) {
  const cleanSpent = Math.max(0, Math.round(Number(newSpent) || 0));
  return items.map((item) => (item.id === id ? { ...item, spent: cleanSpent } : item));
}
