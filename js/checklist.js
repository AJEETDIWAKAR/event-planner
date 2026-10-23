/**
 * Vendor checklist management and progress calculation module.
 */

import { sanitizeText } from './security.js';
import { DEFAULT_VENDORS } from './data/default-data.js';

export const STATUSES = ['Pending', 'Booked', 'Paid'];
export const PRIORITIES = ['High', 'Medium', 'Low'];

/**
 * @typedef {object} VendorItem
 * @property {string} id - Unique identifier for the vendor entry
 * @property {string} name - Vendor or service name
 * @property {string} category - Service category (Food, Decor, Media, etc.)
 * @property {'High' | 'Medium' | 'Low'} priority - Urgency/criticality level
 * @property {string} tip - Practical negotiation or verification tip
 * @property {'Pending' | 'Booked' | 'Paid'} status - Current contracting status
 */

/**
 * @typedef {object} ChecklistProgress
 * @property {number} total - Total vendor count
 * @property {number} completed - Count of booked or paid vendors
 * @property {number} percent - Completion percentage (0-100)
 */

/**
 * Builds vendor checklist from custom input or default presets.
 * @param {'wedding' | 'birthday' | 'community'} [eventType='wedding'] - Event category
 * @param {Array<Partial<VendorItem>>} [customVendors=[]] - Custom vendors if provided
 * @returns {VendorItem[]}
 */
export function buildVendorChecklist(eventType = 'wedding', customVendors = []) {
  const source =
    Array.isArray(customVendors) && customVendors.length > 0
      ? customVendors
      : DEFAULT_VENDORS[eventType] || DEFAULT_VENDORS.wedding;

  return source.map((v, idx) => ({
    id: v.id || `vendor-${idx + 1}`,
    name: sanitizeText(v.name, 70) || `Vendor ${idx + 1}`,
    category: sanitizeText(v.category || 'General', 50),
    priority: PRIORITIES.includes(v.priority) ? v.priority : 'Medium',
    tip: sanitizeText(v.tip || 'Verify contract terms and delivery schedule.', 160),
    status: STATUSES.includes(v.status) ? v.status : 'Pending',
  }));
}

/**
 * Appends a new custom vendor immutably to the checklist.
 * @param {VendorItem[]} [currentList=[]] - Current vendor list
 * @param {{name?: string, category?: string, priority?: string, tip?: string}} [newVendor={}] - New vendor details
 * @returns {VendorItem[]} Updated vendor list with the added vendor, or unchanged list if invalid
 */
export function addCustomVendor(currentList = [], newVendor = {}) {
  const cleanName = sanitizeText(newVendor.name, 70);
  if (cleanName.length < 2) {
    return currentList;
  }
  return [
    ...currentList,
    {
      id: `vendor-custom-${Date.now()}-${currentList.length + 1}`,
      name: cleanName,
      category: sanitizeText(newVendor.category || 'Custom', 50),
      priority: PRIORITIES.includes(newVendor.priority) ? newVendor.priority : 'Medium',
      tip: sanitizeText(newVendor.tip || 'Custom vendor requirement added by organizer.', 160),
      status: 'Pending',
    },
  ];
}

/**
 * Updates a vendor's status immutably.
 * @param {VendorItem[]} [currentList=[]] - Current vendor list
 * @param {string} id - Vendor id to update
 * @param {'Pending' | 'Booked' | 'Paid'} nextStatus - New status value
 * @returns {VendorItem[]} Updated vendor list
 */
export function updateVendorStatus(currentList = [], id, nextStatus) {
  if (!STATUSES.includes(nextStatus)) {
    return currentList;
  }
  return currentList.map((item) => (item.id === id ? { ...item, status: nextStatus } : item));
}

/**
 * Computes completion metrics for the vendor checklist (Booked and Paid count as completed).
 * @param {VendorItem[]} [currentList=[]] - Current vendor list
 * @returns {ChecklistProgress}
 */
export function getChecklistProgress(currentList = []) {
  const total = currentList.length;
  if (total === 0) {
    return { total: 0, completed: 0, percent: 0 };
  }
  const completed = currentList.filter(
    (item) => item.status === 'Booked' || item.status === 'Paid'
  ).length;
  return { total, completed, percent: Math.round((completed / total) * 100) };
}
