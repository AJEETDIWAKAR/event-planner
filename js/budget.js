/**
 * Budget allocation, recalculation, and analytics module.
 */

import { sanitizeText } from './security.js';

const DEFAULT_SPLITS = {
  wedding: [
    { category: 'Venue & Catering', percentage: 45, notes: 'Includes banquet hall and per-plate menu' },
    { category: 'Photography & Videography', percentage: 15, notes: 'Pre-event shoot and main coverage' },
    { category: 'Decor, Floral & Lighting', percentage: 15, notes: 'Stage setup and entrance theme' },
    { category: 'Attire, Makeup & Styling', percentage: 10, notes: 'Bridal/Groom outfits and artists' },
    { category: 'Entertainment & Music', percentage: 8, notes: 'DJ, sound system, and live performers' },
    { category: 'Emergency Buffer & Misc', percentage: 7, notes: 'Last-minute logistics and tips' },
  ],
  birthday: [
    { category: 'Venue & Food/Catering', percentage: 40, notes: 'Buffet, snacks, and beverage station' },
    { category: 'Custom Cake & Desserts', percentage: 15, notes: 'Theme centerpiece cake and dessert bar' },
    { category: 'Theme Decor & Balloons', percentage: 18, notes: 'Backdrop, photo booth, and table setup' },
    { category: 'Entertainment & Games', percentage: 15, notes: 'Host, DJ, or activity stations' },
    { category: 'Return Gifts & Invites', percentage: 12, notes: 'Personalized party favors for guests' },
  ],
  community: [
    { category: 'Venue, Tent & Seating', percentage: 35, notes: 'Ground booking, stage, and chairs' },
    { category: 'Refreshments & Water', percentage: 25, notes: 'Hygienic food stalls and hydration points' },
    { category: 'Sound, AV & Lighting', percentage: 18, notes: 'PA system, microphones, and banners' },
    { category: 'Permits, Safety & First Aid', percentage: 12, notes: 'Local permissions, security, and medical kit' },
    { category: 'Outreach & Volunteer Kits', percentage: 10, notes: 'Posters, badges, and sanitation supplies' },
  ],
};

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

  const totalPercent = template.reduce((sum, item) => sum + (Number(item.percentage) || 10), 0) || 100;

  let percentUsed = 0;
  let allocatedUsed = 0;
  return template.map((item, idx) => {
    const isLast = idx === template.length - 1;
    const percentage = isLast
      ? 100 - percentUsed
      : Math.round(((Number(item.percentage) || 10) / totalPercent) * 100);
    const allocated = isLast ? safeTotal - allocatedUsed : Math.round((safeTotal * percentage) / 100);
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
