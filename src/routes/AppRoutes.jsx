import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import RegisterAdmin from '../pages/RegisterAdmin';
import Dashboard from '../pages/Dashboard';
import UsersList from '../pages/users/UsersList';
import StudyMaterials from '../pages/content/StudyMaterials';
import ResourceMaterials from '../pages/content/ResourceMaterials';
import Exams from '../pages/content/Exams';
import Notifications from '../pages/content/Notifications';
import Leaderboard from '../pages/analytics/Leaderboard';
import Subscriptions from '../pages/Subscription';
import Settings from '../pages/Settings';
import DashboardLayout from '../layouts/DashboardLayout';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register-admin" element={<RegisterAdmin />} />
      
      {/* Protected/Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        {/* Add more sub-routes here like /dashboard/users */}
        <Route path="users" element={<UsersList />} />
        <Route path="study-materials" element={<StudyMaterials />} />
        <Route path="resource-materials" element={<ResourceMaterials />} />
        <Route path="exams" element={<Exams />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback for 404 */}
      <Route path="*" element={
        <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold text-slate-400">404 - Page Not Found</h1>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;
