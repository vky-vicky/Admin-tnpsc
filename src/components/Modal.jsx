import React, { useEffect } from 'react';

const BaseModal = ({ isOpen, onClose, title, subtitle, children, footer, maxWidth = 'max-w-2xl' }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-modal-backdrop"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-modal-content`}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                {subtitle}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all transform active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
          <div className="animate-fade-in [animation-delay:0.2s]">
            {children}
          </div>
        </div>

        {/* Footer (Optional) */}
        {footer && (
          <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 animate-fade-in [animation-delay:0.3s]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;
