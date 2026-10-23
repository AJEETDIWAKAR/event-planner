/** UI controller. Uses textContent only (no innerHTML) and no inline styles (CSP-safe). */

import { generateEventPlan } from './ai-service.js';
import { buildBudgetAllocation, calculateBudgetSummary, updateBudgetSpent } from './budget.js';
import { buildTimelineSchedule, calculateDaysRemaining, toggleMilestone, getTimelineProgress } from './timeline.js';
import { buildVendorChecklist, addCustomVendor, updateVendorStatus, getChecklistProgress } from './checklist.js';
import { savePlanState, loadPlanState, clearPlanState } from './storage.js';

const $ = (id) => document.getElementById(id);
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const state = { eventDetails: null, budgetItems: [], vendors: [], timeline: [], ideas: [], summary: '', aiSource: 'demo-fallback' };

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function persist() {
  savePlanState(state);
}

function renderBudget() {
  const s = calculateBudgetSummary(state.eventDetails.budget, state.budgetItems);
  const line = $('budget-summary');
  line.textContent = `Spent ${fmt(s.totalSpent)} of ${fmt(s.totalBudget)} (${s.utilizationPercent}%). Remaining: ${fmt(s.remaining)}${s.isOverBudget ? ' - OVER BUDGET' : ''}`;
  line.className = s.isOverBudget ? 'over' : '';
  const list = $('budget-list');
  list.replaceChildren();
  state.budgetItems.forEach((item) => {
    const row = el('div', undefined, 'budget-row');
    row.append(el('strong', `${item.category} (${item.percentage}%) - ${fmt(item.allocated)}`), el('p', item.notes, 'muted'));
    const label = el('label', `Spent on ${item.category}`);
    label.htmlFor = `spent-${item.id}`;
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.id = `spent-${item.id}`;
    input.value = String(item.spent);
    input.addEventListener('change', () => {
      state.budgetItems = updateBudgetSpent(state.budgetItems, item.id, input.value);
      persist();
      renderBudget();
    });
    const bar = document.createElement('progress');
    bar.max = Math.max(1, item.allocated);
    bar.value = Math.min(item.spent, bar.max);
    row.append(label, input, bar);
    list.append(row);
  });
}

function renderVendors() {
  const p = getChecklistProgress(state.vendors);
  $('vendor-progress').textContent = `${p.completed} of ${p.total} vendors booked (${p.percent}%)`;
  const ul = $('vendors');
  ul.replaceChildren();
  state.vendors.forEach((v) => {
    const li = el('li');
    li.append(el('strong', v.name), el('p', `${v.category} - ${v.priority} priority`, 'muted'), el('p', v.tip));
    const label = el('label', `Status for ${v.name}`);
    label.htmlFor = `status-${v.id}`;
    const select = document.createElement('select');
    select.id = `status-${v.id}`;
    ['Pending', 'Booked', 'Paid'].forEach((s) => {
      const o = el('option', s);
      o.value = s;
      o.selected = s === v.status;
      select.append(o);
    });
    select.addEventListener('change', () => {
      state.vendors = updateVendorStatus(state.vendors, v.id, select.value);
      persist();
      renderVendors();
    });
    li.append(label, select);
    ul.append(li);
  });
}

function renderTimeline() {
  const p = getTimelineProgress(state.timeline);
  $('timeline-progress').textContent = `${p.done} of ${p.total} milestones done (${p.percent}%)`;
  const tl = $('timeline');
  tl.replaceChildren();
  state.timeline.forEach((m) => {
    const li = el('li');
    const label = el('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = m.completed;
    box.addEventListener('change', () => {
      state.timeline = toggleMilestone(state.timeline, m.id);
      persist();
      renderTimeline();
    });
    label.append(box, el('span', ` ${m.timeframe} - ${m.phase}: ${m.task}`));
    li.append(label);
    tl.append(li);
  });
}

function render() {
  $('results').hidden = false;
  $('summary').textContent = state.summary;
  const days = calculateDaysRemaining(state.eventDetails.eventDate);
  $('meta').textContent = `${days} days to go | Plan source: ${state.aiSource === 'gemini' ? 'Gemini AI' : 'Built-in smart template'}`;
  const ideas = $('ideas');
  ideas.replaceChildren();
  state.ideas.forEach((i) => {
    const li = el('li');
    li.append(el('strong', i.title), el('span', i.category, 'badge'), el('p', i.description));
    ideas.append(li);
  });
  renderTimeline();
  renderBudget();
  renderVendors();
}

$('plan-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('errors').textContent = '';
  const btn = $('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Generating...';
  const raw = Object.fromEntries(new FormData(e.target).entries());
  const result = await generateEventPlan(raw);
  btn.disabled = false;
  btn.textContent = 'Generate plan';
  if (!result.ok) {
    $('errors').textContent = result.errors.join(' ');
    $('errors').focus();
    return;
  }
  const { input, plan } = result;
  state.eventDetails = input;
  state.summary = plan.summary;
  state.ideas = plan.personalizedIdeas;
  state.aiSource = plan.source;
  state.budgetItems = buildBudgetAllocation(input.budget, input.eventType, plan.budgetBreakdown);
  state.timeline = buildTimelineSchedule(input.eventType, input.eventDate, plan.timeline);
  state.vendors = buildVendorChecklist(input.eventType, plan.vendors);
  persist();
  render();
});

$('vendor-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('vName');
  state.vendors = addCustomVendor(state.vendors, { name: input.value });
  input.value = '';
  persist();
  renderVendors();
});

$('reset-btn').addEventListener('click', () => {
  clearPlanState();
  $('results').hidden = true;
  $('errors').textContent = 'Saved plan cleared.';
});

const saved = loadPlanState();
if (saved && saved.eventDetails) {
  Object.assign(state, saved);
  render();
}
