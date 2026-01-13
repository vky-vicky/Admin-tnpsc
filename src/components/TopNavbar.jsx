import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../api/adminService';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ onToggleSidebar, onToggleTheme, isDark }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({ name: 'Admin User', role: 'Administrator' });
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // 1. Get User Info
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            setUser({
                name: parsed.full_name || parsed.name || parsed.email?.split('@')[0] || 'Admin User',
                role: parsed.role || 'Administrator',
                email: parsed.email
            });
        } catch (e) {
            console.error("Error parsing user info", e);
        }
    }

    // 2. Fetch Notifications (Personal + App Broadcasts)
    const fetchNotifications = async () => {
        try {
            // Fetch both personal notifications and global exam alerts (broadcasts)
            const [personalData, appExams] = await Promise.all([
                adminService.getNotifications().catch(() => []), 
                adminService.manageExams.listUpcoming().catch(() => [])
            ]);

            let combinedNotifs = [];

            // 1. Process Personal Notifications
            if (Array.isArray(personalData)) {
                 combinedNotifs = [...personalData];
            } else if (personalData.data && Array.isArray(personalData.data)) {
                 combinedNotifs = [...personalData.data];
            } else if (personalData.notifications) {
                 combinedNotifs = [...personalData.notifications];
            }

            // 2. Process App Exams/Broadcasts
            const examsList = Array.isArray(appExams) ? appExams : (appExams.data || []);
            const mappedExams = examsList.map(exam => ({
                id: `exam-${exam.id}`,
                title: `Exam Alert: ${exam.exam_name}`,
                body: `${exam.description || 'Upcoming Exam Warning'} - ${new Date(exam.exam_date).toLocaleDateString()}`,
                created_at: exam.exam_date, // Using target date as sorting key
                type: 'exam_alert'
            }));

            // Merge and Sort by Date (newest first)
            const finalNotifications = [...combinedNotifs, ...mappedExams].sort((a, b) => {
                const dateA = new Date(a.created_at || a.timestamp || 0);
                const dateB = new Date(b.created_at || b.timestamp || 0);
                return dateB - dateA;
            });
            
            setNotifications(finalNotifications.slice(0, 5)); // Show latest 5
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };
    fetchNotifications();
    
    // Optional: Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Search Logic (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setSearchLoading(true);
        setShowResults(true);
        try {
          const data = await adminService.materials.searchStudy(searchQuery);
          // Handle data format from API
          const items = Array.isArray(data) ? data : (data.data || data.materials || []);
          setResults(items);
        } catch (err) {
          console.error("Search failed", err);
          setResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      navigate('/');
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-6 flex items-center justify-between transition-colors duration-200">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
        </button>
        
        <div className="hidden md:flex items-center text-slate-400 text-sm">
           <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Admin</span>
           <span className="mx-2">/</span>
           <span className="font-medium text-slate-800 dark:text-slate-200">Dashboard</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search (Desktop) */}
        <div className="hidden md:block relative mr-2" ref={searchRef}>
           <div className="relative group">
              <input 
                type="text" 
                placeholder="Search study materials..." 
                className="w-80 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 text-sm rounded-full border-none outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-600 dark:text-slate-300 placeholder-slate-400 transition-all font-inter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
              />
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
           </div>

           {/* Search Results Dropdown */}
           {showResults && (
             <div className="absolute top-full left-0 mt-3 w-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up z-[60]">
               <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Search Results</span>
                  {searchLoading && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
               </div>
               
               <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {results.length === 0 ? (
                    <div className="p-8 text-center">
                       <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{searchLoading ? 'Searching...' : 'No materials found for this query.'}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                       {results.map((item) => (
                         <div 
                            key={item.id} 
                            onClick={() => {
                               navigate(`/dashboard/materials?search=${item.title}`);
                               setShowResults(false);
                            }}
                            className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                         >
                            <div className="flex items-start gap-3">
                               <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{item.title}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.category} • {item.subject}</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
               
               <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 text-center">
                  <button 
                    onClick={() => {
                        navigate(`/dashboard/materials?search=${searchQuery}`);
                        setShowResults(false);
                    }}
                    className="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest"
                  >
                    View all study materials
                  </button>
               </div>
             </div>
           )}
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme} 
          className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
        >
          {isDark ? (
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          ) : (
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
            <button 
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-slate-900"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in z-50">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200">
                      Notifications
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                      ) : (
                          notifications.map((notif, index) => (
                              <div key={notif.id || index} className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.body || notif.message}</p>
                                  <p className="text-xs text-blue-500 mt-2 text-right">
                                    {notif.created_at ? new Date(notif.created_at).toLocaleTimeString() : 'Just now'}
                                  </p>
                              </div>
                          ))
                      )}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700 text-center">
                    <button className="text-xs font-bold text-blue-500 hover:text-blue-600">View All</button>
                  </div>
              </div>
            )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700 ml-2">
          <div className="text-right hidden lg:block">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 max-w-[100px] truncate">{user.email || user.role}</div>
          </div>
          <button 
             onClick={handleLogout}
             title="Click to Logout"
             className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20 transition-transform hover:scale-105"
          >
             <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-indigo-600 text-sm">
                    {user.name.charAt(0).toUpperCase()}
                </span>
             </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
