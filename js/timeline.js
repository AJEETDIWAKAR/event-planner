/**
 * Event timeline and milestone schedule generator.
 */

import { sanitizeText } from './security.js';

const DEFAULT_TIMELINES = {
  wedding: [
    { phase: 'Foundation', timeframe: '6 Months Prior', task: 'Lock primary venue, guest count estimate, and core budget split' },
    { phase: 'Core Vendors', timeframe: '4 Months Prior', task: 'Book caterer, photographer, and decor design team' },
    { phase: 'Invitations & Attire', timeframe: '2 Months Prior', task: 'Send digital/print invites and finalize outfit fittings' },
    { phase: 'Logistics & RSVP', timeframe: '2 Weeks Prior', task: 'Confirm final headcount with catering and share run-of-show' },
    { phase: 'Final Rehearsal', timeframe: '1 Day Prior', task: 'Verify venue setup, sound check, and emergency kit readiness' },
  ],
  birthday: [
    { phase: 'Concept & Venue', timeframe: '4 Weeks Prior', task: 'Select party theme, guest list, and reserve venue or home zone' },
    { phase: 'Cake & Entertainment', timeframe: '2 Weeks Prior', task: 'Order custom theme cake, book host/DJ, and send invitations' },
    { phase: 'Supplies & Favors', timeframe: '1 Week Prior', task: 'Purchase decor props, return gifts, and confirm RSVP count' },
    { phase: 'Setup & Cue Check', timeframe: 'Day of Event (4 Hours Prior)', task: 'Complete balloon/backdrop installation, music check, and food warming' },
  ],
  community: [
    { phase: 'Permits & Committee', timeframe: '6 Weeks Prior', task: 'Secure municipal permissions, ground booking, and volunteer leads' },
    { phase: 'Sponsorship & Vendors', timeframe: '4 Weeks Prior', task: 'Confirm stage, PA sound system, refreshment stalls, and safety team' },
    { phase: 'Community Outreach', timeframe: '2 Weeks Prior', task: 'Distribute digital posters, schedule announcements, and registration desk' },
    { phase: 'Site Inspection', timeframe: '1 Day Prior', task: 'Inspect seating layout, electrical safety, water stations, and signage' },
  ],
};

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
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate())
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
