import React from 'react';
import { Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { calculateBudgetSummary } from '../../js/budget.js';

export default function BudgetTracker({ budgetItems = [], totalBudget = 0, onSpentChange }) {
  if (!budgetItems || budgetItems.length === 0) return null;

  const summary = calculateBudgetSummary(totalBudget, budgetItems);

  const summaryCards = [
    {
      label: 'Total Budget',
      value: `₹${summary.totalBudget.toLocaleString('en-IN')}`,
      color: 'text-slate-900',
    },
    {
      label: 'Total Spent',
      value: `₹${summary.totalSpent.toLocaleString('en-IN')}`,
      color: summary.isOverBudget ? 'text-red-600' : 'text-emerald-600',
    },
    {
      label: 'Remaining',
      value: `₹${summary.remaining.toLocaleString('en-IN')}`,
      color: summary.isOverBudget ? 'text-red-600' : 'text-blue-600',
    },
    {
      label: 'Utilization',
      value: `${summary.utilizationPercent}%`,
      color: summary.utilizationPercent > 90 ? 'text-amber-600' : 'text-violet-600',
    },
  ];

  return (
    <section aria-labelledby="budget-heading" className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-teal-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg text-white">
              <Wallet className="w-4 h-4" />
            </div>
            <h2 id="budget-heading" className="text-base font-semibold text-slate-900">
              Budget Tracker
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Over Budget Warning */}
          {summary.isOverBudget && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                Over budget by ₹{Math.abs(summary.remaining).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summaryCards.map((card, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center"
              >
                <p className="text-xs text-slate-500 font-medium mb-1">{card.label}</p>
                <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Overall Utilization
              </span>
              <span className="font-semibold">{summary.utilizationPercent}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.isOverBudget
                    ? 'bg-gradient-to-r from-red-400 to-red-500'
                    : summary.utilizationPercent > 80
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`}
                style={{ width: `${Math.min(100, summary.utilizationPercent)}%` }}
              />
            </div>
          </div>

          {/* Budget Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    %
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Allocated
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Spent
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetItems.map((item) => {
                  const spentPercent =
                    item.allocated > 0
                      ? Math.min(100, Math.round((item.spent / item.allocated) * 100))
                      : 0;
                  const isItemOver = item.spent > item.allocated;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors duration-150"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-slate-900">{item.category}</p>
                          {item.notes && (
                            <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-600 font-medium">
                        {item.percentage}%
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700 font-medium">
                        ₹{item.allocated.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <input
                          type="number"
                          min={0}
                          value={item.spent}
                          onChange={(e) => onSpentChange(item.id, e.target.value)}
                          aria-label={`Spent for ${item.category}`}
                          className={`w-24 px-2 py-1.5 text-right text-sm border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                            isItemOver
                              ? 'border-red-300 text-red-600 bg-red-50'
                              : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                          }`}
                        />
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isItemOver
                                ? 'bg-red-400'
                                : spentPercent > 80
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                            }`}
                            style={{ width: `${spentPercent}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
