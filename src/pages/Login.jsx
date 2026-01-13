import React, { useState } from 'react';
import { adminService } from '../api/adminService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminService.login(email, password);
      const token = response.access_token || response.token || response.data?.token;
      
      if (token) {
        let userData = response.user || (response.data && response.data.user);
        
        // Safety check for user details (some APIs return it differently)
        if (!userData && response.data) {
           userData = response.data; // Fallback if data itself is the user object
        }

        // ROLE RESTRICTION: Only admins can proceed
        if (userData && userData.role !== 'admin') {
           setError('Access Denied: Only administrators can access this portal.');
           setLoading(false);
           return;
        }

        localStorage.setItem('admin_token', token);
        if (userData) {
            localStorage.setItem('admin_user', JSON.stringify(userData));
        }
        
        toast.success('Authentication Successful', `Welcome back, Admin!`);
        navigate('/dashboard');
      } else {
        setError('Login successful but no token received.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-scale-up">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 text-center tracking-tight">Admin <span className="text-blue-500 tracking-normal font-black">Portal</span></h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm font-medium">Ondru Technologies - Content Management System</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-black uppercase tracking-widest mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-black uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
