import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBudgetAllocation, calculateBudgetSummary, updateBudgetSpent } from '../js/budget.js';

test('default allocations sum exactly to total and 100%', () => {
  for (const type of ['wedding', 'birthday', 'community']) {
    const items = buildBudgetAllocation(123457, type);
    assert.equal(
      items.reduce((a, i) => a + i.allocated, 0),
      123457
    );
    assert.equal(
      items.reduce((a, i) => a + i.percentage, 0),
      100
    );
  }
});

test('custom breakdown with odd percentages still sums to 100', () => {
  const items = buildBudgetAllocation(100000, 'wedding', [
    { category: 'A', percentage: 33 },
    { category: 'B', percentage: 33 },
    { category: 'C', percentage: 33 },
  ]);
  assert.equal(
    items.reduce((a, i) => a + i.percentage, 0),
    100
  );
  assert.equal(
    items.reduce((a, i) => a + i.allocated, 0),
    100000
  );
});

test('summary and spent update', () => {
  let items = buildBudgetAllocation(100000, 'birthday');
  items = updateBudgetSpent(items, 'budget-1', 30000);
  const s = calculateBudgetSummary(100000, items);
  assert.equal(s.totalSpent, 30000);
  assert.equal(s.remaining, 70000);
  assert.equal(s.isOverBudget, false);
  items = updateBudgetSpent(items, 'budget-2', 90000);
  assert.equal(calculateBudgetSummary(100000, items).isOverBudget, true);
});
