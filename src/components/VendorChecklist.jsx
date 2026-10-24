import React, { useState } from 'react';
import { ClipboardCheck, Plus, X, ChevronDown } from 'lucide-react';
import { getChecklistProgress, STATUSES, PRIORITIES } from '../../js/checklist.js';

const PRIORITY_COLORS = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
};

const STATUS_COLORS = {
  Pending: 'bg-slate-100 text-slate-600',
  Booked: 'bg-blue-100 text-blue-700',
  Paid: 'bg-emerald-100 text-emerald-700',
};

export default function VendorChecklist({ vendors = [], onStatusChange, onAddVendor }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: '',
    priority: 'Medium',
    tip: '',
  });

  if (!vendors || vendors.length === 0) return null;

  const progress = getChecklistProgress(vendors);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newVendor.name.trim().length < 2) return;
    onAddVendor(newVendor);
    setNewVendor({ name: '', category: '', priority: 'Medium', tip: '' });
    setShowAddForm(false);
  };

  return (
    <section aria-labelledby="vendor-heading" className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-purple-50/80 to-fuchsia-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-lg text-white">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <h2 id="vendor-heading" className="text-base font-semibold text-slate-900">
                Vendor Checklist
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  {progress.completed}/{progress.total} booked
                </span>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-500 transition-all duration-500"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-purple-600">{progress.percent}%</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-200"
              >
                {showAddForm ? (
                  <>
                    <X className="w-3 h-3" /> Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" /> Add Vendor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Add Vendor Form */}
          {showAddForm && (
            <form
              onSubmit={handleAdd}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fade-in"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Vendor name"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor((p) => ({ ...p, name: e.target.value }))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  required
                />
                <input
                  type="text"
                  placeholder="Category (e.g. Food, Decor)"
                  value={newVendor.category}
                  onChange={(e) => setNewVendor((p) => ({ ...p, category: e.target.value }))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                />
                <select
                  value={newVendor.priority}
                  onChange={(e) => setNewVendor((p) => ({ ...p, priority: e.target.value }))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 cursor-pointer"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p} Priority</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Tip or note (optional)"
                  value={newVendor.tip}
                  onChange={(e) => setNewVendor((p) => ({ ...p, tip: e.target.value }))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:shadow-md transition-all duration-200"
              >
                <Plus className="w-3 h-3" /> Add to Checklist
              </button>
            </form>
          )}

          {/* Vendor Cards */}
          <div className="space-y-2 stagger-children">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="group flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all duration-200"
              >
                {/* Status Indicator */}
                <div
                  className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                    vendor.status === 'Paid'
                      ? 'bg-emerald-500'
                      : vendor.status === 'Booked'
                        ? 'bg-blue-500'
                        : 'bg-slate-300'
                  }`}
                />

                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900">{vendor.name}</h3>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{vendor.category}</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                        PRIORITY_COLORS[vendor.priority] || PRIORITY_COLORS.Medium
                      }`}
                    >
                      {vendor.priority}
                    </span>
                  </div>
                  {vendor.tip && (
                    <p className="text-xs text-slate-400 truncate max-w-md">{vendor.tip}</p>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="relative flex-shrink-0">
                  <select
                    value={vendor.status}
                    onChange={(e) => onStatusChange(vendor.id, e.target.value)}
                    aria-label={`Status for ${vendor.name}`}
                    className={`appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold rounded-lg border-0 cursor-pointer transition-colors duration-200 ${
                      STATUS_COLORS[vendor.status] || STATUS_COLORS.Pending
                    }`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
