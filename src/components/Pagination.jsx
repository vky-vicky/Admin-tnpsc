import React from 'react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 3; // Max neighbors

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 py-8 animate-slide-up">
      {/* Summary Badge */}
      <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-500 hover:scale-105">
         <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Showing <span className="text-blue-500 dark:text-blue-400">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)}</span> of {totalItems}
         </p>
      </div>

      {/* Main Navigation Pill */}
      <div className="glass p-2 rounded-2xl border border-white/20 dark:border-slate-800 shadow-2xl flex items-center gap-1 group">
        
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 rounded-xl text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-0 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 active:scale-90"
          title="Previous Page"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((number, idx) => (
            number === '...' ? (
              <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 font-black text-xs pt-1">
                •••
              </span>
            ) : (
              <div key={number} className="relative group/btn">
                <button
                  onClick={() => onPageChange(number)}
                  className={`w-11 h-11 rounded-xl font-black text-xs transition-all duration-500 flex items-center justify-center ${
                    currentPage === number
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110 z-10'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 hover:scale-105 active:scale-95'
                  }`}
                >
                  {number}
                </button>
                {currentPage === number && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </div>
            )
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2.5 rounded-xl text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-0 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 active:scale-90"
          title="Next Page"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>

      {/* Jump to first/last quick links (Subtle) */}
      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         {currentPage > 5 && (
            <button onClick={() => onPageChange(1)} className="text-[9px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-[0.2em] transition-colors">Start</button>
         )}
         {currentPage < totalPages - 5 && (
            <button onClick={() => onPageChange(totalPages)} className="text-[9px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-[0.2em] transition-colors">End</button>
         )}
      </div>
    </div>
  );
};

export default Pagination;
