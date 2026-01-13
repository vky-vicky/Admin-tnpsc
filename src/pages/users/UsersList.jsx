import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import Pagination from '../../components/Pagination';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getUsers();
        // data usually comes as an array from /users/
        setUsers(Array.isArray(data) ? data : (data.users || data.data || []));
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    // await adminService.updateUserRole(userId, newRole);
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleDelete = async (userId) => {
    if(window.confirm('Are you sure you want to delete this user?')) {
        // await adminService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
    }
  };

  // Filter and Pagination Logic
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search users..." 
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
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
               <tr><td colSpan="5" className="text-center py-8 text-slate-500">Loading users...</td></tr>
            ) : currentUsers.length === 0 ? (
               <tr><td colSpan="5" className="text-center py-8 text-slate-500">No users found</td></tr>
            ) : currentUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                    {user.role || 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                     onClick={() => {
                        adminService.manageExams.getPerformanceAnalysis(user.id)
                          .then(res => alert(`User Performance:\nAccuracy: ${res.data.overall_summary.accuracy_percentage}%\nQuestions Analyzed: ${res.data.total_questions_analyzed}`))
                          .catch(() => alert('No performance data available for this user.'));
                     }}
                     className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
                  >
                    Analysis
                  </button>
                  <button 
                     onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                     className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                  <button 
                     onClick={() => handleDelete(user.id)}
                     className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
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
        totalItems={filteredUsers.length} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
};

export default UsersList;
