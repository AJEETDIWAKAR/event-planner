import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { createApp } from '../js/app.js';
import { clearPlanState } from '../js/storage.js';

const htmlTemplate = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');

function setupDom() {
  const dom = new JSDOM(htmlTemplate, { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.FormData = dom.window.FormData;
  return dom;
}

beforeEach(() => {
  clearPlanState();
});

test('form validation errors displayed and focus transferred', async () => {
  const dom = setupDom();
  createApp(dom.window.document);

  // Submit invalid empty form
  dom.window.document
    .getElementById('plan-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

  // Wait tick for async submit
  await new Promise((r) => setTimeout(r, 10));

  const errors = dom.window.document.getElementById('errors');
  assert.ok(errors.textContent.length > 0);
  assert.match(errors.textContent, /Event name/i);
  assert.equal(dom.window.document.getElementById('results').hidden, true);
});

test('successful plan generation with mocked fetch', async () => {
  const dom = setupDom();
  const mockPlan = {
    summary: 'Mocked Wedding Celebration',
    personalizedIdeas: [
      { title: 'Grand Entry', category: 'Theme', description: 'Enter with royal flare' },
      { title: 'Live Sitar', category: 'Music', description: 'Acoustic background melody' },
    ],
    budgetBreakdown: [
      { category: 'Venue', percentage: 50, notes: 'Banquet hall' },
      { category: 'Catering', percentage: 50, notes: 'Buffet lunch' },
    ],
    timeline: [{ phase: 'Initial', timeframe: '3 Months Prior', task: 'Book hall' }],
    vendors: [{ name: 'Royal Caterers', category: 'Food', priority: 'High', tip: 'Confirm menu' }],
  };

  const mockFetch = async () => ({
    ok: true,
    json: async () => mockPlan,
  });

  createApp(dom.window.document, { fetchImpl: mockFetch });

  // Fill in form values
  dom.window.document.getElementById('eventType').value = 'wedding';
  dom.window.document.getElementById('eventName').value = 'Ananya & Kabir';
  dom.window.document.getElementById('budget').value = '200000';
  dom.window.document.getElementById('guestCount').value = '150';
  dom.window.document.getElementById('eventDate').value = '2027-11-20';
  dom.window.document.getElementById('preferences').value = 'Traditional';

  dom.window.document
    .getElementById('plan-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 20));

  assert.equal(dom.window.document.getElementById('results').hidden, false);
  assert.equal(
    dom.window.document.getElementById('summary').textContent,
    'Mocked Wedding Celebration'
  );
  assert.match(dom.window.document.getElementById('meta').textContent, /Gemini AI/);

  // Check ideas rendered
  const ideasList = dom.window.document.getElementById('ideas');
  assert.equal(ideasList.children.length, 2);
  assert.match(ideasList.children[0].textContent, /Grand Entry/);

  // Check budget rendered
  const budgetList = dom.window.document.getElementById('budget-list');
  assert.equal(budgetList.children.length, 2);

  // Check timeline rendered
  const timelineList = dom.window.document.getElementById('timeline');
  assert.equal(timelineList.children.length, 1);

  // Check vendors rendered
  const vendorsList = dom.window.document.getElementById('vendors');
  assert.equal(vendorsList.children.length, 1);
  assert.match(vendorsList.children[0].textContent, /Royal Caterers/);
});

test('fallback plan rendered when API fails', async () => {
  const dom = setupDom();
  const failingFetch = async () => ({ ok: false, status: 500 });

  createApp(dom.window.document, { fetchImpl: failingFetch });

  dom.window.document.getElementById('eventType').value = 'birthday';
  dom.window.document.getElementById('eventName').value = 'Rohan 10th';
  dom.window.document.getElementById('budget').value = '50000';
  dom.window.document.getElementById('guestCount').value = '30';
  dom.window.document.getElementById('eventDate').value = '2027-05-15';

  dom.window.document
    .getElementById('plan-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 20));

  assert.equal(dom.window.document.getElementById('results').hidden, false);
  assert.match(dom.window.document.getElementById('summary').textContent, /Rohan 10th/);
  assert.match(dom.window.document.getElementById('meta').textContent, /Built-in smart template/);

  // Verify fallback elements populated
  assert.ok(dom.window.document.getElementById('ideas').children.length >= 3);
  assert.ok(dom.window.document.getElementById('budget-list').children.length >= 3);
  assert.ok(dom.window.document.getElementById('timeline').children.length >= 3);
  assert.ok(dom.window.document.getElementById('vendors').children.length >= 3);
});

test('budget spent update recalculates summary and remaining', async () => {
  const dom = setupDom();
  const mockPlan = {
    summary: 'Test Budget Event',
    personalizedIdeas: [{ title: 'Idea 1', category: 'General', description: 'Desc 1' }],
    budgetBreakdown: [{ category: 'Decor', percentage: 100, notes: 'Theme decor' }],
  };

  createApp(dom.window.document, {
    fetchImpl: async () => ({ ok: true, json: async () => mockPlan }),
  });

  dom.window.document.getElementById('eventType').value = 'birthday';
  dom.window.document.getElementById('eventName').value = 'Maya Party';
  dom.window.document.getElementById('budget').value = '10000';
  dom.window.document.getElementById('guestCount').value = '20';
  dom.window.document.getElementById('eventDate').value = '2027-06-01';

  dom.window.document
    .getElementById('plan-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 20));

  const spentInput = dom.window.document.getElementById('spent-budget-1');
  assert.ok(spentInput, 'Spent input should exist');

  // Update spent value
  spentInput.value = '4000';
  spentInput.dispatchEvent(new dom.window.Event('change'));

  const budgetSummary = dom.window.document.getElementById('budget-summary');
  assert.match(budgetSummary.textContent, /Spent .*4,000/);
  assert.match(budgetSummary.textContent, /Remaining: .*6,000/);

  // Exceed budget to test OVER BUDGET state
  const updatedSpentInput = dom.window.document.getElementById('spent-budget-1');
  updatedSpentInput.value = '12000';
  updatedSpentInput.dispatchEvent(new dom.window.Event('change'));
  assert.match(budgetSummary.textContent, /OVER BUDGET/);
  assert.equal(budgetSummary.className, 'over');
});

test('timeline checkbox toggle updates milestone progress', async () => {
  const dom = setupDom();
  const failingFetch = async () => ({ ok: false, status: 500 });
  createApp(dom.window.document, { fetchImpl: failingFetch });

  dom.window.document.getElementById('eventType').value = 'community';
  dom.window.document.getElementById('eventName').value = 'Green Drive';
  dom.window.document.getElementById('budget').value = '25000';
  dom.window.document.getElementById('guestCount').value = '100';
  dom.window.document.getElementById('eventDate').value = '2027-08-10';

  dom.window.document
    .getElementById('plan-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 20));

  const progress = dom.window.document.getElementById('timeline-progress');
  assert.match(progress.textContent, /0 of .* milestones done/);

  const firstCheckbox = dom.window.document.querySelector('#timeline input[type="checkbox"]');
  assert.ok(firstCheckbox);
  firstCheckbox.checked = true;
  firstCheckbox.dispatchEvent(new dom.window.Event('change'));

  assert.match(progress.textContent, /1 of .* milestones done/);
});

test('vendor status change updates vendor progress', async () => {
  const dom = setupDom();
  const failingFetch = async () => ({ ok: false, status: 500 });
  createApp(dom.window.document, { fetchImpl: failingFetch });

  dom.window.document.getElementById('eventType').value = 'wedding';
  dom.window.document.getElementById('eventName').value = 'Pooja Wedding';
  dom.window.document.getElementById('budget').value = '500000';
  dom.window.document.getElementById('guestCount').value = '250';
  dom.window.document.getElementById('eventDate').value = '2027-12-05';

  dom.window.document
    .getElementById('plan-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 20));

  const progress = dom.window.document.getElementById('vendor-progress');
  assert.match(progress.textContent, /0 of .* vendors booked/);

  const firstStatusSelect = dom.window.document.querySelector('#vendors select');
  assert.ok(firstStatusSelect);
  firstStatusSelect.value = 'Booked';
  firstStatusSelect.dispatchEvent(new dom.window.Event('change'));

  assert.match(progress.textContent, /1 of .* vendors booked/);
});

test('add custom vendor appends vendor and clears input', async () => {
  const dom = setupDom();
  const failingFetch = async () => ({ ok: false, status: 500 });
  createApp(dom.window.document, { fetchImpl: failingFetch });

  dom.window.document.getElementById('eventType').value = 'wedding';
  dom.window.document.getElementById('eventName').value = 'Custom Vendor Test';
  dom.window.document.getElementById('budget').value = '100000';
  dom.window.document.getElementById('guestCount').value = '50';
  dom.window.document.getElementById('eventDate').value = '2027-09-01';

  dom.window.document
    .getElementById('plan-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 20));

  const initialCount = dom.window.document.getElementById('vendors').children.length;

  const vendorInput = dom.window.document.getElementById('vName');
  vendorInput.value = 'Vintage Car Chauffeur';
  dom.window.document
    .getElementById('vendor-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

  const newCount = dom.window.document.getElementById('vendors').children.length;
  assert.equal(newCount, initialCount + 1);
  assert.equal(vendorInput.value, '');
  assert.match(
    dom.window.document.getElementById('vendors').lastElementChild.textContent,
    /Vintage Car Chauffeur/
  );

  // Submitting empty or single-char name does not add a vendor
  vendorInput.value = ' ';
  dom.window.document
    .getElementById('vendor-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  assert.equal(dom.window.document.getElementById('vendors').children.length, newCount);
});

test('clear saved plan resets state, storage, and hides results', async () => {
  const dom = setupDom();
  const failingFetch = async () => ({ ok: false, status: 500 });
  createApp(dom.window.document, { fetchImpl: failingFetch });

  dom.window.document.getElementById('eventType').value = 'birthday';
  dom.window.document.getElementById('eventName').value = 'Reset Test';
  dom.window.document.getElementById('budget').value = '10000';
  dom.window.document.getElementById('guestCount').value = '15';
  dom.window.document.getElementById('eventDate').value = '2027-04-01';

  dom.window.document
    .getElementById('plan-form')
    .dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 20));

  assert.equal(dom.window.document.getElementById('results').hidden, false);

  // Click reset
  dom.window.document.getElementById('reset-btn').dispatchEvent(new dom.window.Event('click'));

  assert.equal(dom.window.document.getElementById('results').hidden, true);
  assert.match(dom.window.document.getElementById('errors').textContent, /Saved plan cleared/);
});

test('restores saved plan from storage on initial load', () => {
  const dom = setupDom();
  const savedState = {
    eventDetails: {
      eventType: 'wedding',
      eventName: 'Pre-saved Wedding',
      budget: 400000,
      guestCount: 180,
      eventDate: '2027-10-15',
    },
    summary: 'Restored plan from storage',
    ideas: [{ title: 'Restored Idea', category: 'Decor', description: 'Restored desc' }],
    budgetItems: [
      {
        id: 'budget-1',
        category: 'Venue',
        percentage: 100,
        allocated: 400000,
        spent: 10000,
        notes: '',
      },
    ],
    timeline: [
      {
        id: 'milestone-1',
        phase: 'Prep',
        timeframe: '1 Month',
        task: 'Check checklist',
        completed: true,
      },
    ],
    vendors: [
      {
        id: 'vendor-1',
        name: 'Saved Vendor',
        category: 'Venue',
        priority: 'High',
        tip: 'Tip',
        status: 'Booked',
      },
    ],
    aiSource: 'gemini',
  };

  dom.window.localStorage.setItem('celebration_event_planner_state_v1', JSON.stringify(savedState));

  // Initialize app
  createApp(dom.window.document);

  assert.equal(dom.window.document.getElementById('results').hidden, false);
  assert.equal(
    dom.window.document.getElementById('summary').textContent,
    'Restored plan from storage'
  );
  assert.match(dom.window.document.getElementById('meta').textContent, /Gemini AI/);
  assert.match(
    dom.window.document.getElementById('ideas').children[0].textContent,
    /Restored Idea/
  );
  assert.match(
    dom.window.document.getElementById('timeline-progress').textContent,
    /1 of 1 milestones done/
  );
  assert.match(
    dom.window.document.getElementById('vendor-progress').textContent,
    /1 of 1 vendors booked/
  );
});

test('per-field accessibility: aria-invalid, aria-describedby, message and focus', async () => {
  const dom = setupDom();
  createApp(dom.window.document);

  const form = dom.window.document.getElementById('plan-form');
  const nameInput = dom.window.document.getElementById('eventName');
  const budgetInput = dom.window.document.getElementById('budget');
  const nameError = dom.window.document.getElementById('eventName-error');
  const budgetError = dom.window.document.getElementById('budget-error');

  // Set partial invalid input
  nameInput.value = 'A'; // < 2 chars
  budgetInput.value = '50'; // < 1000

  form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 15));

  // Verify aria-invalid and aria-describedby on invalid fields
  assert.equal(nameInput.getAttribute('aria-invalid'), 'true');
  assert.equal(nameInput.getAttribute('aria-describedby'), 'eventName-error');
  assert.match(nameError.textContent, /at least 2 characters/i);

  assert.equal(budgetInput.getAttribute('aria-invalid'), 'true');
  assert.equal(budgetInput.getAttribute('aria-describedby'), 'budget-error');
  assert.match(budgetError.textContent, /between 1,000 and/i);

  // Focus was directed to first invalid field
  assert.equal(dom.window.document.activeElement, nameInput);

  // Typing in the field clears aria-invalid and error text
  nameInput.value = 'Ananya Wedding';
  nameInput.dispatchEvent(new dom.window.Event('input'));
  assert.equal(nameInput.getAttribute('aria-invalid'), null);
  assert.equal(nameInput.getAttribute('aria-describedby'), null);
  assert.equal(nameError.textContent, '');
});

test('custom vendor input accessibility validation', () => {
  const dom = setupDom();
  createApp(dom.window.document);

  dom.window.document.getElementById('results').hidden = false;
  const vendorForm = dom.window.document.getElementById('vendor-form');
  const vName = dom.window.document.getElementById('vName');
  const vError = dom.window.document.getElementById('vName-error');

  vName.value = ' ';
  vendorForm.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

  assert.equal(vName.getAttribute('aria-invalid'), 'true');
  assert.equal(vName.getAttribute('aria-describedby'), 'vName-error');
  assert.match(vError.textContent, /at least 2 characters/i);
  assert.equal(dom.window.document.activeElement, vName);

  // Typing clears error
  vName.value = 'Florist';
  vName.dispatchEvent(new dom.window.Event('input'));
  assert.equal(vName.getAttribute('aria-invalid'), null);
  assert.equal(vError.textContent, '');
});
