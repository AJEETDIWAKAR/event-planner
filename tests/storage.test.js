import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { savePlanState, loadPlanState, clearPlanState } from '../js/storage.js';

beforeEach(() => {
  const mem = new Map();
  globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, v),
    removeItem: (k) => mem.delete(k),
  };
});

test('save, load and clear round trip', () => {
  assert.equal(savePlanState({ eventDetails: { eventName: 'A' }, summary: 'hi', vendors: [1] }), true);
  const loaded = loadPlanState();
  assert.equal(loaded.summary, 'hi');
  assert.deepEqual(loaded.vendors, [1]);
  assert.equal(clearPlanState(), true);
  assert.equal(loadPlanState(), null);
});

test('rejects bad state and survives corrupt data', () => {
  assert.equal(savePlanState(null), false);
  localStorage.setItem('celebration_event_planner_state_v1', '{broken');
  assert.equal(loadPlanState(), null);
});

test('save returns false when storage throws', () => {
  globalThis.localStorage = { setItem() { throw new Error('quota'); } };
  assert.equal(savePlanState({}), false);
});
