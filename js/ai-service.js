/**
 * GenAI client service connecting to serverless /api/generate-plan with deterministic fallback.
 */

import { validateEventRequest, validateAIPlanSchema } from './security.js';
import { buildBudgetAllocation } from './budget.js';
import { buildTimelineSchedule } from './timeline.js';
import { buildVendorChecklist } from './checklist.js';

let ideaRotationCount = 0;

/**
 * Returns a pool of themed celebration ideas for the specified event parameters.
 * @param {object} sanitizedInput
 * @param {number} [offset=0]
 * @returns {Array<{title: string, category: string, description: string}>}
 */
export function generateDeterministicIdeas(sanitizedInput, offset = 0) {
  const { eventType, eventName, budget, guestCount, preferences } = sanitizedInput;
  const themeNote = preferences
    ? `incorporating "${preferences}"`
    : 'with a modern, guest-friendly flow';
  const perGuest = Math.round(budget / Math.max(1, guestCount));

  const pools = {
    wedding: [
      {
        title: 'Interactive Welcome & Photo Lounge',
        category: 'Theme & Decor',
        description: `Set up a personalized story wall for ${eventName} ${themeNote} with instant QR photo sharing for all ${guestCount} guests.`,
      },
      {
        title: 'Curated Regional Tasting Stations',
        category: 'Catering',
        description: `Optimize the ~${perGuest.toLocaleString('en-IN')} per-guest allocation with 3 live chef counters to reduce buffet queue times.`,
      },
      {
        title: 'Acoustic Sunset Entry & Sangeet Cue',
        category: 'Entertainment',
        description:
          'Coordinate synchronized warm ambient lighting with a 45-minute unplugged musical set during guest arrival.',
      },
      {
        title: 'Digital RSVP & Smart Seating Map',
        category: 'Guest Experience',
        description: `Share a single RSVP link and a seating map so ${guestCount} guests find tables quickly.`,
      },
      {
        title: 'Signature Couple Mocktail Bar',
        category: 'Beverages',
        description:
          'Design 2 customized non-alcoholic botanical welcome drinks named after special relationship milestones.',
      },
      {
        title: 'Eco-Friendly Plantable Favors',
        category: 'Sustainability',
        description: `Gift seed-paper thank-you cards and miniature potted succulents to all ${guestCount} attendees.`,
      },
    ],
    birthday: [
      {
        title: 'Theme Photo Booth Corner',
        category: 'Theme & Decor',
        description: `Build a photo corner for ${eventName} ${themeNote} with props guests can take home.`,
      },
      {
        title: 'Allergy-Aware Snack Menu',
        category: 'Catering',
        description: `Plan ~${perGuest.toLocaleString('en-IN')} per guest with clearly labeled veg, eggless and nut-free options.`,
      },
      {
        title: 'Timed Game Rounds',
        category: 'Entertainment',
        description:
          'Run three 15-minute game rounds with small prizes so every age group stays engaged.',
      },
      {
        title: 'Personalized Return Gifts',
        category: 'Guest Experience',
        description:
          'Add each guest name or a small thank-you note to the return gift for a personal touch.',
      },
      {
        title: 'Custom DIY Cupcake Decor Station',
        category: 'Activities',
        description:
          'Provide pre-baked cupcakes, colorful icing piping bags, and sprinkles for guests to decorate.',
      },
      {
        title: 'Memory Video Reel Projection',
        category: 'Media',
        description:
          'Screen a 3-minute video montage of memorable moments right before the birthday cake cutting ceremony.',
      },
    ],
    community: [
      {
        title: 'Volunteer Welcome Desk',
        category: 'Operations',
        description: `Set up a registration desk with badges to manage ${guestCount} attendees smoothly.`,
      },
      {
        title: 'Hydration & Shade Points',
        category: 'Safety',
        description: `Place water stations and shaded seating ${themeNote} for comfort across the venue.`,
      },
      {
        title: 'Accessible Layout & Ramps',
        category: 'Accessibility',
        description:
          'Keep ramps, wide aisles and reserved seating near entrances for seniors and wheelchair users.',
      },
      {
        title: 'Digital Feedback QR Posters',
        category: 'Community Engagement',
        description: 'Place QR posters for quick feedback so the next event can improve.',
      },
      {
        title: 'Local Artisan Showcase Corner',
        category: 'Community Support',
        description:
          'Designate 4 open tables for neighborhood crafts and local initiative brochures.',
      },
      {
        title: 'Live Acoustic & Folk Segment',
        category: 'Culture & Entertainment',
        description:
          'Host an open-mic or local folk artists showcase to highlight community talent.',
      },
    ],
  };

  const pool = pools[eventType] || pools.wedding;
  const count = 4;
  const start = offset % pool.length;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  return rotated.slice(0, count);
}

