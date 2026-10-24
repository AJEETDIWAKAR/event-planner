import React from 'react';
import { Printer, Download } from 'lucide-react';

export default function ActionsRow({ onPrint, onExport }) {
  return (
    <div className="no-print flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onPrint}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-brand-600 hover:border-brand-200 hover:-translate-y-0.5 shadow-sm transition-all duration-200"
      >
        <Printer className="w-3.5 h-3.5" />
        Print
      </button>
      <button
        type="button"
        onClick={onExport}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-brand-600 hover:border-brand-200 hover:-translate-y-0.5 shadow-sm transition-all duration-200"
      >
        <Download className="w-3.5 h-3.5" />
        Export .txt
      </button>
    </div>
  );
}
