import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';

const ErrorLogs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    user_id: '',
    error_type: '',
    limit: 50,
  });
  const [appliedFilters, setAppliedFilters] = useState({ limit: 50 });

  const fetchLogs = useCallback(async (params) => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null)
      );
      const data = await adminService.getErrorLogs(cleanParams);
      setLogs(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      toast.error('Fetch Failed', 'Could not retrieve error logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(appliedFilters);
  }, [appliedFilters, fetchLogs]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    const reset = { user_id: '', error_type: '', limit: 50 };
    setFilters(reset);
    setAppliedFilters({ limit: 50 });
  };

  const errorTypeColors = {
    NameError: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    AttributeError: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    ValueError: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    DatabaseError: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    TypeError: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  };

  const getErrorBadge = (type) =>
    errorTypeColors[type] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

  const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Error <span className="text-gradient">Logs</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Monitor server-side 500 errors from mobile and web clients.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(appliedFilters)}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
        >
          <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-5">Filters</h2>
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">User ID</label>
            <input
              type="number"
              placeholder="e.g. 42"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
              value={filters.user_id}
              onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Error Type</label>
            <select
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white appearance-none"
              value={filters.error_type}
              onChange={(e) => setFilters({ ...filters, error_type: e.target.value })}
            >
              <option value="">All Error Types</option>
              <option value="NameError">NameError</option>
              <option value="AttributeError">AttributeError</option>
              <option value="ValueError">ValueError</option>
              <option value="TypeError">TypeError</option>
              <option value="DatabaseError">DatabaseError</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Limit</label>
            <select
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white appearance-none"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
            >
              <option value={20}>Last 20</option>
              <option value={50}>Last 50</option>
              <option value={100}>Last 100</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest">
              Apply
            </button>
            <button type="button" onClick={handleReset} className="px-4 py-3 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-800 rounded-xl transition-all">
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Server Error Log</h2>
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            {logs.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center font-black text-slate-400 uppercase tracking-widest text-xs animate-pulse">
              Scanning Error Logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">No Errors Found</h3>
              <p className="text-sm text-slate-500">The system is running clean for these filter conditions.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 dark:bg-slate-800/20 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Error Type</th>
                  <th className="px-6 py-4">Path</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-800 dark:text-slate-200 font-bold">{formatTime(log.timestamp)}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{log.method || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getErrorBadge(log.error_type)}`}>
                          {log.error_type || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded font-mono break-all max-w-[200px] block truncate">
                          {log.path || '—'}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {log.user_id ? `User #${log.user_id}` : <span className="text-slate-400 italic">Guest</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] text-slate-500 font-medium max-w-[140px] truncate" title={log.user_agent}>
                          {log.user_agent || '—'}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">{log.ip_address || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded font-black text-[10px]">
                          {log.status_code || 500}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-all rounded-lg border border-slate-100 dark:border-slate-800"
                        >
                          <svg className={`w-4 h-4 transition-transform ${expandedId === log.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr>
                        <td colSpan={7} className="px-6 pb-6 pt-2 bg-slate-50 dark:bg-slate-800/30">
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Error Message</p>
                              <p className="text-sm text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/10 rounded-xl p-4">
                                {log.error_message || 'No message available.'}
                              </p>
                            </div>
                            {log.stack_trace && (
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stack Trace</p>
                                <pre className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 rounded-xl p-4 overflow-auto max-h-64 whitespace-pre-wrap">
                                  {log.stack_trace}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorLogs;
