import React, { useState, useEffect } from 'react';
import { reportService } from '../../api/reportService';
import { useToast } from '../../context/ToastContext';

const ModerationDashboard = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [filterType, setFilterType] = useState('');
  const [filterCommunityType, setFilterCommunityType] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionData, setActionData] = useState({
    action: 'IGNORE',
    ban_reason: '',
    warning_message: '',
    reporter_message: 'Thanks for your report. After review, this content does not violate our guidelines.'
  });

  useEffect(() => {
    fetchReports();
  }, [filterStatus, filterType, filterCommunityType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.content_type = filterType;
      if (filterCommunityType) params.community_type = filterCommunityType;
      
      const data = await reportService.getReports(params);
      // The axios interceptor already returns response.data, so data is the array itself
      setReports(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      const errorDetail = error.response?.data?.detail || error.message || 'The server could not retrieve the report list.';
      toast.error('Failed to load reports', errorDetail);
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
      if (actionData.action === 'IGNORE') data.reporter_message = actionData.reporter_message;
      
      await reportService.takeAction(selectedReport.id, data);
      toast.success('Action Applied', `Moderation rule ${actionData.action} has been successfully applied.`);
      setIsActionModalOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Action failed:', error);
      const errorDetail = error.response?.data?.detail || error.message || 'An error occurred while trying to apply the moderation action.';
      toast.error('Action Failed', errorDetail);
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
      // Ensure UTC string is treated as UTC by adding 'Z' if missing and no timezone info exists
      const utcStr = (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) 
        ? `${dateStr}Z` 
        : dateStr;
      const date = new Date(utcStr);
      return date.toLocaleTimeString('en-IN', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getGroupedReports = () => {
    const groups = {};
    reports.forEach(report => {
      const key = `${report.content_type}_${report.content_id}`;
      if (!groups[key]) {
        groups[key] = {
          content_id: report.content_id,
          content_type: report.content_type,
          content_owner: report.content_owner,
          content_preview: report.content_preview,
          content_title: report.content_title,
          community_type: report.community_type,
          status: report.status,
          created_at: report.created_at, // Latest one
          reports: [],
          reasons: {}
        };
      }
      groups[key].reports.push(report);
      groups[key].reasons[report.reason] = (groups[key].reasons[report.reason] || 0) + 1;
      
      // Update to most recent timestamp if needed
      if (new Date(report.created_at) > new Date(groups[key].created_at)) {
        groups[key].created_at = report.created_at;
      }
    });
    return Object.values(groups);
  };

  const groupedReports = getGroupedReports();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Moderation Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Review and manage grouped community reports</p>
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

          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
            {['', 'TNPSC Group 2', 'TNPSC Group 4'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterCommunityType(type)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterCommunityType === type 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type || 'ALL GROUPS'}
              </button>
            ))}
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
          {groupedReports.map((group) => (
            <div 
              key={`${group.content_type}_${group.content_id}`}
              className="group relative bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-300 rounded-3xl border border-slate-700 flex flex-col shadow-xl overflow-hidden"
            >
              {/* Header Info */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between text-xs font-semibold tracking-tight">
                <div className="flex items-center gap-2">
                   <span className={`px-3 py-1 rounded-full border ${getStatusBadgeClass(group.status)}`}>
                     {group.status}
                   </span>
                   <span className="bg-rose-500 text-white px-2 py-1 rounded-lg text-[10px] font-black">
                     {group.reports.length} REPORTS
                   </span>
                </div>
                <span className="text-slate-500 flex items-center gap-1.5 uppercase">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formatDate(group.created_at)}
                </span>
              </div>

              {/* Main Preview Area */}
              <div className="p-6 flex-1 flex flex-col gap-5">
                 <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-md">{group.content_type} #{group.content_id}</span>
                       {group.community_type && (
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                           group.community_type.includes('2') ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                         }`}>
                           {group.community_type}
                         </span>
                       )}
                       <span className="text-slate-600 font-bold">•</span>
                       <span className="text-xs text-white font-bold opacity-70">By {group.content_owner}</span>
                    </div>
                    {group.content_title && (
                      <h3 className="text-white font-bold text-sm line-clamp-1">{group.content_title}</h3>
                    )}
                    <div className="relative group/content">
                       <div className="absolute -left-2 top-0 bottom-0 w-1 bg-rose-500/20 rounded-full group-hover/content:bg-rose-500/50 transition-colors"></div>
                       <p className="text-slate-300 text-sm italic font-medium leading-relaxed pl-3 line-clamp-4">
                         "{group.content_preview}"
                       </p>
                    </div>
                 </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-2 opacity-60">Violation Summary</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(group.reasons).map(([reason, count]) => (
                      <div key={reason} className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/50">
                        <span className="text-xs text-white font-bold">{reason}</span>
                        <span className="w-5 h-5 flex items-center justify-center bg-rose-500 text-[10px] font-black text-white rounded-md">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {group.reports.some(r => r.comment) && (
                  <div className="bg-amber-500/5 border border-amber-500/20 px-4 py-3 rounded-2xl max-h-24 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] text-amber-500/80 uppercase font-bold tracking-widest mb-1 sticky top-0 bg-slate-900/0">Recent User Notes</p>
                    {group.reports.filter(r => r.comment).slice(0, 3).map((r, idx) => (
                      <p key={idx} className="text-xs text-amber-100/90 leading-relaxed mb-1 last:mb-0">• {r.comment}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              {group.status === 'PENDING' && (
                <div className="px-6 pb-6 pt-2 flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedReport(group.reports[0]); // Take action based on one, backend handles rest
                      setActionData({ ...actionData, action: 'IGNORE' });
                      setIsActionModalOpen(true);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-3 rounded-2xl font-bold transition-all border border-slate-600 shadow-xl cursor-pointer"
                  >
                    {group.reports.length > 1 ? 'Dismiss All' : 'Dismiss'}
                  </button>
                  <button 
                     onClick={() => {
                      setSelectedReport(group.reports[0]);
                      setActionData({ ...actionData, action: 'DELETE_CONTENT' });
                      setIsActionModalOpen(true);
                    }}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs py-3 rounded-2xl font-bold transition-all shadow-xl shadow-rose-500/20 cursor-pointer"
                  >
                    Moderate Post
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
                     <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500 font-medium">{selectedReport?.content_type} #{selectedReport?.content_id} by {selectedReport?.content_owner}</p>
                        {selectedReport?.community_type && (
                          <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{selectedReport.community_type}</span>
                        )}
                     </div>
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
                      onClick={() => {
                        const newData = { ...actionData, action: act.id };
                        
                        // Auto-fill warning template if switching to WARN_USER and message is empty
                        if (act.id === 'WARN_USER' && !actionData.warning_message) {
                          const postTitle = selectedReport?.content_preview || 'your post';
                          const template = `வணக்கம் 😊,\n\n"${postTitle}" என்ற உங்கள் post-ஐ நாங்கள் பரிசீலித்தோம்.\n\nஇது எங்கள் community guidelines-க்கு முழுமையாக பொருந்தாமல் இருக்கலாம் (எ.கா: spam / copyright போன்ற காரணங்கள்).\n\nதயவுசெய்து இதைப் பரிசீலித்து, எதிர்காலத்தில் கவனமாக post செய்யவும் 🙏\n\nஇது ஒரு friendly reminder தான் 👍`;
                          newData.warning_message = template;
                        }
                        
                        setActionData(newData);
                      }}
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

              {actionData.action === 'IGNORE' && (
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Message to Reporter</label>
                  <textarea 
                    value={actionData.reporter_message}
                    onChange={(e) => setActionData({ ...actionData, reporter_message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:border-rose-500/50 outline-none transition-all h-28 resize-none shadow-inner"
                    placeholder="Provide context for the resolution..."
                  />
                  <p className="text-[10px] text-slate-500 font-bold px-1 italic">This message will be sent to all users who reported this content.</p>
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
