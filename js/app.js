/**
 * Main UI controller. Uses textContent only (no innerHTML) and no inline styles (CSP-safe).
 */

import { generateEventPlan } from './ai-service.js';
import { buildBudgetAllocation, updateBudgetSpent } from './budget.js';
import { buildTimelineSchedule, calculateDaysRemaining, toggleMilestone } from './timeline.js';
import { buildVendorChecklist, addCustomVendor, updateVendorStatus } from './checklist.js';
import { savePlanState, loadPlanState, clearPlanState } from './storage.js';
import { renderBudget } from './ui/budget-view.js';
import { renderTimeline } from './ui/timeline-view.js';
import { renderVendors } from './ui/vendors-view.js';
import { renderIdeas } from './ui/ideas-view.js';

/**
 * Creates and initializes the celebration event planner application instance.
 * @param {Document} [doc]
 * @param {{ fetchImpl?: typeof fetch }} [options]
 * @returns {object} Application instance and state
 */
export function createApp(doc = globalThis.document, { fetchImpl = globalThis.fetch } = {}) {
  const $ = (id) => doc.getElementById(id);

  const elements = {
    planForm: $('plan-form'),
    vendorForm: $('vendor-form'),
    submitBtn: $('submit-btn'),
    resetBtn: $('reset-btn'),
    errors: $('errors'),
    results: $('results'),
    summary: $('summary'),
    meta: $('meta'),
    ideas: $('ideas'),
    budgetSummary: $('budget-summary'),
    budgetList: $('budget-list'),
    timelineProgress: $('timeline-progress'),
    timeline: $('timeline'),
    vendorProgress: $('vendor-progress'),
    vendors: $('vendors'),
    vName: $('vName'),
  };

  const state = {
    eventDetails: null,
    budgetItems: [],
    vendors: [],
    timeline: [],
    ideas: [],
    summary: '',
    aiSource: 'demo-fallback',
  };

  function persist() {
    savePlanState(state);
  }

  function handleSpentChange(itemId, newSpent) {
    state.budgetItems = updateBudgetSpent(state.budgetItems, itemId, newSpent);
    persist();
    renderBudgetView();
  }

  function handleToggleMilestone(milestoneId) {
    state.timeline = toggleMilestone(state.timeline, milestoneId);
    persist();
    renderTimelineView();
  }

  function handleVendorStatusChange(vendorId, nextStatus) {
    state.vendors = updateVendorStatus(state.vendors, vendorId, nextStatus);
    persist();
    renderVendorsView();
  }

  function renderBudgetView() {
    if (!state.eventDetails) return;
    renderBudget(
      elements.budgetList,
      elements.budgetSummary,
      state.eventDetails.budget,
      state.budgetItems,
      handleSpentChange
    );
  }

  function renderTimelineView() {
    renderTimeline(
      elements.timeline,
      elements.timelineProgress,
      state.timeline,
      handleToggleMilestone
    );
  }

  function renderVendorsView() {
    renderVendors(
      elements.vendors,
      elements.vendorProgress,
      state.vendors,
      handleVendorStatusChange
    );
  }

  function render() {
    if (!state.eventDetails) return;
    if (elements.results) {
      elements.results.hidden = false;
    }
    if (elements.summary) {
      elements.summary.textContent = state.summary;
    }
    if (elements.meta) {
      const days = calculateDaysRemaining(state.eventDetails.eventDate);
      elements.meta.textContent = `${days} days to go | Plan source: ${state.aiSource === 'gemini' ? 'Gemini AI' : 'Built-in smart template'}`;
    }
    renderIdeas(elements.ideas, state.ideas);
    renderTimelineView();
    renderBudgetView();
    renderVendorsView();
  }

  async function handlePlanSubmit(e) {
    e.preventDefault();
    if (elements.errors) {
      elements.errors.textContent = '';
    }

    if (elements.submitBtn) {
      elements.submitBtn.disabled = true;
      elements.submitBtn.textContent = 'Generating...';
    }

    const raw = Object.fromEntries(new FormData(e.target).entries());
    const result = await generateEventPlan(raw, fetchImpl);

    if (elements.submitBtn) {
      elements.submitBtn.disabled = false;
      elements.submitBtn.textContent = 'Generate plan';
    }

    if (!result.ok) {
      if (elements.errors) {
        elements.errors.textContent = result.errors.join(' ');
        elements.errors.focus();
      }
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
  }

  function handleVendorSubmit(e) {
    e.preventDefault();
    const input = elements.vName;
    if (!input) return;
    state.vendors = addCustomVendor(state.vendors, { name: input.value });
    input.value = '';
    persist();
    renderVendorsView();
  }

  function handleReset() {
    clearPlanState();
    state.eventDetails = null;
    state.budgetItems = [];
    state.vendors = [];
    state.timeline = [];
    state.ideas = [];
    state.summary = '';
    state.aiSource = 'demo-fallback';

    if (elements.results) {
      elements.results.hidden = true;
    }
    if (elements.errors) {
      elements.errors.textContent = 'Saved plan cleared.';
    }
  }

  if (elements.planForm) {
    elements.planForm.addEventListener('submit', handlePlanSubmit);
  }
  if (elements.vendorForm) {
    elements.vendorForm.addEventListener('submit', handleVendorSubmit);
  }
  if (elements.resetBtn) {
    elements.resetBtn.addEventListener('click', handleReset);
  }

  const saved = loadPlanState();
  if (saved && saved.eventDetails) {
    Object.assign(state, saved);
    render();
  }

  return {
    state,
    elements,
    render,
  };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  createApp(document);
}
