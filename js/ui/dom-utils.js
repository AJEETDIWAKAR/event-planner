/**
 * DOM utility functions for secure, CSP-compliant rendering.
 * All functions use DOM APIs (textContent, createElement, etc.) and avoid innerHTML or inline styles.
 */

/**
 * Creates an HTML element with optional text and class.
 * @param {string} tag
 * @param {string} [text]
 * @param {string} [className]
 * @param {Document} [doc]
 * @returns {HTMLElement}
 */
export function el(tag, text, className, doc = globalThis.document) {
  const node = doc.createElement(tag);
  if (text !== undefined && text !== null) {
    node.textContent = String(text);
  }
  if (className) {
    node.className = className;
  }
  return node;
}

/**
 * Formats a numeric value into INR currency representation.
 * @param {number | string} n
 * @returns {string}
 */
export function fmtCurrency(n) {
  return `\u20B9${Number(n || 0).toLocaleString('en-IN')}`;
}
