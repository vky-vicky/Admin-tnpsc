import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const Notifications = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'broadcast', 'exam-notify'
  const { toast } = useToast();

  // Deletion State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Broadcast State
  const [broadcast, setBroadcast] = useState({
    title: '',
    message: '',
    target: 'all'
  });

  // Exam Notification State
  const [examNotify, setExamNotify] = useState({
    exam_name: '',
    exam_date: '',
    exam_type_slug: 'TNPSC',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await adminService.manageExams.listUpcoming();
      setExams(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending broadcast:", broadcast);
      await adminService.broadcastMessage(broadcast);
      toast.success('Broadcast Sent', 'Your message has been delivered to all users.');
      setBroadcast({ title: '', message: '', target: 'all' });
      setView('list');
    } catch (err) {
      console.error("Broadcast failed:", err);
      toast.error('Broadcast Failed', 'Check network or console for details.');
    }
  };

  const handleExamNotify = async (e) => {
    e.preventDefault();
    try {
      // Ensure the payload matches the backend schema strictly
      const payload = {
        ...examNotify,
        exam_date: new Date(examNotify.exam_date).toISOString(), // Format date to ISO
        notification_sent: false, // Default value as per schema
        id: 0 // Default ID if backend requires the full model structure
      };

      await adminService.manageExams.createNotification(payload);
      toast.success('Alert Created', 'Exam notification has been published.');
      setExamNotify({ exam_name: '', exam_date: '', exam_type_slug: 'TNPSC', description: '', is_active: true });
      fetchExams();
      setView('list');
    } catch (err) {
      console.error("Creation failed:", err);
      toast.error('Creation Failed', 'Could not save exam notification. Check console for details.');
    }
  };

  const openDeleteModal = (id, title) => {
    setDeleteModal({
      isOpen: true,
      id,
      title
    });
  };

  const handleConfirmDelete = async () => {
    const { id, title } = deleteModal;
    setDeleteLoading(true);
    try {
      await adminService.manageExams.deleteNotification(id);
      setExams(exams.filter(e => e.id !== id));
      toast.success('Deleted', `${title} alert has been removed.`);
      setDeleteModal({ isOpen: false, id: null, title: '' });
    } catch (err) {
      toast.error('Deletion Failed', 'Could not remove notification.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Broadcast messages and manage exam alerts</p>
        </div>
        
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600' : 'text-slate-500'}`}>Upcoming</button>
          <button onClick={() => setView('broadcast')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'broadcast' ? 'bg-white dark:bg-slate-700 text-blue-600' : 'text-slate-500'}`}>Broadcast</button>
          <button onClick={() => setView('exam-notify')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'exam-notify' ? 'bg-white dark:bg-slate-700 text-blue-600' : 'text-slate-500'}`}>+ Exam Alert</button>
        </div>
      </div>

      {view === 'broadcast' && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-2xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Send Broadcast Message</h2>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input type="text" required className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={broadcast.title} onChange={(e) => setBroadcast({...broadcast, title: e.target.value})} placeholder="e.g. New Feature Update" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message Body</label>
              <textarea required rows="4" className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={broadcast.message} onChange={(e) => setBroadcast({...broadcast, message: e.target.value})} placeholder="Type your message here..." />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-500 transition-all">Send to All Users</button>
          </form>
        </div>
      )}

      {view === 'exam-notify' && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-2xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Create Exam Notification</h2>
          <form onSubmit={handleExamNotify} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Name</label>
              <input type="text" required className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={examNotify.exam_name} onChange={(e) => setExamNotify({...examNotify, exam_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Date</label>
              <input type="datetime-local" required className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={examNotify.exam_date} onChange={(e) => setExamNotify({...examNotify, exam_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type Slug</label>
              <input type="text" required className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={examNotify.exam_type_slug} onChange={(e) => setExamNotify({...examNotify, exam_type_slug: e.target.value})} placeholder="e.g. group-4" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea rows="3" className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={examNotify.description} onChange={(e) => setExamNotify({...examNotify, description: e.target.value})} />
            </div>
            <button type="submit" className="md:col-span-2 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-500 transition-all">Publish Exam Alert</button>
          </form>
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Exam Alert</th>
                <th className="px-6 py-4">Target Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-12">Loading alerts...</td></tr>
              ) : exams.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-12 text-slate-400">No upcoming exam alerts found</td></tr>
              ) : (
                exams.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{item.exam_name}</div>
                      <div className="text-xs text-slate-500">{item.exam_type_slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(item.exam_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                         {item.is_active ? 'Active' : 'Draft'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openDeleteModal(item.id, item.exam_name)} className="text-red-500 hover:text-red-700 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Notification"
        message={`Are you sure you want to delete the notification for "${deleteModal.title}"?`}
        confirmText="Yes, Remove"
      />
    </div>
  );
};

export default Notifications;
