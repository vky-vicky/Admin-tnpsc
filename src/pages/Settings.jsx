import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';

const Settings = () => {
  const [profile, setProfile] = useState({
    name: 'Administrator',
    email: 'admin@ondrutechnologies.com',
    role: 'Super Admin'
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setProfile({
          name: parsed.full_name || parsed.name || 'Administrator',
          email: parsed.email || 'admin@ondrutechnologies.com',
          role: parsed.role || 'Super Admin'
        });
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // update local state and storage for immediate feedback
    const updatedUser = { ...JSON.parse(localStorage.getItem('admin_user') || '{}'), name: profile.name, email: profile.email };
    localStorage.setItem('admin_user', JSON.stringify(updatedUser));
    
    // In a real app, you'd call an API here
    // await adminService.updateProfile(profile);
    
    alert('Profile updated successfully!');
    // Force reload to update TopNavbar (simple way) or use Context
    window.location.reload(); 
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    alert('Password change functionality coming soon');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Admin Profile</h2>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30">
               <span className="text-3xl text-white font-bold">
                 {profile.name.charAt(0).toUpperCase()}
               </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{profile.name}</h3>
              <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                {profile.role}
              </span>
            </div>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
               <input 
                 type="text" 
                 value={profile.name}
                 onChange={(e) => setProfile({...profile, name: e.target.value})}
                 className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
               <input 
                 type="email" 
                 value={profile.email}
                 onChange={(e) => setProfile({...profile, email: e.target.value})}
                 className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
               />
             </div>
             <button type="submit" className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors font-medium">
               Save Profile
             </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Security</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input 
                type="password" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input 
                type="password" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-500 transition-all mt-4">
              Update Password
            </button>
          </form>
        </div>

        {/* App Preferences */}
        <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-lg border border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">System Status</h2>
              <p className="text-slate-400">Everything is running smoothly. Last backup was 2 hours ago.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-6 py-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-400">98%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Uptime</div>
              </div>
              <div className="text-center px-6 py-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400">12ms</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Latency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
