import React from 'react';
import { PartyPopper } from 'lucide-react';

export default function Header() {
  return (
    <header className="no-print border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl text-white shadow-lg shadow-violet-500/25">
            <PartyPopper className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Celebration Planner
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              AI-Powered Event Planning
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            ✨ GenAI Powered
          </span>
        </div>
      </div>
    </header>
  );
}
