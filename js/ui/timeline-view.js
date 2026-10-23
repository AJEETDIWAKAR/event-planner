/**
 * Timeline schedule view rendering module.
 */

import { el } from './dom-utils.js';
import { getTimelineProgress } from '../timeline.js';

/**
 * Renders the milestone timeline and progress indicator.
 * @param {HTMLElement} listEl - Ordered list container for timeline milestones
 * @param {HTMLElement} progressEl - Paragraph element showing completed milestone stats
 * @param {Array<object>} timelineItems - List of milestones
 * @param {(milestoneId: string) => void} [onToggle] - Callback when checkbox is toggled
 */
export function renderTimeline(listEl, progressEl, timelineItems = [], onToggle) {
  const doc = listEl?.ownerDocument || progressEl?.ownerDocument || globalThis.document;
  const p = getTimelineProgress(timelineItems);

  if (progressEl) {
    progressEl.textContent = `${p.done} of ${p.total} milestones done (${p.percent}%)`;
  }

  if (!listEl) return;
  listEl.replaceChildren();

  timelineItems.forEach((m) => {
    const li = el('li', undefined, undefined, doc);
    const label = el('label', undefined, undefined, doc);
    const box = doc.createElement('input');
    box.type = 'checkbox';
    box.checked = Boolean(m.completed);
    if (typeof onToggle === 'function') {
      box.addEventListener('change', () => {
        onToggle(m.id);
      });
    }

    label.append(box, el('span', ` ${m.timeframe} - ${m.phase}: ${m.task}`, undefined, doc));
    li.append(label);
    listEl.append(li);
  });
}