/**
 * Generates deterministic fallback event plan when offline or Gemini API is unconfigured.
 * @param {object} sanitizedInput
 * @returns {object} Full plan object
 */
export function generateDeterministicFallbackPlan(sanitizedInput) {
  const { eventType, eventName, budget, guestCount, eventDate, preferences } = sanitizedInput;
  const themeNote = preferences
    ? `incorporating "${preferences}"`
    : 'with a modern, guest-friendly flow';
  const perGuest = Math.round(budget / Math.max(1, guestCount));

  const budgetItems = buildBudgetAllocation(budget, eventType);
  return {
    source: 'demo-fallback',
    summary: `A practical ${eventType} plan for ${eventName} on ${eventDate}: ${guestCount} guests, about ${perGuest.toLocaleString('en-IN')} per guest, ${themeNote}.`,
    personalizedIdeas: generateDeterministicIdeas(sanitizedInput, 0),
    budgetBreakdown: budgetItems.map(({ category, percentage, notes }) => ({
      category,
      percentage,
      notes,
    })),
    timeline: buildTimelineSchedule(eventType, eventDate).map(({ phase, timeframe, task }) => ({
      phase,
      timeframe,
      task,
    })),
    vendors: buildVendorChecklist(eventType).map(({ name, category, priority, tip }) => ({
      name,
      category,
      priority,
      tip,
    })),
  };
}

/**
 * Regenerates only the personalized ideas section, retaining other plan customizations.
 * @param {object} sanitizedInput
 * @param {typeof fetch} [fetchImpl=globalThis.fetch]
 * @returns {Promise<Array<{title: string, category: string, description: string}>>}
 */
export async function regenerateEventIdeas(sanitizedInput, fetchImpl = globalThis.fetch) {
  ideaRotationCount += 1;
  try {
    if (typeof fetchImpl !== 'function') {
      throw new Error('fetch unavailable');
    }
    const res = await fetchImpl('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...sanitizedInput, _nonce: Date.now() }),
      signal: typeof AbortSignal?.timeout === 'function' ? AbortSignal.timeout(15_000) : undefined,
    });
    if (!res.ok) {
      throw new Error(`API status ${res.status}`);
    }
    const parsed = validateAIPlanSchema(await res.json());
    if (!parsed.valid || !parsed.plan.personalizedIdeas.length) {
      throw new Error('No valid ideas in AI response');
    }
    return parsed.plan.personalizedIdeas;
  } catch {
    return generateDeterministicIdeas(sanitizedInput, ideaRotationCount);
  }
}

/**
 * Validates input, tries the serverless GenAI endpoint, and falls back to a deterministic plan.
 * @param {Record<string, unknown>} rawInput
 * @param {typeof fetch} [fetchImpl]
 */
export async function generateEventPlan(rawInput, fetchImpl = globalThis.fetch) {
  const check = validateEventRequest(rawInput);
  if (!check.valid) {
    return { ok: false, errors: check.errors, fieldErrors: check.fieldErrors };
  }
  const input = check.sanitized;

  try {
    if (typeof fetchImpl !== 'function') {
      throw new Error('fetch unavailable');
    }
    const res = await fetchImpl('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: typeof AbortSignal?.timeout === 'function' ? AbortSignal.timeout(20_000) : undefined,
    });
    if (!res.ok) {
      throw new Error(`API status ${res.status}`);
    }
    const parsed = validateAIPlanSchema(await res.json());
    if (!parsed.valid) {
      throw new Error('Invalid AI schema');
    }
    const fallback = generateDeterministicFallbackPlan(input);
    return {
      ok: true,
      input,
      plan: {
        ...parsed.plan,
        budgetBreakdown: parsed.plan.budgetBreakdown.length
          ? parsed.plan.budgetBreakdown
          : fallback.budgetBreakdown,
        timeline: parsed.plan.timeline.length ? parsed.plan.timeline : fallback.timeline,
        vendors: parsed.plan.vendors.length ? parsed.plan.vendors : fallback.vendors,
        source: 'gemini',
      },
    };
  } catch {
    return { ok: true, input, plan: generateDeterministicFallbackPlan(input) };
  }
}
