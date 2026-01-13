import React from 'react';
import { useToast } from '../../context/ToastContext';

const icons = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const styles = {
  success: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300",
  error: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300",
  warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300",
  info: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50 text-sky-800 dark:text-sky-300",
};

const barStyles = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
};

const ToastItem = ({ toast }) => {
  const { removeToast } = useToast();
  
  return (
    <div 
      className={`
        relative overflow-hidden min-w-[320px] max-w-md p-4 rounded-2xl border shadow-2xl backdrop-blur-md
        transition-all duration-300 flex items-start gap-4 group
        ${styles[toast.type]}
        ${toast.isExiting ? 'animate-alert-out' : 'animate-alert-in'}
      `}
    >
      <div className={`shrink-0 p-2 rounded-xl bg-white/50 dark:bg-black/20 shadow-sm`}>
        {icons[toast.type]}
      </div>

      <div className="flex-1 pt-1.5">
        <h4 className="font-bold text-sm tracking-tight mb-1 capitalize">{toast.type}</h4>
        <p className="text-sm font-medium opacity-90 leading-relaxed">{toast.message}</p>
        
        {toast.actions && (
            <div className="flex gap-3 mt-4">
                {toast.actions.map((action, i) => (
                    <button 
                        key={i}
                        onClick={() => { action.onClick(); removeToast(toast.id); }}
                        className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        )}
      </div>

      <button 
        onClick={() => removeToast(toast.id)}
        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-current transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress Bar */}
      {toast.duration !== Infinity && !toast.isExiting && (
          <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5 dark:bg-white/5">
              <div 
                className={`h-full animate-progress ${barStyles[toast.type]}`}
                style={{ animationDuration: `${toast.duration}ms` }}
              />
          </div>
      )}
    </div>
  );
};

const ToastContainer = () => {
    const { toasts } = useToast();

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-4">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;
