import React, { useEffect, useState } from 'react';
import { adminService } from '../api/adminService';
import { analyticsService } from '../api/analyticsService';
import StatCard from '../components/StatCard';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    total_users: 0,
    total_resources: 0,
    total_exams: 0,
    total_materials: 0
  });
  const [activities, setActivities] = useState([]);
  const [reports, setReports] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proficiency, setProficiency] = useState([]);
  const [toughness, setToughness] = useState(null);
  const [performance, setPerformance] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data with individual fallback catching to prevent global failure
      const [usersRes, materialsRes, resourcesRes, realExamsRes, mockExamsRes, activityRes, reportsRes, upcomingRes, analyticsRes, proficiencyRes, toughnessRes, performanceRes] = await Promise.all([
        adminService.getUsers().catch(err => { toast.error("Users fetch failed"); return []; }),
        adminService.materials.listStudy().catch(err => { toast.error("Materials fetch failed"); return []; }),
        adminService.materials.listResource().catch(err => { toast.error("Resources fetch failed"); return []; }),
        adminService.manageExams.listReal('REAL_EXAM').catch(err => { toast.error("Real Exams fetch failed"); return []; }),
        adminService.manageExams.listReal('MOCK_EXAM').catch(err => { toast.error("Mock Exams fetch failed"); return []; }),
        adminService.getRecentActivity(5).catch(err => { toast.error("Activity fetch failed"); return []; }),
        adminService.getReports ? adminService.getReports({ status: 'PENDING' }).catch(err => []) : Promise.resolve([]),
        adminService.manageExams.listUpcoming().catch(err => []),
        analyticsService.getDashboardStats().catch(() => null),
        analyticsService.getSubjectProficiency().catch(() => []),
        analyticsService.getToughnessAnalytics().catch(() => null),
        analyticsService.getUserPerformance().catch(() => [])
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
      const resourceList = getList(resourcesRes);
      const realExamList = getList(realExamsRes);
      const mockExamList = getList(mockExamsRes);
      const activityList = getList(activityRes);

      const getFullList = (res) => {
        const list = getList(res);
        return Array.isArray(list) ? list : [];
      };

      setStats({
        total_users: userList.length,
        total_resources: resourceList.length,
        total_exams: realExamList.length + mockExamList.length,
        total_materials: materialList.length
      });

      setActivities(activityList);
      setReports(getFullList(reportsRes));
      setUpcomingExams(getFullList(upcomingRes).slice(0, 3));
      
      if (analyticsRes) {
        const aData = analyticsRes.data || analyticsRes;
        setStats(prev => ({
            ...prev,
            total_users: aData.total_users || prev.total_users,
            total_exams: aData.total_attempts || prev.total_exams, // Using attempts as active stat
            total_materials: aData.total_materials || prev.total_materials
        }));
      }

      setProficiency(proficiencyRes?.data || proficiencyRes || []);
      setToughness(toughnessRes?.data || toughnessRes);
      setPerformance(performanceRes?.data || performanceRes || []);

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
          title="Resource Materials" 
          count={stats.total_resources} 
          trend={5}
          color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
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
              <h3 className="text-lg font-bold mb-1">Community Moderation</h3>
              <p className="text-indigo-100 text-sm mb-4">Pending reports requiring review</p>
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-4xl font-bold">{reports.length}</span>
                 <span className="text-indigo-200 text-sm">items</span>
              </div>
              <button 
                onClick={() => window.location.hash = '#/dashboard/moderation'}
                className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors text-center"
              >
                Moderate Now
              </button>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl"></div>
          </div>

          {/* Subject Proficiency */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Subject Proficiency</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Avg Accuracy</span>
            </div>
            
            <div className="space-y-4">
              {proficiency.length === 0 ? (
                  <p className="text-slate-400 italic text-sm py-10 text-center">No subject data available yet.</p>
              ) : (
                  proficiency.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                              <span>{item.subject}</span>
                              <span className="text-indigo-600 dark:text-indigo-400">{item.average_score}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                  style={{ width: `${item.average_score}%` }}
                              ></div>
                          </div>
                      </div>
                  ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Upcoming Exam Alerts</h3>
            <div className="space-y-3">
               {upcomingExams.length === 0 ? (
                 <p className="text-xs text-slate-500 italic">No upcoming exams scheduled.</p>
               ) : (
                 upcomingExams.map((exam) => (
                   <div key={exam.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col gap-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{exam.exam_name}</p>
                      <div className="flex justify-between items-center text-[10px]">
                         <span className="text-blue-500 font-bold uppercase">{exam.exam_type_slug}</span>
                         <span className="text-slate-400">{new Date(exam.exam_date).toLocaleDateString()}</span>
                      </div>
                   </div>
                 ))
               )}
            </div>
            <button 
              onClick={() => window.location.hash = '#/content/notifications'}
              className="mt-4 w-full py-2 text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-700/50 rounded-xl hover:bg-slate-200 transition-all"
            >
              View Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Section 2: Performance & Toughness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
        
        {/* Top Performers */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Top Performers</h2>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">Global Rank</span>
          </div>
          
          <div className="overflow-y-auto max-h-[400px] flex-1">
            <table className="w-full text-left">
                <thead className="bg-slate-50/30 dark:bg-slate-800/20 text-slate-400 uppercase text-[9px] font-black tracking-widest sticky top-0">
                    <tr>
                        <th className="px-8 py-4">User</th>
                        <th className="px-8 py-4">Attempts</th>
                        <th className="px-8 py-4 text-right">Avg Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {performance.length === 0 ? (
                        <tr><td colSpan="3" className="p-8 text-center text-slate-400 italic">No performer data yet.</td></tr>
                    ) : (
                        performance.map((user, idx) => (
                            <tr key={user.user_id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-300">#{idx + 1}</span>
                                        <span className="font-bold text-slate-800 dark:text-white truncate max-w-[120px]">{user.user_name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <span className="text-xs font-bold text-slate-500">{user.total_attempts}</span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black uppercase">
                                        {user.average_score}%
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
        </div>

        {/* Toughness Analytics */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Toughness Distribution</h2>
            </div>

            {toughness ? (
                <div className="space-y-6">
                    <div className="flex gap-2 mb-4">
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                            Preferred Level: <span className="text-indigo-600 font-black">{toughness.most_used_level || 'N/A'}</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {toughness.popularity?.map((pop, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-6 transition-all hover:scale-[1.02]">
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            pop.toughness_level?.toLowerCase().includes('hard') ? 'bg-rose-100 text-rose-600' : 
                                            pop.toughness_level?.toLowerCase().includes('medium') ? 'bg-amber-100 text-amber-600' : 
                                            'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {pop.toughness_level}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">{pop.attempt_count} Attempts</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                pop.toughness_level?.toLowerCase().includes('hard') ? 'bg-rose-500' : 
                                                pop.toughness_level?.toLowerCase().includes('medium') ? 'bg-amber-500' : 
                                                'bg-emerald-500'
                                            }`} 
                                            style={{ width: `${pop.average_score}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Average</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{pop.average_score}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center text-slate-400 italic">Calculating toughness metrics...</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
