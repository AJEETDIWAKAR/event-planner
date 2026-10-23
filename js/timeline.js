/**
 * Event timeline and milestone schedule generator.
 */

import { sanitizeText } from './security.js';
import { DEFAULT_TIMELINES } from './data/default-data.js';

export function buildTimelineSchedule(eventType = 'wedding', eventDate = '', customTimeline = []) {
  const source =
    Array.isArray(customTimeline) && customTimeline.length > 0
      ? customTimeline
      : DEFAULT_TIMELINES[eventType] || DEFAULT_TIMELINES.wedding;

  return source.map((item, idx) => ({
    id: `milestone-${idx + 1}`,
    phase: sanitizeText(item.phase, 60) || `Phase ${idx + 1}`,
    timeframe: sanitizeText(item.timeframe, 50) || 'Scheduled',
    task: sanitizeText(item.task, 180),
    eventDate: sanitizeText(eventDate, 20),
    completed: Boolean(item.completed),
  }));
}

export function calculateDaysRemaining(eventDateString, referenceDate = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(eventDateString))) {
    return 0;
  }
  const target = new Date(`${eventDateString}T00:00:00Z`);
  const current = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate()
    )
  );
  const diffMs = target.getTime() - current.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Toggles a milestone's completed flag (immutable).
 * @param {Array<Record<string, any>>} items
 * @param {string} id
 */
export function toggleMilestone(items = [], id) {
  return items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
}

/**
 * @param {Array<{completed?: boolean}>} items
 */
export function getTimelineProgress(items = []) {
  const total = items.length;
  const done = items.filter((item) => item.completed).length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}
