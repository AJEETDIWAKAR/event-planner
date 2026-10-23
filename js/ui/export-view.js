/**
 * Event plan export module: plain text formatting, download, and print support.
 */

import { calculateBudgetSummary } from '../budget.js';
import { getTimelineProgress } from '../timeline.js';
import { getChecklistProgress } from '../checklist.js';

/**
 * Formats the entire event plan into a structured plain text document.
 * @param {object} state - Application state
 * @returns {string} Plain text representation of the plan
 */
export function formatPlanAsText(state) {
  if (!state || !state.eventDetails) {
    return 'No active event plan available to export.';
  }

  const {
    eventDetails,
    summary,
    ideas = [],
    budgetItems = [],
    timeline = [],
    vendors = [],
    aiSource,
  } = state;
  const budgetSum = calculateBudgetSummary(eventDetails.budget, budgetItems);
  const timeProgress = getTimelineProgress(timeline);
  const vendorProgress = getChecklistProgress(vendors);

  const divider = '='.repeat(78);
  const sectionDivider = '-'.repeat(78);

  const lines = [
    divider,
    `CELEBRATION EVENT PLAN: ${eventDetails.eventName.toUpperCase()}`,
    divider,
    `Event Type:    ${eventDetails.eventType.charAt(0).toUpperCase() + eventDetails.eventType.slice(1)}`,
    `Event Date:    ${eventDetails.eventDate}`,
    `Guest Count:   ${Number(eventDetails.guestCount).toLocaleString('en-IN')}`,
    `Total Budget:  INR ${Number(eventDetails.budget).toLocaleString('en-IN')}`,
    `Preferences:   ${eventDetails.preferences || 'None specified'}`,
    `Plan Source:   ${aiSource === 'gemini' ? 'Gemini AI' : 'Built-in smart template'}`,
    '',
    sectionDivider,
    'OVERVIEW & STRATEGY',
    sectionDivider,
    summary,
    '',
    sectionDivider,
    'PERSONALIZED CELEBRATION IDEAS',
    sectionDivider,
  ];

  if (ideas.length === 0) {
    lines.push('No ideas generated yet.');
  } else {
    ideas.forEach((idea, idx) => {
      lines.push(`${idx + 1}. [${idea.category}] ${idea.title}`);
      lines.push(`   ${idea.description}`);
      lines.push('');
    });
  }

  lines.push(
    sectionDivider,
    'BUDGET TRACKER & SPEND BREAKDOWN',
    sectionDivider,
    `Planned Budget: INR ${budgetSum.totalBudget.toLocaleString('en-IN')}`,
    `Total Spent:    INR ${budgetSum.totalSpent.toLocaleString('en-IN')} (${budgetSum.utilizationPercent}%)`,
    `Remaining:      INR ${budgetSum.remaining.toLocaleString('en-IN')}${budgetSum.isOverBudget ? ' [OVER BUDGET]' : ''}`,
    ''
  );

  budgetItems.forEach((b) => {
    lines.push(
      `* ${b.category} (${b.percentage}%): Allocated INR ${b.allocated.toLocaleString('en-IN')} | Spent INR ${b.spent.toLocaleString('en-IN')}`
    );
    if (b.notes) {
      lines.push(`  Notes: ${b.notes}`);
    }
  });

  lines.push(
    '',
    sectionDivider,
    'MILESTONE TIMELINE',
    sectionDivider,
    `Progress: ${timeProgress.done} of ${timeProgress.total} milestones completed (${timeProgress.percent}%)`,
    ''
  );

  timeline.forEach((m) => {
    const mark = m.completed ? '[X]' : '[ ]';
    lines.push(`${mark} ${m.timeframe} - ${m.phase}: ${m.task}`);
  });

  lines.push(
    '',
    sectionDivider,
    'VENDOR CHECKLIST',
    sectionDivider,
    `Progress: ${vendorProgress.completed} of ${vendorProgress.total} vendors booked/paid (${vendorProgress.percent}%)`,
    ''
  );

  vendors.forEach((v) => {
    lines.push(`[${v.status.toUpperCase()}] ${v.name} (${v.category} - ${v.priority} Priority)`);
    if (v.tip) {
      lines.push(`  Tip: ${v.tip}`);
    }
  });

  lines.push(
    '',
    divider,
    'Exported from Celebration Event Planner (Saved locally in browser)',
    divider
  );

  return lines.join('\n');
}

/**
 * Generates and triggers browser download of the event plan as a .txt file.
 * @param {object} state - Application state
 * @param {Document} [doc=globalThis.document]
 * @param {typeof URL} [urlImpl=globalThis.URL]
 * @returns {boolean} True if download was initiated
 */
export function exportPlanAsTextFile(state, doc = globalThis.document, urlImpl = globalThis.URL) {
  if (!state || !state.eventDetails) return false;
  const content = formatPlanAsText(state);
  const cleanName = (state.eventDetails.eventName || 'event')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');
  const filename = `${cleanName}_plan.txt`;

  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    if (typeof urlImpl?.createObjectURL === 'function') {
      const objectUrl = urlImpl.createObjectURL(blob);
      const link = doc.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      doc.body.append(link);
      try {
        link.click();
      } catch {
        // Fail-safe for test environments where synthetic navigation is not implemented
      }
      link.remove();
      if (typeof urlImpl?.revokeObjectURL === 'function') {
        urlImpl.revokeObjectURL(objectUrl);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Triggers the browser print dialog for printable page export.
 * @param {Window} [win=globalThis.window]
 * @returns {boolean}
 */
export function printPlan(win = globalThis.window) {
  if (typeof win?.print === 'function') {
    win.print();
    return true;
  }
  return false;
}
