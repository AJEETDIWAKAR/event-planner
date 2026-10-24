import React from 'react';
import { Lightbulb, RefreshCw, Loader2 } from 'lucide-react';

const CATEGORY_COLORS = {
  'Theme & Decor': 'bg-violet-50 text-violet-700 border-violet-200',
  'Catering': 'bg-amber-50 text-amber-700 border-amber-200',
  'Entertainment': 'bg-pink-50 text-pink-700 border-pink-200',
  'Guest Experience': 'bg-blue-50 text-blue-700 border-blue-200',
  'Beverages': 'bg-teal-50 text-teal-700 border-teal-200',
  'Sustainability': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Activities': 'bg-orange-50 text-orange-700 border-orange-200',
  'Media': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Operations': 'bg-slate-100 text-slate-700 border-slate-200',
  'Safety': 'bg-red-50 text-red-700 border-red-200',
  'Accessibility': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Community Engagement': 'bg-purple-50 text-purple-700 border-purple-200',
  'Community Support': 'bg-lime-50 text-lime-700 border-lime-200',
  'Culture & Entertainment': 'bg-rose-50 text-rose-700 border-rose-200',
};

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || 'bg-slate-50 text-slate-700 border-slate-200';
}

export default function IdeasGrid({ ideas = [], onRegenerate, isRegenerating }) {
  if (!ideas || ideas.length === 0) return null;

  return (
    <section aria-labelledby="ideas-heading" className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-orange-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg text-white">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h2 id="ideas-heading" className="text-base font-semibold text-slate-900">
                Personalized Ideas
              </h2>
            </div>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-brand-600 hover:border-brand-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Refreshing…
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {ideas.map((idea, idx) => (
              <div
                key={idx}
                className="group p-5 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {idea.title}
                  </h3>
                  <span className="flex-shrink-0 text-lg">
                    {idx === 0 ? '🎨' : idx === 1 ? '🍽️' : idx === 2 ? '🎶' : '✨'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {idea.description}
                </p>
                <span
                  className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${getCategoryColor(idea.category)}`}
                >
                  {idea.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
