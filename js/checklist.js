/**
 * Vendor checklist management and progress calculation module.
 */

import { sanitizeText } from './security.js';

const STATUSES = ['Pending', 'Booked', 'Paid'];
const PRIORITIES = ['High', 'Medium', 'Low'];

const DEFAULT_VENDORS = {
  wedding: [
    { name: 'Banquet Venue & Catering Lead', category: 'Venue & Food', priority: 'High', tip: 'Confirm power backup and per-plate overtime rates in writing.' },
    { name: 'Candid & Traditional Photographer', category: 'Media', priority: 'High', tip: 'Define raw footage delivery timeline and album print count.' },
    { name: 'Floral & Stage Decorator', category: 'Decor', priority: 'High', tip: 'Approve color palette and mock lighting setup before advance payment.' },
    { name: 'DJ & Sound Engineer', category: 'Entertainment', priority: 'Medium', tip: 'Verify venue decibel limits and licensing permissions.' },
    { name: 'Guest Transport Coordinator', category: 'Logistics', priority: 'Low', tip: 'Maintain a dedicated shuttle contact sheet for elderly guests.' },
  ],
  birthday: [
    { name: 'Specialty Baker / Cake Artist', category: 'Food', priority: 'High', tip: 'Confirm dietary preferences (eggless/nut-free) and delivery time.' },
    { name: 'Party Decor & Balloon Stylist', category: 'Decor', priority: 'High', tip: 'Ensure non-damaging wall hooks for indoor setups.' },
    { name: 'Catering / Live Snack Counter', category: 'Food', priority: 'High', tip: 'Include kid-friendly finger foods and clearly labeled allergen tags.' },
    { name: 'Event Host / Activity Coordinator', category: 'Entertainment', priority: 'Medium', tip: 'Prepare a 45-minute interactive game segment to keep guests engaged.' },
    { name: 'Event Photographer', category: 'Media', priority: 'Medium', tip: 'Capture cake-cutting and family group portraits before meal service.' },
  ],
  community: [
    { name: 'Ground & Tent House Contractor', category: 'Infrastructure', priority: 'High', tip: 'Verify weather-proof canopy and unobstructed emergency exits.' },
    { name: 'PA Audio & Stage Lighting Vendor', category: 'Technical', priority: 'High', tip: 'Keep two backup wireless microphones and a dedicated generator.' },
    { name: 'Community Refreshment & Water Supplier', category: 'Food & Safety', priority: 'High', tip: 'Use biodegradable plates and place waste bins every 20 meters.' },
    { name: 'First-Aid & Security Stewards', category: 'Safety', priority: 'High', tip: 'Coordinate entry/exit crowd flow and keep an emergency vehicle lane clear.' },
    { name: 'Print & Digital Signage Partner', category: 'Outreach', priority: 'Medium', tip: 'Print bilingual directional boards for registration, washrooms, and stage.' },
  ],
};

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
