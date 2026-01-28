import React, { useState, useEffect } from 'react';
import { reportService } from '../../api/reportService';
import { useToast } from '../../context/ToastContext';

const ModerationDashboard = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [filterType, setFilterType] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionData, setActionData] = useState({
    action: 'IGNORE',
    ban_reason: '',
    warning_message: ''
  });

  useEffect(() => {
    fetchReports();
  }, [filterStatus, filterType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.content_type = filterType;
      
      const data = await reportService.getReports(params);
      // The axios interceptor already returns response.data, so data is the array itself
      setReports(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports', 'The server could not retrieve the report list.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedReport) return;
    
    try {
      setLoading(true);
      const data = { action: actionData.action };
      if (actionData.action === 'BAN_USER') data.ban_reason = actionData.ban_reason;
      if (actionData.action === 'WARN_USER') data.warning_message = actionData.warning_message;
      
      await reportService.takeAction(selectedReport.id, data);
      toast.success('Action Applied', `Moderation rule ${actionData.action} has been successfully applied.`);
      setIsActionModalOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Action Failed', 'An error occurred while trying to apply the moderation action.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'REVIEWED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ACTION_TAKEN': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Moderation Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Review and manage community reports</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center"
            title="Refresh"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 overflow-x-auto whitespace-nowrap">
            {['PENDING', 'REVIEWED', 'ACTION_TAKEN'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === status 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === '' 
                  ? 'bg-slate-700 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Reports */}
      {loading && reports.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-slate-800/50 rounded-2xl border border-slate-700 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-800/30 rounded-3xl border border-slate-700/50 border-dashed">
          <svg className="w-16 h-16 text-emerald-500/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h3 className="text-xl font-semibold text-white">All Clear!</h3>
          <p className="text-slate-500 mt-2">No reports found for the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="group relative bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-300 rounded-3xl border border-slate-700 flex flex-col shadow-xl overflow-hidden"
            >
              {/* Header Info */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between text-xs font-semibold tracking-tight">
                <span className={`px-3 py-1 rounded-full border ${getStatusBadgeClass(report.status)}`}>
                  {report.status}
                </span>
                <span className="text-slate-500 flex items-center gap-1.5 uppercase">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formatDate(report.created_at)}
                </span>
              </div>

              {/* Main Preview Area */}
              <div className="p-6 flex-1 flex flex-col gap-5">
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-md">{report.content_type}</span>
                      <span className="text-slate-600 font-bold">•</span>
                      <span className="text-xs text-white font-bold opacity-70">By {report.content_owner}</span>
                   </div>
                   <div className="relative group/content">
                      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-rose-500/20 rounded-full group-hover/content:bg-rose-500/50 transition-colors"></div>
                      <p className="text-slate-300 text-sm italic font-medium leading-relaxed pl-3 line-clamp-4">
                        "{report.content_preview}"
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 transition-colors hover:border-slate-600">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1.5 opacity-60">Violation Reason</p>
                      <p className="text-xs text-white font-bold line-clamp-1">{report.reason}</p>
                   </div>
                   <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 transition-colors hover:border-slate-600">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1.5 opacity-60">Reporting User</p>
                      <p className="text-xs text-white font-bold line-clamp-1">{report.reporter_name}</p>
                   </div>
                </div>

                {report.comment && (
                  <div className="bg-amber-500/5 border border-amber-500/20 px-4 py-3 rounded-2xl">
                    <p className="text-[10px] text-amber-500/80 uppercase font-bold tracking-widest mb-1">User's Note</p>
                    <p className="text-xs text-amber-100/90 leading-relaxed">{report.comment}</p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              {report.status === 'PENDING' && (
                <div className="px-6 pb-6 pt-2 flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedReport(report);
                      setActionData({ ...actionData, action: 'IGNORE' });
                      setIsActionModalOpen(true);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-3 rounded-2xl font-bold transition-all border border-slate-600 shadow-xl"
                  >
                    Dismiss
                  </button>
                  <button 
                     onClick={() => {
                      setSelectedReport(report);
                      setActionData({ ...actionData, action: 'DELETE_CONTENT' });
                      setIsActionModalOpen(true);
                    }}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs py-3 rounded-2xl font-bold transition-all shadow-xl shadow-rose-500/20"
                  >
                    Moderate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsActionModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white">Moderate Content</h2>
                    <p className="text-xs text-slate-500 font-medium">Select an action for this report</p>
                 </div>
              </div>
              <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-xl">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'IGNORE', label: 'Mark as Safe', desc: 'Keep content as normal', color: 'slate' },
                    { id: 'WARN_USER', label: 'Issue Warning', desc: 'Notify user of violation', color: 'orange' },
                    { id: 'DELETE_CONTENT', label: 'Delete Item', desc: 'Remove from community', color: 'rose' },
                    { id: 'BAN_USER', label: 'Suspend User', desc: 'Block user from platform', color: 'rose' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      onClick={() => setActionData({ ...actionData, action: act.id })}
                      className={`flex flex-col gap-1 p-4 rounded-2xl border text-left transition-all duration-300 ${
                        actionData.action === act.id
                          ? 'bg-white/5 border-rose-500/50 ring-4 ring-rose-500/10'
                          : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className={`text-xs font-black uppercase tracking-wider ${actionData.action === act.id ? 'text-rose-500' : 'text-slate-400'}`}>
                        {act.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">{act.desc}</span>
                    </button>
                  ))}
                </div>

              {actionData.action === 'WARN_USER' && (
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Warning Details</label>
                  <textarea 
                    value={actionData.warning_message}
                    onChange={(e) => setActionData({ ...actionData, warning_message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:border-rose-500/50 outline-none transition-all h-28 resize-none shadow-inner"
                    placeholder="Provide context for the warning..."
                  />
                </div>
              )}

              {actionData.action === 'BAN_USER' && (
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Suspension Reason</label>
                   <textarea 
                    value={actionData.ban_reason}
                    onChange={(e) => setActionData({ ...actionData, ban_reason: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:border-rose-500/50 outline-none transition-all h-28 resize-none shadow-inner"
                    placeholder="Official reason for the user suspension..."
                  />
                </div>
              )}

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-4">
                 <div className="p-2 rounded-lg bg-rose-500/20 shrink-0">
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <p className="text-[11px] text-rose-200/60 font-medium leading-relaxed">
                   Confirmation will immediately apply this rule to the database. All user records will be updated and notifications will be dispatched where applicable.
                 </p>
              </div>
            </div>

            <div className="p-8 bg-slate-950/50 flex gap-4">
               <button 
                onClick={() => setIsActionModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all border border-slate-700"
              >
                Go Back
              </button>
              <button 
                onClick={handleAction}
                disabled={loading}
                className="flex-[2] bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold transition-all shadow-2xl shadow-rose-600/20"
              >
                {loading ? 'Processing...' : 'Execute Moderation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationDashboard;
