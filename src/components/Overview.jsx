import React from 'react';
import { Eye, CalendarDays, Users, IndianRupee, Clock, Cpu } from 'lucide-react';
import { calculateDaysRemaining } from '../../js/timeline.js';

export default function Overview({ summary, eventDetails, aiSource }) {
  if (!eventDetails) return null;

  const daysRemaining = calculateDaysRemaining(eventDetails.eventDate);
  const perGuest = Math.round(eventDetails.budget / Math.max(1, eventDetails.guestCount));

  const stats = [
    {
      label: 'Days Remaining',
      value: daysRemaining,
      icon: Clock,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Total Guests',
      value: Number(eventDetails.guestCount).toLocaleString('en-IN'),
      icon: Users,
      color: 'bg-violet-50 text-violet-600',
      iconBg: 'bg-violet-100',
    },
    {
      label: 'Total Budget',
      value: `₹${Number(eventDetails.budget).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
  ];

  return (
    <section aria-labelledby="overview-heading" className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
                <span>{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`w-4 h-4 ${stat.color.split(' ')[1]}`} />
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-pink-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg text-white">
                <Eye className="w-4 h-4" />
              </div>
              <h2 id="overview-heading" className="text-base font-semibold text-slate-900">
                Overview & Strategy
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="hidden sm:flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> {eventDetails.eventDate}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-slate-200">
                <Cpu className="w-3 h-3" />
                {aiSource === 'gemini' ? 'Gemini AI' : 'Smart Template'}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full font-medium border border-violet-100">
              {eventDetails.eventType.charAt(0).toUpperCase() + eventDetails.eventType.slice(1)}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
              ₹{perGuest.toLocaleString('en-IN')} / guest
            </span>
            {eventDetails.preferences && (
              <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full font-medium border border-pink-100">
                {eventDetails.preferences.slice(0, 40)}{eventDetails.preferences.length > 40 ? '…' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
