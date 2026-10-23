/**
 * Security utilities for input validation, sanitization, and AI payload verification.
 */

export const ALLOWED_EVENT_TYPES = ['wedding', 'birthday', 'community'];

/**
 * Strips HTML tags, ASCII control characters, and leading/trailing whitespace.
 * @param {unknown} value - Raw string input
 * @param {number} [maxLength=200] - Truncation limit
 * @returns {string} Sanitized string
 */
export function sanitizeText(value, maxLength = 200) {
  if (typeof value !== 'string') {
    return '';
  }
  const cleaned = value.replace(/[<>]/g, '').replace(/[\u0000-\u001F\u007F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}

/**
 * Validates that budget input is a finite integer within realistic bounds.
 * @param {unknown} rawBudget
 * @returns {{ valid: boolean, value: number, error?: string }}
 */
export function validateBudgetInput(rawBudget) {
  const num = Number(rawBudget);
  if (!Number.isFinite(num) || num < 1000 || num > 100000000) {
    return {
      valid: false,
      value: 0,
      error: 'Budget must be a valid number between 1,000 and 100,000,000.',
    };
  }
  return { valid: true, value: Math.round(num) };
}

/**
 * Validates and sanitizes client event creation payload with field-level error mapping.
 * @param {Record<string, unknown>} [payload={}]
 * @returns {{
 *   valid: boolean,
 *   errors: string[],
 *   fieldErrors: Record<string, string>,
 *   sanitized?: {
 *     eventType: 'wedding' | 'birthday' | 'community',
 *     eventName: string,
 *     budget: number,
 *     guestCount: number,
 *     eventDate: string,
 *     preferences: string
 *   }
 * }}
 */
export function validateEventRequest(payload = {}) {
  const errors = [];
  const fieldErrors = {};

  const eventType = sanitizeText(payload.eventType, 30).toLowerCase();
  if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
    const msg = 'Invalid event type. Choose wedding, birthday, or community.';
    errors.push(msg);
    fieldErrors.eventType = msg;
  }

  const eventName = sanitizeText(payload.eventName, 100);
  if (eventName.length < 2) {
    const msg = 'Event name must be at least 2 characters long.';
    errors.push(msg);
    fieldErrors.eventName = msg;
  }

  const budgetCheck = validateBudgetInput(payload.budget);
  if (!budgetCheck.valid) {
    errors.push(budgetCheck.error);
    fieldErrors.budget = budgetCheck.error;
  }

  const guestCount = Number(payload.guestCount);
  if (!Number.isInteger(guestCount) || guestCount < 5 || guestCount > 50000) {
    const msg = 'Guest count must be an integer between 5 and 50,000.';
    errors.push(msg);
    fieldErrors.guestCount = msg;
  }

  const eventDate = sanitizeText(payload.eventDate, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    const msg = 'Event date must follow YYYY-MM-DD format.';
    errors.push(msg);
    fieldErrors.eventDate = msg;
  }

  const preferences = sanitizeText(payload.preferences || '', 300);

  if (errors.length > 0) {
    return { valid: false, errors, fieldErrors };
  }
  return {
    valid: true,
    errors: [],
    fieldErrors: {},
    sanitized: {
      eventType,
      eventName,
      budget: budgetCheck.value,
      guestCount,
      eventDate,
      preferences,
    },
  };
}

/**
 * Validates that an AI-generated JSON response matches the expected schema and sanitizes all fields.
 * @param {unknown} data
 * @returns {{
 *   valid: boolean,
 *   plan?: {
 *     summary: string,
 *     personalizedIdeas: Array<{title: string, category: string, description: string}>,
 *     budgetBreakdown: Array<{category: string, percentage: number, notes: string}>,
 *     timeline: Array<{phase: string, timeframe: string, task: string}>,
 *     vendors: Array<{name: string, category: string, priority: 'High'|'Medium'|'Low', tip: string}>
 *   }
 * }}
 */
export function validateAIPlanSchema(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false };
  }

  const summary = sanitizeText(data.summary, 500);
  const personalizedIdeas = Array.isArray(data.personalizedIdeas)
    ? data.personalizedIdeas
        .slice(0, 8)
        .map((item) => ({
          title: sanitizeText(item?.title, 80),
          category: sanitizeText(item?.category, 40),
          description: sanitizeText(item?.description, 250),
        }))
        .filter((item) => item.title && item.description)
    : [];

  const budgetBreakdown = Array.isArray(data.budgetBreakdown)
    ? data.budgetBreakdown
        .slice(0, 10)
        .map((item) => ({
          category: sanitizeText(item?.category, 60),
          percentage: Math.max(1, Math.min(100, Number(item?.percentage) || 0)),
          notes: sanitizeText(item?.notes, 160),
        }))
        .filter((item) => item.category)
    : [];

  const timeline = Array.isArray(data.timeline)
    ? data.timeline
        .slice(0, 12)
        .map((item) => ({
          phase: sanitizeText(item?.phase, 60),
          timeframe: sanitizeText(item?.timeframe, 50),
          task: sanitizeText(item?.task, 180),
        }))
        .filter((item) => item.phase && item.task)
    : [];

  const vendors = Array.isArray(data.vendors)
    ? data.vendors
        .slice(0, 12)
        .map((item) => ({
          name: sanitizeText(item?.name, 70),
          category: sanitizeText(item?.category, 50),
          priority: ['High', 'Medium', 'Low'].includes(item?.priority) ? item.priority : 'Medium',
          tip: sanitizeText(item?.tip, 160),
        }))
        .filter((item) => item.name)
    : [];

  if (!summary || personalizedIdeas.length === 0) {
    return { valid: false };
  }
  return { valid: true, plan: { summary, personalizedIdeas, budgetBreakdown, timeline, vendors } };
}
