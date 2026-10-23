import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateEventPlan,
  generateDeterministicIdeas,
  regenerateEventIdeas,
  generateDeterministicFallbackPlan,
} from '../js/ai-service.js';

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
  assert.ok(r.fieldErrors);
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

test('generateDeterministicIdeas provides diverse tailored ideas', () => {
  const weddingIdeas1 = generateDeterministicIdeas({ ...input, eventType: 'wedding' }, 0);
  const weddingIdeas2 = generateDeterministicIdeas({ ...input, eventType: 'wedding' }, 2);

  assert.equal(weddingIdeas1.length, 4);
  assert.equal(weddingIdeas2.length, 4);
  // Rotated offset produces different starting item
  assert.notEqual(weddingIdeas1[0].title, weddingIdeas2[0].title);
});

test('regenerateEventIdeas uses AI response if valid', async () => {
  const freshIdeas = [
    { title: 'New Laser Show', category: 'Entertainment', description: '30-minute light setup' },
  ];
  const mockFetch = async () => ({
    ok: true,
    json: async () => ({
      summary: 'Updated',
      personalizedIdeas: freshIdeas,
    }),
  });

  const ideas = await regenerateEventIdeas(input, mockFetch);
  assert.equal(ideas.length, 1);
  assert.equal(ideas[0].title, 'New Laser Show');
});

test('regenerateEventIdeas falls back deterministically when API fails', async () => {
  const failingFetch = async () => ({ ok: false, status: 500 });
  const ideas = await regenerateEventIdeas(input, failingFetch);

  assert.ok(ideas.length >= 3);
  assert.ok(ideas[0].title);
});

test('generateDeterministicFallbackPlan structures complete plan without API key', () => {
  const fallback = generateDeterministicFallbackPlan(input);
  assert.equal(fallback.source, 'demo-fallback');
  assert.ok(fallback.budgetBreakdown.length > 0);
  assert.ok(fallback.timeline.length > 0);
  assert.ok(fallback.vendors.length > 0);
});
