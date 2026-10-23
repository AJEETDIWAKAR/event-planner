import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPlanAsText, exportPlanAsTextFile, printPlan } from '../js/ui/export-view.js';
import { JSDOM } from 'jsdom';

const sampleState = {
  eventDetails: {
    eventType: 'wedding',
    eventName: 'Deepika & Ranveer',
    budget: 800000,
    guestCount: 300,
    eventDate: '2027-11-15',
    preferences: 'Lakeside theme, strictly vegetarian',
  },
  summary: 'A bespoke royal wedding plan on the lake.',
  aiSource: 'gemini',
  ideas: [
    {
      title: 'Floating Floral Diya Installation',
      category: 'Decor',
      description: 'Candles on water',
    },
    { title: 'Live Shehnai Arrival', category: 'Music', description: 'Traditional acoustic entry' },
  ],
  budgetItems: [
    {
      id: 'b-1',
      category: 'Venue',
      percentage: 50,
      allocated: 400000,
      spent: 250000,
      notes: 'Lakeside lawn',
    },
    {
      id: 'b-2',
      category: 'Catering',
      percentage: 50,
      allocated: 400000,
      spent: 100000,
      notes: 'Veg feast',
    },
  ],
  timeline: [
    { id: 'm-1', phase: 'Prep', timeframe: '6 Months', task: 'Reserve lawn', completed: true },
    { id: 'm-2', phase: 'Final', timeframe: '1 Week', task: 'Soundcheck', completed: false },
  ],
  vendors: [
    {
      id: 'v-1',
      name: 'Lake Palace Decor',
      category: 'Decor',
      priority: 'High',
      tip: 'Check wind safety',
      status: 'Booked',
    },
  ],
};

test('formatPlanAsText handles empty or null state', () => {
  assert.match(formatPlanAsText(null), /No active event plan/i);
  assert.match(formatPlanAsText({}), /No active event plan/i);
});

test('formatPlanAsText builds complete structured plain text report', () => {
  const text = formatPlanAsText(sampleState);

  assert.match(text, /DEEPIKA & RANVEER/);
  assert.match(text, /Wedding/);
  assert.match(text, /2027-11-15/);
  assert.match(text, /Lakeside theme/);
  assert.match(text, /Floating Floral Diya Installation/);
  assert.match(text, /Planned Budget: INR 8,00,000/);
  assert.match(text, /Total Spent: {4}INR 3,50,000/);
  assert.match(text, /\[X\] 6 Months - Prep: Reserve lawn/);
  assert.match(text, /\[ \] 1 Week - Final: Soundcheck/);
  assert.match(text, /\[BOOKED\] Lake Palace Decor/);
});

test('exportPlanAsTextFile creates object URL and triggers link download', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  let objectUrlCreated = false;
  let objectUrlRevoked = false;

  const mockURL = {
    createObjectURL(blob) {
      assert.ok(blob);
      objectUrlCreated = true;
      return 'blob:http://localhost/mock-download-id';
    },
    revokeObjectURL(url) {
      assert.equal(url, 'blob:http://localhost/mock-download-id');
      objectUrlRevoked = true;
    },
  };

  const ok = exportPlanAsTextFile(sampleState, dom.window.document, mockURL);
  assert.equal(ok, true);
  assert.equal(objectUrlCreated, true);
  assert.equal(objectUrlRevoked, true);

  // Fails cleanly when state is missing
  assert.equal(exportPlanAsTextFile(null, dom.window.document, mockURL), false);
});

test('printPlan invokes window print method', () => {
  let printed = false;
  const mockWin = {
    print() {
      printed = true;
    },
  };

  assert.equal(printPlan(mockWin), true);
  assert.equal(printed, true);
  assert.equal(printPlan(null), false);
});
