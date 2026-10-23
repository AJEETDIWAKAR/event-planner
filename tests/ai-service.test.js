import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateEventPlan } from '../js/ai-service.js';

const input = {
  eventType: 'birthday',
  eventName: 'Aarav 5th',
  budget: 60000,
  guestCount: 40,
  eventDate: '2027-03-10',
  preferences: 'dinosaurs',
};

test('invalid input returns errors', async () => {
  const r = await generateEventPlan({});
  assert.equal(r.ok, false);
  assert.ok(r.errors.length > 0);
});

test('falls back when API fails', async () => {
  const r = await generateEventPlan(input, async () => ({ ok: false, status: 503 }));
  assert.equal(r.ok, true);
  assert.equal(r.plan.source, 'demo-fallback');
  assert.ok(r.plan.personalizedIdeas.length >= 3);
});

test('falls back when fetch throws', async () => {
  const r = await generateEventPlan(input, async () => {
    throw new Error('offline');
  });
  assert.equal(r.plan.source, 'demo-fallback');
});

test('uses AI plan when schema valid', async () => {
  const ai = {
    summary: 'AI plan',
    personalizedIdeas: [{ title: 'T', category: 'C', description: 'D' }],
  };
  const r = await generateEventPlan(input, async () => ({ ok: true, json: async () => ai }));
  assert.equal(r.plan.source, 'gemini');
  assert.ok(r.plan.budgetBreakdown.length > 0);
});

test('falls back on invalid AI schema', async () => {
  const r = await generateEventPlan(input, async () => ({
    ok: true,
    json: async () => ({ foo: 1 }),
  }));
  assert.equal(r.plan.source, 'demo-fallback');
});
