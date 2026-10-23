/**
 * Vendor checklist management and progress calculation module.
 */

import { sanitizeText } from './security.js';
import { DEFAULT_VENDORS } from './data/default-data.js';

const STATUSES = ['Pending', 'Booked', 'Paid'];
const PRIORITIES = ['High', 'Medium', 'Low'];

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

export function updateVendorStatus(currentList = [], id, nextStatus) {
  if (!STATUSES.includes(nextStatus)) {
    return currentList;
  }
  return currentList.map((item) => (item.id === id ? { ...item, status: nextStatus } : item));
}

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
