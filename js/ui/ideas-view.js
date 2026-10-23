/**
 * Personalized ideas cards view rendering module.
 */

import { el } from './dom-utils.js';

/**
 * Renders the personalized ideas cards list.
 * @param {HTMLElement} listEl - Unordered list container for ideas cards
 * @param {Array<{title: string, category: string, description: string}>} ideas - Ideas to render
 */
export function renderIdeas(listEl, ideas = []) {
  if (!listEl) return;
  const doc = listEl.ownerDocument || globalThis.document;
  listEl.replaceChildren();

  ideas.forEach((i) => {
    const li = el('li', undefined, undefined, doc);
    li.append(
      el('strong', i.title, undefined, doc),
      el('span', i.category, 'badge', doc),
      el('p', i.description, undefined, doc)
    );
    listEl.append(li);
  });
}
