/**
 * Budget tracker view rendering module.
 */

import { el, fmtCurrency } from './dom-utils.js';
import { calculateBudgetSummary } from '../budget.js';

/**
 * Renders the budget tracker section into the provided DOM containers.
 * @param {HTMLElement} listEl - Container for budget item rows
 * @param {HTMLElement} summaryEl - Paragraph showing total spent, budget, remaining
 * @param {number} totalBudget - Total planned budget amount
 * @param {Array<object>} budgetItems - List of category allocations
 * @param {(itemId: string, newSpent: string) => void} [onSpentChange] - Callback when spent input changes
 */
export function renderBudget(listEl, summaryEl, totalBudget, budgetItems = [], onSpentChange) {
  const doc = listEl?.ownerDocument || summaryEl?.ownerDocument || globalThis.document;
  const s = calculateBudgetSummary(totalBudget, budgetItems);

  if (summaryEl) {
    summaryEl.textContent = `Spent ${fmtCurrency(s.totalSpent)} of ${fmtCurrency(s.totalBudget)} (${s.utilizationPercent}%). Remaining: ${fmtCurrency(s.remaining)}${s.isOverBudget ? ' - OVER BUDGET' : ''}`;
    summaryEl.className = s.isOverBudget ? 'over' : '';
  }

  if (!listEl) return;
  listEl.replaceChildren();

  budgetItems.forEach((item) => {
    const row = el('div', undefined, 'budget-row', doc);
    row.append(
      el(
        'strong',
        `${item.category} (${item.percentage}%) - ${fmtCurrency(item.allocated)}`,
        undefined,
        doc
      ),
      el('p', item.notes, 'muted', doc)
    );

    const label = el('label', `Spent on ${item.category}`, undefined, doc);
    label.htmlFor = `spent-${item.id}`;

    const input = doc.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.id = `spent-${item.id}`;
    input.value = String(item.spent);
    if (typeof onSpentChange === 'function') {
      input.addEventListener('change', () => {
        onSpentChange(item.id, input.value);
      });
    }

    const bar = doc.createElement('progress');
    bar.max = Math.max(1, item.allocated);
    bar.value = Math.min(item.spent, bar.max);

    row.append(label, input, bar);
    listEl.append(row);
  });
}
