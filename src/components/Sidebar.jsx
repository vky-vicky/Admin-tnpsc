import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useGlobalExam } from '../context/GlobalExamContext';

const NavIcon = ({ d }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { allExamTypes, isLoading: isExamTypesLoading } = useGlobalExam();
  const [examsOpen, setExamsOpen] = useState(location.pathname.includes('/dashboard/exams'));

  const isExamActive = (slug) => location.pathname === `/dashboard/exams/${slug}`;
  const isExamSectionActive = location.pathname.startsWith('/dashboard/exams');

  const topItems = [
    {
      name: 'Dashboard', path: '/dashboard',
      icon: <NavIcon d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    },
    {
      name: 'Users Management', path: '/dashboard/users',
      icon: <NavIcon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    },
  ];

  const contentItems = [
    {
      name: 'Study Materials', path: '/dashboard/study-materials',
      icon: <NavIcon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    },
    {
      name: 'Resource Materials', path: '/dashboard/resource-materials',
      icon: <NavIcon d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
    },
    {
      name: 'Exams Review', path: '/dashboard/exams-review',
      icon: <NavIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    },
    {
      name: 'Question Reports', path: '/dashboard/question-reports',
      icon: <NavIcon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    },
  ];

  const systemItems = [
    {
      name: 'Notifications', path: '/dashboard/notifications',
      icon: <NavIcon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    },
    {
      name: 'Moderation', path: '/dashboard/moderation',
      icon: <NavIcon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    },
    {
      name: 'Settings', path: '/dashboard/settings',
      icon: <NavIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    },
    {
      name: 'Error Logs', path: '/dashboard/error-logs',
      icon: <NavIcon d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
  ];

  const navLinkClass = (isActive) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
    ${isActive
      ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-white'
    }
  `;

  const renderNavLink = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      end={item.path === '/dashboard'}
      onClick={() => window.innerWidth < 768 && onClose()}
      className={({ isActive }) => navLinkClass(isActive)}
    >
      <span className="text-slate-400 group-hover:text-blue-500 transition-colors">{item.icon}</span>
      {item.name}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transform transition-all duration-300 ease-in-out z-40 border-r border-slate-200 dark:border-slate-700/50 flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
              T
            </div>
            <div className="font-bold text-xl tracking-wide text-slate-800 dark:text-white">
              Admin<span className="text-blue-500">Ondru</span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden ml-auto text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">

          {/* Top Items */}
          {topItems.map(renderNavLink)}

          {/* Content Section */}
          <div className="px-3 pt-6 pb-2">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Content</p>
          </div>
          {contentItems.map(renderNavLink)}

          {/* Exams Accordion */}
          <div>
            <button
              onClick={() => setExamsOpen(o => !o)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isExamSectionActive
                  ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors duration-200 ${isExamSectionActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-500'}`}>
                  <NavIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </span>
                <span>Exams Management</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-300 text-slate-400 ${examsOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Sub-items */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${examsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="ml-4 mt-1 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-1 py-1">
                {isExamTypesLoading ? (
                  <div className="px-3 py-2 text-xs text-slate-400 italic">Loading categories...</div>
                ) : allExamTypes.length > 0 ? (
                  allExamTypes.map((et) => {
                    const active = isExamActive(et.slug);
                    return (
                      <NavLink
                        key={et.slug}
                        to={`/dashboard/exams/${et.slug}`}
                        onClick={() => window.innerWidth < 768 && onClose()}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-white'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                        {et.name}
                      </NavLink>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400 italic">No categories found</div>
                )}
              </div>
            </div>
          </div>

          {/* System Section */}
          <div className="px-3 pt-6 pb-2">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">System</p>
          </div>
          {systemItems.map(renderNavLink)}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_user');
              navigate('/');
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 transition-all text-sm group shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
