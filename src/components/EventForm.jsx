import React, { useState } from 'react';
import { Send, Trash2, AlertCircle, CheckCircle, Loader2, CalendarDays, Users, IndianRupee, Type, Palette, Sparkles } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding', emoji: '💒' },
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'community', label: 'Community Event', emoji: '🏘️' },
];

export default function EventForm({ onSubmit, onReset, isLoading, error, fieldErrors, successMessage }) {
  const [formData, setFormData] = useState({
    eventType: 'wedding',
    eventName: '',
    budget: '',
    guestCount: '',
    eventDate: '',
    preferences: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputBaseClass =
    'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none';
  const errorInputClass = 'border-red-300 focus:border-red-500 focus:ring-red-500/20';

  return (
    <section className="my-8 animate-fade-in" aria-labelledby="form-heading">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="form-heading" className="text-base font-semibold text-slate-900">
                Event Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in the details and let AI create your perfect plan
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Event Type */}
            <div className="space-y-2">
              <label htmlFor="eventType" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Type className="w-4 h-4 text-slate-400" />
                Event Type
              </label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className={`${inputBaseClass} ${fieldErrors.eventType ? errorInputClass : ''} cursor-pointer`}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.emoji} {t.label}
                  </option>
                ))}
              </select>
              {fieldErrors.eventType && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.eventType}
                </p>
              )}
            </div>

            {/* Event Name */}
            <div className="space-y-2">
              <label htmlFor="eventName" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Type className="w-4 h-4 text-slate-400" />
                Event Name
              </label>
              <input
                id="eventName"
                name="eventName"
                type="text"
                maxLength={100}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.eventName}
                placeholder="e.g. Aarav & Priya's Wedding"
                value={formData.eventName}
                onChange={handleChange}
                className={`${inputBaseClass} ${fieldErrors.eventName ? errorInputClass : ''}`}
              />
              {fieldErrors.eventName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.eventName}
                </p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label htmlFor="budget" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <IndianRupee className="w-4 h-4 text-slate-400" />
                Total Budget (INR)
              </label>
              <input
                id="budget"
                name="budget"
                type="number"
                min={1000}
                step={1000}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.budget}
                placeholder="e.g. 500000"
                value={formData.budget}
                onChange={handleChange}
                className={`${inputBaseClass} ${fieldErrors.budget ? errorInputClass : ''}`}
              />
              {fieldErrors.budget && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.budget}
                </p>
              )}
            </div>

            {/* Guest Count */}
            <div className="space-y-2">
              <label htmlFor="guestCount" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Users className="w-4 h-4 text-slate-400" />
                Guest Count
              </label>
              <input
                id="guestCount"
                name="guestCount"
                type="number"
                min={5}
                max={50000}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.guestCount}
                placeholder="e.g. 200"
                value={formData.guestCount}
                onChange={handleChange}
                className={`${inputBaseClass} ${fieldErrors.guestCount ? errorInputClass : ''}`}
              />
              {fieldErrors.guestCount && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.guestCount}
                </p>
              )}
            </div>

            {/* Event Date */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="eventDate" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                Event Date
              </label>
              <input
                id="eventDate"
                name="eventDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.eventDate}
                value={formData.eventDate}
                onChange={handleChange}
                className={`${inputBaseClass} ${fieldErrors.eventDate ? errorInputClass : ''}`}
              />
              {fieldErrors.eventDate && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.eventDate}
                </p>
              )}
            </div>

            {/* Preferences */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="preferences" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Palette className="w-4 h-4 text-slate-400" />
                Preferences (theme, food, culture)
              </label>
              <textarea
                id="preferences"
                name="preferences"
                maxLength={300}
                rows={3}
                placeholder="e.g. Royal Rajasthani theme, vegetarian cuisine, sangeet night..."
                value={formData.preferences}
                onChange={handleChange}
                className={`${inputBaseClass} resize-none ${fieldErrors.preferences ? errorInputClass : ''}`}
              />
              {fieldErrors.preferences && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.preferences}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              id="submit-btn"
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Plan
                </>
              )}
            </button>
            <button
              type="button"
              id="reset-btn"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear Saved Plan
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
