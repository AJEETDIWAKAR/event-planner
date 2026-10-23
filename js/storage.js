/**
 * Safe local persistence layer for saving and restoring non-sensitive event plans.
 */

export const STORAGE_KEY = 'celebration_event_planner_state_v1';

/**
 * Saves plan state to browser localStorage safely.
 * @param {object} state - Application state object
 * @returns {boolean} True if successfully persisted, false otherwise
 */
export function savePlanState(state) {
  try {
    if (typeof localStorage === 'undefined' || !state || typeof state !== 'object') {
      return false;
    }
    const safePayload = {
      updatedAt: new Date().toISOString(),
      eventDetails: state.eventDetails || null,
      budgetItems: Array.isArray(state.budgetItems) ? state.budgetItems : [],
      vendors: Array.isArray(state.vendors) ? state.vendors : [],
      timeline: Array.isArray(state.timeline) ? state.timeline : [],
      ideas: Array.isArray(state.ideas) ? state.ideas : [],
      summary: typeof state.summary === 'string' ? state.summary : '',
      aiSource: typeof state.aiSource === 'string' ? state.aiSource : 'demo-fallback',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safePayload));
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads saved plan state from localStorage.
 * @returns {object | null} Restored state or null if not found/invalid
 */
export function loadPlanState() {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Clears saved plan state from localStorage.
 * @returns {boolean} True if successfully removed
 */
export function clearPlanState() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    return true;
  } catch {
    return false;
  }
}
