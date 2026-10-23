import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeText,
  validateBudgetInput,
  validateEventRequest,
  validateAIPlanSchema,
} from '../js/security.js';

const good = {
  eventType: 'Wedding',
  eventName: 'Riya & Aman',
  budget: '500000',
  guestCount: 200,
  eventDate: '2027-02-14',
  preferences: 'Royal theme',
};

test('sanitizeText strips tags and control chars', () => {
  assert.equal(sanitizeText('<script>hi</script>\u0000 ok '), 'scripthi/script ok');
  assert.equal(sanitizeText(42), '');
  assert.equal(sanitizeText('abcdef', 3), 'abc');
});

test('validateBudgetInput bounds', () => {
  assert.equal(validateBudgetInput(999).valid, false);
  assert.equal(validateBudgetInput('abc').valid, false);
  assert.deepEqual(validateBudgetInput(50000.4), { valid: true, value: 50000 });
});

test('validateEventRequest accepts valid payload and normalizes type', () => {
  const r = validateEventRequest(good);
  assert.equal(r.valid, true);
  assert.equal(r.sanitized.eventType, 'wedding');
  assert.equal(r.sanitized.budget, 500000);
});

test('validateEventRequest collects errors', () => {
  const r = validateEventRequest({
    eventType: 'x',
    eventName: 'a',
    budget: 1,
    guestCount: 1,
    eventDate: 'bad',
  });
  assert.equal(r.valid, false);
  assert.equal(r.errors.length, 5);
});

test('validateAIPlanSchema rejects junk and cleans valid data', () => {
  assert.equal(validateAIPlanSchema(null).valid, false);
  assert.equal(validateAIPlanSchema({ summary: 'x', personalizedIdeas: [] }).valid, false);
  const r = validateAIPlanSchema({
    summary: 'Nice <b>plan</b>',
    personalizedIdeas: [{ title: 'T', category: 'C', description: 'D' }],
    vendors: [{ name: 'V', priority: 'Weird' }],
  });
  assert.equal(r.valid, true);
  assert.equal(r.plan.summary, 'Nice bplan/b');
  assert.equal(r.plan.vendors[0].priority, 'Medium');
});
