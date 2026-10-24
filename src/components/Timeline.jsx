import React from 'react';
import { Clock, CheckCircle2, Circle } from 'lucide-react';
import { getTimelineProgress } from '../../js/timeline.js';

export default function Timeline({ timelineItems = [], onToggle }) {
  if (!timelineItems || timelineItems.length === 0) return null;

  const progress = getTimelineProgress(timelineItems);

  return (
    <section aria-labelledby="timeline-heading" className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg text-white">
                <Clock className="w-4 h-4" />
              </div>
              <h2 id="timeline-heading" className="text-base font-semibold text-slate-900">
                Milestone Timeline
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {progress.done}/{progress.total} done
              </span>
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-blue-600">{progress.percent}%</span>
            </div>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="p-6">
          <div className="space-y-1">
            {timelineItems.map((item, idx) => (
              <div
                key={item.id}
                className="group relative flex gap-4"
              >
                {/* Vertical connector line */}
                {idx < timelineItems.length - 1 && (
                  <div
                    className="absolute left-[15px] top-10 bottom-0 w-px bg-slate-200 group-hover:bg-brand-200 transition-colors duration-200"
                  />
                )}

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => onToggle(item.id)}
                  aria-label={`Mark "${item.task}" as ${item.completed ? 'incomplete' : 'complete'}`}
                  className="flex-shrink-0 mt-1 relative z-10 transition-transform duration-200 hover:scale-110"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-[30px] h-[30px] text-emerald-500" />
                  ) : (
                    <Circle className="w-[30px] h-[30px] text-slate-300 group-hover:text-brand-400 transition-colors duration-200" />
                  )}
                </button>

                {/* Content */}
                <div
                  className={`flex-1 pb-6 transition-opacity duration-200 ${
                    item.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      {item.phase}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.timeframe}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      item.completed
                        ? 'text-slate-400 line-through'
                        : 'text-slate-700'
                    }`}
                  >
                    {item.task}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
