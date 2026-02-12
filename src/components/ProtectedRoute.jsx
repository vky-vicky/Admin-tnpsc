import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  // Check if token exists and user is an admin
  // Normalize role: remove underscores, convert to lowercase
  const normalizedRole = user?.role?.toLowerCase().replace(/_/g, '');
  const isAdmin = normalizedRole === 'admin' || 
                 normalizedRole === 'administrator' || 
                 normalizedRole === 'superadmin' || 
                 user?.is_admin === true;
  const isAuthenticated = token && isAdmin;

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
