import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const QuestionReports = () => {
    const { toast } = useToast();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('PENDING'); // PENDING, RESOLVED, REJECTED
    const [actionModal, setActionModal] = useState({
        isOpen: false,
        reportId: null,
        action: null, // RESOLVE or REJECT
        questionText: ''
    });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.manageExams.getQuestionReports(filterStatus || undefined);
            setReports(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
            toast.error('Fetch Failed', 'Could not retrieve question reports.');
        } finally {
            setLoading(false);
        }
    }, [filterStatus, toast]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleAction = async () => {
        const { reportId, action } = actionModal;
        try {
            await adminService.manageExams.actionQuestionReport(reportId, action);
            toast.success('Success', `Report ${action === 'RESOLVE' ? 'resolved' : 'rejected'} successfully.`);
            fetchReports();
        } catch (err) {
            toast.error('Action Failed', 'Could not process the report action.');
        } finally {
            setActionModal({ ...actionModal, isOpen: false });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
            case 'RESOLVED': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            case 'REJECTED': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                        Question <span className="text-gradient">Reports</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Manage user-submitted reports about incorrect or problematic questions.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {['PENDING', 'RESOLVED', 'REJECTED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filterStatus === status 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                    <button
                        onClick={fetchReports}
                        className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all ml-2"
                    >
                        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-24 text-center font-black text-slate-400 uppercase tracking-widest text-xs animate-pulse">
                            Loading Reports...
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="py-32 flex flex-col items-center gap-4 text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/10 flex items-center justify-center text-4xl">
                                ✨
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">No Reports Found</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">All clear! There are no {filterStatus.toLowerCase()} reports to display at this time.</p>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5">Reporter & Date</th>
                                    <th className="px-8 py-5">Question Context</th>
                                    <th className="px-8 py-5">Issue Details</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {reports.map((report) => (
                                    <tr key={report.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-sm">
                                                    {report.reporter_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{report.reporter_name || 'Anonymous User'}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        {new Date(report.created_at).toLocaleDateString()} • {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-md">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[9px] font-black tracking-widest uppercase">ID: {report.question_id}</span>
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-2 italic" title={report.question_text}>
                                                    "{report.question_text}"
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                                    report.reason === 'WRONG_ANSWER' ? 'border-red-200 text-red-600 bg-red-50 dark:bg-red-900/10' :
                                                    report.reason === 'BAD_GRAMMAR' ? 'border-orange-200 text-orange-600 bg-orange-50 dark:bg-orange-900/10' :
                                                    'border-slate-200 text-slate-600 bg-slate-50 dark:bg-slate-800'
                                                }`}>
                                                    {report.reason.replace('_', ' ')}
                                                </span>
                                                {report.description && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[200px] truncate" title={report.description}>
                                                        {report.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {report.status === 'PENDING' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setActionModal({ isOpen: true, reportId: report.id, action: 'RESOLVE', questionText: report.question_text })}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all border border-emerald-100 dark:border-emerald-900/30 shadow-sm"
                                                        title="Resolve"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setActionModal({ isOpen: true, reportId: report.id, action: 'REJECT', questionText: report.question_text })}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-red-100 dark:border-red-900/30 shadow-sm"
                                                        title="Reject"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 italic">No Actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ ...actionModal, isOpen: false })}
                onConfirm={handleAction}
                title={actionModal.action === 'RESOLVE' ? 'Resolve Report' : 'Reject Report'}
                message={
                    <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-400">
                            Are you sure you want to <strong>{actionModal.action?.toLowerCase()}</strong> this question report?
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-l-4 border-blue-500 italic text-sm text-slate-500">
                            "{actionModal.questionText}"
                        </div>
                    </div>
                }
                confirmText={actionModal.action === 'RESOLVE' ? 'Confirm Resolve' : 'Confirm Reject'}
            />
        </div>
    );
};

export default QuestionReports;
