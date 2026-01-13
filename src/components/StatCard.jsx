import React, { useEffect, useState } from 'react';

const StatCard = ({ title, count, icon, color, trend }) => {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(String(count).replace(/,/g, ''), 10) || 0;
    if (start === end) return;
    
    // Simple linear count up
    let timer = setInterval(() => {
      start += Math.ceil(end / 20);
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplayCount(start);
    }, 40);
    return () => clearInterval(timer);
  }, [count]);

  const bgColors = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-teal-600',
    orange: 'from-orange-500 to-red-500', 
    purple: 'from-purple-500 to-violet-600'
  };

  const bgClass = bgColors[color] || bgColors.blue;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
            {displayCount.toLocaleString()}+
          </h3>
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trend > 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1`}>
              {trend > 0 ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
              )}
              {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-br ${bgClass} text-white shadow-lg shadow-${color}-500/30 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
