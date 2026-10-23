/**
 * Security utilities for input validation, sanitization, and AI payload verification.
 */

const ALLOWED_EVENT_TYPES = ['wedding', 'birthday', 'community'];

export function sanitizeText(value, maxLength = 200) {
  if (typeof value !== 'string') {
    return '';
  }
  const cleaned = value.replace(/[<>]/g, '').replace(/[\u0000-\u001F\u007F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}

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

export function validateEventRequest(payload = {}) {
  const errors = [];
  const eventType = sanitizeText(payload.eventType, 30).toLowerCase();
  if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
    errors.push('Invalid event type. Choose wedding, birthday, or community.');
  }

  const eventName = sanitizeText(payload.eventName, 100);
  if (eventName.length < 2) {
    errors.push('Event name must be at least 2 characters long.');
  }

  const budgetCheck = validateBudgetInput(payload.budget);
  if (!budgetCheck.valid) {
    errors.push(budgetCheck.error);
  }

  const guestCount = Number(payload.guestCount);
  if (!Number.isInteger(guestCount) || guestCount < 5 || guestCount > 50000) {
    errors.push('Guest count must be an integer between 5 and 50,000.');
  }

  const eventDate = sanitizeText(payload.eventDate, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    errors.push('Event date must follow YYYY-MM-DD format.');
  }

  const preferences = sanitizeText(payload.preferences || '', 300);

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return {
    valid: true,
    errors: [],
    sanitized: { eventType, eventName, budget: budgetCheck.value, guestCount, eventDate, preferences },
  };
}

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
