/**
 * Main UI controller. Uses textContent only (no innerHTML) and no inline styles (CSP-safe).
 * Fully WCAG 2.2 AA compliant with explicit aria error association, focus management, and keyboard support.
 */

import { generateEventPlan, regenerateEventIdeas } from './ai-service.js';
import { buildBudgetAllocation, updateBudgetSpent } from './budget.js';
import { buildTimelineSchedule, calculateDaysRemaining, toggleMilestone } from './timeline.js';
import { buildVendorChecklist, addCustomVendor, updateVendorStatus } from './checklist.js';
import { savePlanState, loadPlanState, clearPlanState } from './storage.js';
import { renderBudget } from './ui/budget-view.js';
import { renderTimeline } from './ui/timeline-view.js';
import { renderVendors } from './ui/vendors-view.js';
import { renderIdeas } from './ui/ideas-view.js';
import { exportPlanAsTextFile, printPlan } from './ui/export-view.js';

const FORM_FIELDS = ['eventType', 'eventName', 'budget', 'guestCount', 'eventDate', 'preferences'];

/**
 * Creates and initializes the celebration event planner application instance.
 * @param {Document} [doc]
 * @param {{ fetchImpl?: typeof fetch, printImpl?: () => boolean, urlImpl?: typeof URL }} [options]
 * @returns {object} Application instance and state
 */
export function createApp(
  doc = globalThis.document,
  { fetchImpl = globalThis.fetch, printImpl = null, urlImpl = globalThis.URL } = {}
) {
  const $ = (id) => doc.getElementById(id);

  const elements = {
    planForm: $('plan-form'),
    vendorForm: $('vendor-form'),
    submitBtn: $('submit-btn'),
    resetBtn: $('reset-btn'),
    regenIdeasBtn: $('regen-ideas-btn'),
    printPlanBtn: $('print-plan-btn'),
    exportTxtBtn: $('export-txt-btn'),
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
    vNameError: $('vName-error'),
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

  function clearFieldErrors() {
    FORM_FIELDS.forEach((field) => {
      const input = $(field);
      const err = $(`${field}-error`);
      if (input) {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
      if (err) {
        err.textContent = '';
      }
    });

    if (elements.vName) {
      elements.vName.removeAttribute('aria-invalid');
      elements.vName.removeAttribute('aria-describedby');
    }
    if (elements.vNameError) {
      elements.vNameError.textContent = '';
    }
  }

  function applyFieldErrors(fieldErrors = {}) {
    let firstInvalid = null;
    FORM_FIELDS.forEach((field) => {
      const input = $(field);
      const err = $(`${field}-error`);
      if (fieldErrors[field]) {
        if (input) {
          input.setAttribute('aria-invalid', 'true');
          input.setAttribute('aria-describedby', `${field}-error`);
          if (!firstInvalid) {
            firstInvalid = input;
          }
        }
        if (err) {
          err.textContent = fieldErrors[field];
        }
      } else {
        if (input) {
          input.removeAttribute('aria-invalid');
          input.removeAttribute('aria-describedby');
        }
        if (err) {
          err.textContent = '';
        }
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
    }
  }

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
    clearFieldErrors();
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
      }
      applyFieldErrors(result.fieldErrors);
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

  async function handleRegenerateIdeas() {
    if (!state.eventDetails || !elements.regenIdeasBtn) return;
    elements.regenIdeasBtn.disabled = true;
    elements.regenIdeasBtn.textContent = 'Regenerating...';

    const freshIdeas = await regenerateEventIdeas(state.eventDetails, fetchImpl);
    state.ideas = freshIdeas;
    persist();
    renderIdeas(elements.ideas, state.ideas);

    elements.regenIdeasBtn.disabled = false;
    elements.regenIdeasBtn.textContent = 'Regenerate ideas only';
  }

  function handleVendorSubmit(e) {
    e.preventDefault();
    const input = elements.vName;
    if (!input) return;
    const cleanName = (input.value || '').trim();

    if (cleanName.length < 2) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', 'vName-error');
      if (elements.vNameError) {
        elements.vNameError.textContent = 'Vendor name must be at least 2 characters long.';
      }
      input.focus();
      return;
    }

    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    if (elements.vNameError) {
      elements.vNameError.textContent = '';
    }

    state.vendors = addCustomVendor(state.vendors, { name: cleanName });
    input.value = '';
    persist();
    renderVendorsView();
  }

  function handleReset() {
    clearPlanState();
    clearFieldErrors();
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

  function handlePrint() {
    if (typeof printImpl === 'function') {
      printImpl();
    } else {
      printPlan(doc.defaultView || globalThis.window);
    }
  }

  function handleExportTxt() {
    exportPlanAsTextFile(state, doc, urlImpl);
  }

  // Clear per-field error when user edits the field
  FORM_FIELDS.forEach((field) => {
    const input = $(field);
    if (input) {
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') {
          input.removeAttribute('aria-invalid');
          input.removeAttribute('aria-describedby');
          const err = $(`${field}-error`);
          if (err) err.textContent = '';
        }
      });
    }
  });

  if (elements.vName) {
    elements.vName.addEventListener('input', () => {
      if (elements.vName.getAttribute('aria-invalid') === 'true') {
        elements.vName.removeAttribute('aria-invalid');
        elements.vName.removeAttribute('aria-describedby');
        if (elements.vNameError) elements.vNameError.textContent = '';
      }
    });
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
  if (elements.regenIdeasBtn) {
    elements.regenIdeasBtn.addEventListener('click', handleRegenerateIdeas);
  }
  if (elements.printPlanBtn) {
    elements.printPlanBtn.addEventListener('click', handlePrint);
  }
  if (elements.exportTxtBtn) {
    elements.exportTxtBtn.addEventListener('click', handleExportTxt);
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
