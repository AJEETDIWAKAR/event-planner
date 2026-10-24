import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import EventForm from './components/EventForm.jsx';
import Overview from './components/Overview.jsx';
import IdeasGrid from './components/IdeasGrid.jsx';
import BudgetTracker from './components/BudgetTracker.jsx';
import Timeline from './components/Timeline.jsx';
import VendorChecklist from './components/VendorChecklist.jsx';
import ActionsRow from './components/ActionsRow.jsx';
import { generateEventPlan, regenerateEventIdeas } from '../js/ai-service.js';
import { buildBudgetAllocation, updateBudgetSpent } from '../js/budget.js';
import { buildTimelineSchedule, toggleMilestone } from '../js/timeline.js';
import { buildVendorChecklist, addCustomVendor, updateVendorStatus } from '../js/checklist.js';
import { savePlanState, loadPlanState, clearPlanState } from '../js/storage.js';
import { exportPlanAsTextFile, printPlan } from '../js/ui/export-view.js';

export default function App() {
  const [state, setState] = useState({
    eventDetails: null,
    budgetItems: [],
    vendors: [],
    timeline: [],
    ideas: [],
    summary: '',
    aiSource: 'demo-fallback',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Load saved state on mount
  useEffect(() => {
    const saved = loadPlanState();
    if (saved && saved.eventDetails) {
      setState((prev) => ({ ...prev, ...saved }));
    }
  }, []);

  // Persist state whenever it changes (and has event details)
  useEffect(() => {
    if (state.eventDetails) {
      savePlanState(state);
    }
  }, [state]);

  const handleSubmit = useCallback(async (formData) => {
    setError('');
    setFieldErrors({});
    setIsLoading(true);
    setSuccessMessage('');

    const result = await generateEventPlan(formData);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errors.join(' '));
      setFieldErrors(result.fieldErrors || {});
      return;
    }

    const { input, plan } = result;
    setState({
      eventDetails: input,
      summary: plan.summary,
      ideas: plan.personalizedIdeas,
      aiSource: plan.source,
      budgetItems: buildBudgetAllocation(input.budget, input.eventType, plan.budgetBreakdown),
      timeline: buildTimelineSchedule(input.eventType, input.eventDate, plan.timeline),
      vendors: buildVendorChecklist(input.eventType, plan.vendors),
    });
    setSuccessMessage('Plan generated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  const handleRegenerateIdeas = useCallback(async () => {
    if (!state.eventDetails) return;
    setIsRegenerating(true);
    const freshIdeas = await regenerateEventIdeas(state.eventDetails);
    setState((prev) => ({ ...prev, ideas: freshIdeas }));
    setIsRegenerating(false);
  }, [state.eventDetails]);

  const handleBudgetSpentChange = useCallback((itemId, newSpent) => {
    setState((prev) => ({
      ...prev,
      budgetItems: updateBudgetSpent(prev.budgetItems, itemId, newSpent),
    }));
  }, []);

  const handleToggleMilestone = useCallback((milestoneId) => {
    setState((prev) => ({
      ...prev,
      timeline: toggleMilestone(prev.timeline, milestoneId),
    }));
  }, []);

  const handleVendorStatusChange = useCallback((vendorId, nextStatus) => {
    setState((prev) => ({
      ...prev,
      vendors: updateVendorStatus(prev.vendors, vendorId, nextStatus),
    }));
  }, []);

  const handleAddVendor = useCallback((vendorData) => {
    setState((prev) => ({
      ...prev,
      vendors: addCustomVendor(prev.vendors, vendorData),
    }));
  }, []);

  const handleReset = useCallback(() => {
    clearPlanState();
    setState({
      eventDetails: null,
      budgetItems: [],
      vendors: [],
      timeline: [],
      ideas: [],
      summary: '',
      aiSource: 'demo-fallback',
    });
    setError('');
    setFieldErrors({});
    setSuccessMessage('Saved plan cleared.');
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  const handlePrint = useCallback(() => {
    printPlan(window);
  }, []);

  const handleExport = useCallback(() => {
    exportPlanAsTextFile(state, document, URL);
  }, [state]);

  const hasResults = state.eventDetails !== null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:text-brand-600 focus:font-semibold"
      >
        Skip to content
      </a>

      <Header />

      <main id="main" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Event Form Section */}
        <EventForm
          onSubmit={handleSubmit}
          onReset={handleReset}
          isLoading={isLoading}
          error={error}
          fieldErrors={fieldErrors}
          successMessage={successMessage}
        />

        {/* Results Section */}
        {hasResults && (
          <div className="space-y-6 animate-slide-up">
            <ActionsRow onPrint={handlePrint} onExport={handleExport} />

            <Overview
              summary={state.summary}
              eventDetails={state.eventDetails}
              aiSource={state.aiSource}
            />

            <IdeasGrid
              ideas={state.ideas}
              onRegenerate={handleRegenerateIdeas}
              isRegenerating={isRegenerating}
            />

            <BudgetTracker
              budgetItems={state.budgetItems}
              totalBudget={state.eventDetails.budget}
              onSpentChange={handleBudgetSpentChange}
            />

            <Timeline
              timelineItems={state.timeline}
              onToggle={handleToggleMilestone}
            />

            <VendorChecklist
              vendors={state.vendors}
              onStatusChange={handleVendorStatusChange}
              onAddVendor={handleAddVendor}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-slate-500">
            🔒 Plans are saved only in your browser — 100% private.
          </p>
        </div>
      </footer>
    </div>
  );
}
