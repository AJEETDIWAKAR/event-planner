import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimelineSchedule, calculateDaysRemaining } from '../js/timeline.js';

test('default timelines exist for each type', () => {
  assert.equal(buildTimelineSchedule('wedding', '2027-01-01').length, 5);
  assert.equal(buildTimelineSchedule('birthday').length, 4);
  assert.equal(buildTimelineSchedule('community').length, 4);
});

test('calculateDaysRemaining', () => {
  const ref = new Date('2027-01-01T10:00:00Z');
  assert.equal(calculateDaysRemaining('2027-01-11', ref), 10);
  assert.equal(calculateDaysRemaining('2026-01-01', ref), 0);
  assert.equal(calculateDaysRemaining('nope', ref), 0);
});

import { toggleMilestone, getTimelineProgress } from '../js/timeline.js';

test('toggleMilestone and progress', () => {
  let items = buildTimelineSchedule('birthday');
  assert.equal(getTimelineProgress(items).percent, 0);
  items = toggleMilestone(items, 'milestone-1');
  items = toggleMilestone(items, 'milestone-2');
  assert.deepEqual(getTimelineProgress(items), { total: 4, done: 2, percent: 50 });
  items = toggleMilestone(items, 'milestone-1');
  assert.equal(getTimelineProgress(items).done, 1);
});
