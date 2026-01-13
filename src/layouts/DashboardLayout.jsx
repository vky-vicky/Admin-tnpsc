import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { useTheme } from '../context/ThemeContext';

const DashboardLayout = () => {
  const { toggleTheme, isDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-inter transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Top Navbar */}
        <TopNavbar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleTheme={toggleTheme}
          isDark={isDark}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar scroll-smooth bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
