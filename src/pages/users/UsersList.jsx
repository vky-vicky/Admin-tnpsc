import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Deletion State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: ''
  });

  // Moderation State
  const [moderationModal, setModerationModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    action: 'BAN', // 'BAN' or 'UNBAN'
    reason: ''
  });

  // User Details State
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    loading: false,
    data: null
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const data = await adminService.getUsers({
        skip,
        limit: itemsPerPage,
        search: searchTerm || undefined
      });
      
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error('Error', 'Failed to fetch user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const openDeleteModal = (id, title) => {
    setDeleteModal({
      isOpen: true,
      id,
      title
    });
  };

  const handleConfirmDelete = async () => {
    const { id, title } = deleteModal;
    try {
      await adminService.deleteUser(id);
      toast.success('User Deleted', `${title} has been removed from the platform.`);
      fetchUsers();
    } catch (error) {
      toast.error('Error', 'Failed to delete user');
    }
    setDeleteModal({ isOpen: false, id: null, title: '' });
  };

  const openModerationModal = (user, action, e) => {
    if (e) e.stopPropagation();
    setModerationModal({
      isOpen: true,
      id: user.id,
      name: user.name,
      action,
      reason: ''
    });
  };

  const handleModerationAction = async () => {
    const { id, action, reason } = moderationModal;
    try {
      if (action === 'BAN') {
        await adminService.banUser(id, reason);
        toast.success('User Banned', `User has been restricted from the platform.`);
      } else {
        await adminService.unbanUser(id);
        toast.success('User Unbanned', `User access has been restored.`);
      }
      fetchUsers();
      // If details modal is open for this user, refresh it too
      if (detailsModal.isOpen && detailsModal.data?.user_info?.id === id) {
        fetchUserDetails(id);
      }
    } catch (error) {
      toast.error('Error', `Failed to ${action.toLowerCase()} user`);
    }
    setModerationModal({ ...moderationModal, isOpen: false });
  };

  const fetchUserDetails = async (userId) => {
    setDetailsModal({ isOpen: true, loading: true, data: null });
    try {
      const data = await adminService.getUserDetail(userId);
      setDetailsModal({ isOpen: true, loading: false, data });
    } catch (error) {
      console.error("Failed to fetch user details", error);
      toast.error('Error', 'Failed to fetch user profiles');
      setDetailsModal({ ...detailsModal, isOpen: false, loading: false });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search name, email, phone..." 
            className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-colors"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role & Status</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-center">Joined Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
               <tr><td colSpan="5" className="text-center py-8 text-slate-500">Loading users...</td></tr>
            ) : users.length === 0 ? (
               <tr><td colSpan="5" className="text-center py-8 text-slate-500">No users found</td></tr>
            ) : users.map(user => (
              <tr 
                key={user.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                onClick={() => fetchUserDetails(user.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-colors">
                      {user.profile_pic ? (
                        <img src={user.profile_pic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{user.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-800 dark:text-slate-200 font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">#{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                      {user.role || 'User'}
                    </span>
                    {user.is_banned && (
                      <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        Banned
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">{user.email}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">{user.phone_number || 'No phone'}</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm text-center">
                  {user.joined_date ? new Date(user.joined_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  {!user.is_banned ? (
                    <button 
                      onClick={(e) => openModerationModal(user, 'BAN', e)}
                      className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 text-sm font-semibold transition-colors"
                    >
                      Ban
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => openModerationModal(user, 'UNBAN', e)}
                      className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-semibold transition-colors"
                    >
                      Unban
                    </button>
                  )}
                  <button 
                     onClick={(e) => { e.stopPropagation(); openDeleteModal(user.id, user.name); }}
                     className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination 
        itemsPerPage={itemsPerPage} 
        totalItems={total} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteModal.title}"? This will permanently remove their account and all associated progress data. This action is irreversible.`}
        confirmText="Confirm Delete"
      />

      {/* Moderation Modal */}
      <ConfirmModal 
        isOpen={moderationModal.isOpen}
        onClose={() => setModerationModal({ ...moderationModal, isOpen: false })}
        onConfirm={handleModerationAction}
        title={moderationModal.action === 'BAN' ? 'Ban User' : 'Restore User'}
        message={
          moderationModal.action === 'BAN' ? (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">Are you sure you want to ban <strong>{moderationModal.name}</strong>? They will lose access to the platform immediately.</p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ban Reason</label>
                <textarea 
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  rows="3"
                  placeholder="Describe the reason for banning (e.g. Offensive content)..."
                  value={moderationModal.reason}
                  onChange={(e) => setModerationModal({ ...moderationModal, reason: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">Are you sure you want to restore access for <strong>{moderationModal.name}</strong>? They will be able to log in and participate in the community again.</p>
          )
        }
        confirmText={moderationModal.action === 'BAN' ? 'Ban User' : 'Restore Access'}
      />

      {/* User Details Modal (Drawer style) */}
      {detailsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setDetailsModal({ ...detailsModal, isOpen: false })}
          />
          <div className="relative w-full max-w-lg h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            {detailsModal.loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : detailsModal.data ? (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">User Insights</h2>
                  <button 
                    onClick={() => setDetailsModal({ ...detailsModal, isOpen: false })}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                      {detailsModal.data.user_info.profile_pic ? (
                        <img src={detailsModal.data.user_info.profile_pic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-blue-600">{detailsModal.data.user_info.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{detailsModal.data.user_info.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">#{detailsModal.data.user_info.id} • {detailsModal.data.user_info.email}</p>
                    </div>
                    <div className="flex gap-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${detailsModal.data.user_info.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{detailsModal.data.user_info.role}</span>
                       {detailsModal.data.moderation.is_banned && <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">Restricted</span>}
                    </div>
                  </div>

                  {/* Primary Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">XP Points</div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{detailsModal.data.stats.xp}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Daily Streak</div>
                      <div className="text-2xl font-black text-amber-500">{detailsModal.data.stats.streak_count} 🔥</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Tests Taken</div>
                      <div className="text-2xl font-black text-emerald-500">{detailsModal.data.stats.total_tests_taken}</div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">About User</h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-300 italic border-l-4 border-blue-500">
                      {detailsModal.data.user_info.about || "This user hasn't added a bio yet."}
                    </div>
                  </div>

                  {/* Detailed Info List */}
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Category</p>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold">{detailsModal.data.user_info.exam_type || 'General'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Presence</p>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold">{detailsModal.data.user_info.phone || 'Not Linked'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Activity</p>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold">
                        {detailsModal.data.stats.last_activity ? new Date(detailsModal.data.stats.last_activity).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Onboarding</p>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold">Step {detailsModal.data.user_info.onboarding_step}/3 Completed</p>
                    </div>
                  </div>

                  {/* Community Engagement */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Social Footprint</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Total Posts', val: detailsModal.data.stats.total_posts, icon: '📝' },
                        { label: 'Likes Gained', val: detailsModal.data.stats.likes_received, icon: '❤️' },
                        { label: 'Comments Gained', val: detailsModal.data.stats.comments_received, icon: '💬' }
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800/20 rounded-lg border border-slate-50 dark:border-slate-800 hover:shadow-sm transition-all">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">{item.icon} {item.label}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Moderation Warning */}
                  {detailsModal.data.moderation.is_banned && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl space-y-2">
                      <h4 className="text-red-700 dark:text-red-400 font-bold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Ban Details
                      </h4>
                      <p className="text-red-600/80 dark:text-red-400/80 text-sm font-medium leading-relaxed">
                        Reason: {detailsModal.data.moderation.ban_reason || 'No specific reason documented.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                  {!detailsModal.data.moderation.is_banned ? (
                    <button 
                      onClick={(e) => openModerationModal(detailsModal.data.user_info, 'BAN', e)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-600/20 transition-all hover:-translate-y-0.5"
                    >
                      Restrict User
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => openModerationModal(detailsModal.data.user_info, 'UNBAN', e)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                    >
                      Restore Access
                    </button>
                  )}
                  <button 
                    onClick={() => openDeleteModal(detailsModal.data.user_info.id, detailsModal.data.user_info.name)}
                    className="px-6 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                  >
                    Delete Permanently
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">Failed to load data.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
