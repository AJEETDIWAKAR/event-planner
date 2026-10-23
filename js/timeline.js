/**
 * Event timeline and milestone schedule generator.
 */

import { sanitizeText } from './security.js';
import { DEFAULT_TIMELINES } from './data/default-data.js';

/**
 * @typedef {object} Milestone
 * @property {string} id - Unique identifier for the milestone
 * @property {string} phase - Project phase name (e.g. Foundation, Core Vendors)
 * @property {string} timeframe - Relative or absolute target timeframe
 * @property {string} task - Description of the milestone task
 * @property {string} eventDate - Target celebration date
 * @property {boolean} completed - Whether the milestone is done
 */

/**
 * @typedef {object} TimelineProgress
 * @property {number} total - Total milestones count
 * @property {number} done - Count of completed milestones
 * @property {number} percent - Percentage completed (0-100)
 */

/**
 * Builds milestone schedule from custom breakdown or default templates.
 * @param {'wedding' | 'birthday' | 'community'} [eventType='wedding'] - Celebration type
 * @param {string} [eventDate=''] - Target date string
 * @param {Array<{phase?: string, timeframe?: string, task?: string, completed?: boolean}>} [customTimeline=[]]
 * @returns {Milestone[]}
 */
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

/**
 * Calculates remaining calendar days between reference date and event date string.
 * @param {string} eventDateString - ISO date string (YYYY-MM-DD)
 * @param {Date} [referenceDate=new Date()] - Reference date
 * @returns {number} Non-negative integer count of days remaining
 */
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
 * Toggles a milestone's completed flag immutably.
 * @param {Milestone[]} [items=[]] - Current milestones list
 * @param {string} id - Milestone id to toggle
 * @returns {Milestone[]} Updated milestones array
 */
export function toggleMilestone(items = [], id) {
  return items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
}

/**
 * Calculates completion progress statistics for the milestone schedule.
 * @param {Array<{completed?: boolean}>} [items=[]] - Milestones list
 * @returns {TimelineProgress}
 */
export function getTimelineProgress(items = []) {
  const total = items.length;
  const done = items.filter((item) => item.completed).length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}
