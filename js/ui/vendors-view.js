/**
 * Vendor checklist view rendering module.
 */

import { el } from './dom-utils.js';
import { getChecklistProgress } from '../checklist.js';

const STATUS_OPTIONS = ['Pending', 'Booked', 'Paid'];

/**
 * Renders the vendor checklist cards and progress indicator.
 * @param {HTMLElement} listEl - Unordered list container for vendor cards
 * @param {HTMLElement} progressEl - Paragraph element showing vendor progress
 * @param {Array<object>} vendorItems - List of vendors
 * @param {(vendorId: string, nextStatus: string) => void} [onStatusChange] - Callback when status select changes
 */
export function renderVendors(listEl, progressEl, vendorItems = [], onStatusChange) {
  const doc = listEl?.ownerDocument || progressEl?.ownerDocument || globalThis.document;
  const p = getChecklistProgress(vendorItems);

  if (progressEl) {
    progressEl.textContent = `${p.completed} of ${p.total} vendors booked (${p.percent}%)`;
  }

  if (!listEl) return;
  listEl.replaceChildren();

  vendorItems.forEach((v) => {
    const li = el('li', undefined, undefined, doc);
    li.append(
      el('strong', v.name, undefined, doc),
      el('p', `${v.category} - ${v.priority} priority`, 'muted', doc),
      el('p', v.tip, undefined, doc)
    );

    const label = el('label', `Status for ${v.name}`, undefined, doc);
    label.htmlFor = `status-${v.id}`;

    const select = doc.createElement('select');
    select.id = `status-${v.id}`;
    STATUS_OPTIONS.forEach((s) => {
      const o = el('option', s, undefined, doc);
      o.value = s;
      o.selected = s === v.status;
      select.append(o);
    });

    if (typeof onStatusChange === 'function') {
      select.addEventListener('change', () => {
        onStatusChange(v.id, select.value);
      });
    }

    li.append(label, select);
    listEl.append(li);
  });
}
