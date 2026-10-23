import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildVendorChecklist,
  addCustomVendor,
  updateVendorStatus,
  getChecklistProgress,
} from '../js/checklist.js';

test('checklist build, add, update, progress', () => {
  let list = buildVendorChecklist('wedding');
  assert.equal(list.length, 5);
  assert.equal(getChecklistProgress(list).percent, 0);
  list = addCustomVendor(list, { name: 'Mehendi Artist' });
  assert.equal(list.length, 6);
  assert.equal(addCustomVendor(list, { name: 'x' }).length, 6);
  list = updateVendorStatus(list, 'vendor-1', 'Booked');
  list = updateVendorStatus(list, 'vendor-2', 'Paid');
  assert.deepEqual(getChecklistProgress(list), { total: 6, completed: 2, percent: 33 });
  assert.equal(updateVendorStatus(list, 'vendor-3', 'Hacked'), list);
});
