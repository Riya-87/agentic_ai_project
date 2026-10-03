import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-500 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/80',
    warning: 'border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/80',
    error: 'border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/80',
    info: 'border-brand-500/30 bg-brand-50/90 dark:bg-brand-950/80',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-slate-800 dark:text-slate-100 ${borders[toast.type] || borders.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
