import React, { useEffect, useState } from 'react';
import { adminService } from '../api/adminService';
import StatCard from '../components/StatCard';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_exams: 0,
    total_materials: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data with individual fallback catching to prevent global failure
      const [usersRes, materialsRes, realExamsRes, mockExamsRes, activityRes] = await Promise.all([
        adminService.getUsers().catch(err => { toast.error("Users fetch failed"); return []; }),
        adminService.materials.listStudy().catch(err => { toast.error("Materials fetch failed"); return []; }),
        adminService.manageExams.listReal('REAL_EXAM').catch(err => { toast.error("Real Exams fetch failed"); return []; }),
        adminService.manageExams.listReal('MOCK_EXAM').catch(err => { toast.error("Mock Exams fetch failed"); return []; }),
        adminService.getRecentActivity(5).catch(err => { toast.error("Activity fetch failed"); return []; })
      ]);

      const getList = (res) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (res.data && Array.isArray(res.data)) return res.data;
          if (res.users && Array.isArray(res.users)) return res.users;
          if (res.materials && Array.isArray(res.materials)) return res.materials;
          if (res.exams && Array.isArray(res.exams)) return res.exams;
          if (res.activities && Array.isArray(res.activities)) return res.activities;
          // Handle specialized data wrappers
          if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
            const possibleList = Object.values(res.data).find(v => Array.isArray(v));
            if (possibleList) return possibleList;
          }
          return [];
      };

      const userList = getList(usersRes);
      const materialList = getList(materialsRes);
      const realExamList = getList(realExamsRes);
      const mockExamList = getList(mockExamsRes);
      const activityList = getList(activityRes);

      setStats({
        total_users: userList.length,
        active_users: userList.filter(u => u.is_active !== false).length,
        total_exams: realExamList.length + mockExamList.length,
        total_materials: materialList.length
      });

      setActivities(activityList);

    } catch (error) {
      console.error("Critical error in Dashboard data fetching", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (type) => {
    const t = String(type).toLowerCase();
    if (t.includes('purchase') || t.includes('exam')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (t.includes('register') || t.includes('login')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (t.includes('fail') || t.includes('error')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (t.includes('delete')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, Administrator. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:text-blue-500 dark:hover:text-blue-400 transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
             {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          count={stats.total_users} 
          trend={12}
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard 
          title="Active Accounts" 
          count={stats.active_users} 
          trend={5}
          color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="Total Exams" 
          count={stats.total_exams} 
          trend={-2}
          color="orange"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
        />
        <StatCard 
          title="Study Materials" 
          count={stats.total_materials} 
          trend={8}
          color="purple"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
             <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Activity</h3>
             <button className="text-sm text-blue-500 font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No recent activities found</div>
            ) : (
                activities.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getStatusColor(item.activity_type)}`}>
                          {item.user_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.description}</p>
                          <p className="text-xs text-slate-500">by {item.user_name || 'System'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold capitalize mb-1 ${getStatusColor(item.activity_type)}`}>
                          {item.activity_type}
                        </span>
                        <p className="text-xs text-slate-400">{item.time_ago}</p>
                      </div>
                    </div>
                  ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Pending Approvals</h3>
              <p className="text-indigo-100 text-sm mb-4">Review content waiting for publication</p>
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-4xl font-bold">3</span>
                 <span className="text-indigo-200 text-sm">items</span>
              </div>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors">
                Review Now
              </button>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Enterprise Alerts</h3>
            <div className="grid grid-cols-2 gap-3">
               <button 
                  onClick={() => toast.success("Export successful", { message: "Your CSV file is ready for download." })}
                  className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-800/50"
               >
                  Success
               </button>
               <button 
                  onClick={() => toast.error("Connection failed", { 
                    actions: [{ label: 'Retry', onClick: () => console.log('Retrying...') }] 
                  })}
                  className="px-4 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-800/50"
               >
                  Error
               </button>
               <button 
                  onClick={() => toast.warning("Session expiring", { duration: 10000 })}
                  className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-amber-100 transition-all border border-amber-100 dark:border-amber-800/50"
               >
                  Warning
               </button>
               <button 
                  onClick={() => toast.info("System Update", { duration: 8000 })}
                  className="px-4 py-2 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-sky-100 transition-all border border-sky-100 dark:border-sky-800/50"
               >
                  Info
               </button>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Inspired by Vercel & Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
