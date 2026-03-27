import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';

const ActivityLogs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [limit, setLimit] = useState(100);

  const fetchLogs = useCallback(async (currentLimit) => {
    setLoading(true);
    try {
      const resp = await adminService.getRecentActivity(currentLimit);
      setLogs(Array.isArray(resp) ? resp : (resp.data || resp.activities || []));
    } catch (err) {
      toast.error('Fetch Failed', 'Could not retrieve activity logs.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLogs(limit);
  }, [limit, fetchLogs]);

  const getStatusColor = (type) => {
    const t = String(type).toLowerCase();
    if (t.includes('purchase') || t.includes('exam')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (t.includes('register') || t.includes('login')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (t.includes('fail') || t.includes('error')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (t.includes('delete')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Activity <span className="text-gradient">Logs</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Monitor all administrative and user activities across the platform.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          >
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={200}>Last 200</option>
            <option value={500}>Last 500</option>
          </select>
          <button
            onClick={() => fetchLogs(limit)}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm"
          >
            <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </div>

      {/* Log Body */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Global Activity Stream</h2>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            {logs.length} Records
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="py-24 text-center font-black text-slate-400 uppercase tracking-widest text-xs animate-pulse">
              Syncing Activity Feed...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-32 text-center text-slate-400 italic">No activities recorded yet.</div>
          ) : (
            logs.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300 group">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg transition-transform group-hover:scale-110 ${getStatusColor(item.activity_type)}`}>
                    {item.user_name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{item.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500">by <span className="text-blue-500">{item.user_name || 'System'}</span></span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      <span className="text-xs text-slate-400 font-medium">{item.time_ago}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm ${getStatusColor(item.activity_type)}`}>
                    {item.activity_type}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
