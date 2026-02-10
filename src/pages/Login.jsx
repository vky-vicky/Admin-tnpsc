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
  const [showPassword, setShowPassword] = useState(false);
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
      console.error('Login error:', err);
      const errorData = err.response?.data;
      
      if (errorData?.detail) {
        if (typeof errorData.detail === 'string') {
          setError(errorData.detail);
        } else if (Array.isArray(errorData.detail)) {
          // FastAPI often returns detail as an array of error objects
          setError(errorData.detail[0]?.msg || 'Validation error occurred');
        } else {
          setError('An error occurred during sign in');
        }
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength={6}
                maxLength={6}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium pr-12"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
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
