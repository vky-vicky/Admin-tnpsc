import React, { useState } from 'react';
import { adminService } from '../api/adminService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const RegisterAdmin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    role: 'admin',
    exam_type: 'TNPSC',
    subscription_status: 'active'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Register the admin user
      const registerResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        toast.error('Registration Failed', registerData.detail || 'Unable to create admin user');
        setLoading(false);
        return;
      }

      // Step 2: Automatically log in the user
      const loginResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        const token = loginData.access_token || loginData.token || loginData.data?.token;
        const userData = loginData.user || loginData.data?.user || { email: formData.email, name: formData.name, role: 'admin' };

        // Store credentials
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(userData));

        toast.success('Admin Created Successfully', 'Welcome to the dashboard!');
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error('Auto-login Failed', 'Admin created but please login manually');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      toast.error('Registration Failed', err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-scale-up">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 text-center tracking-tight">
          Create <span className="text-blue-500">Admin</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm font-medium">
          Register a new administrator account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-black uppercase tracking-widest mb-2">
              Full Name
            </label>
            <input 
              type="text" 
              name="name"
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="Admin User"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-black uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              name="email"
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="admin@ondrutechnologies.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-black uppercase tracking-widest mb-2">
              Password
            </label>
            <input 
              type="password" 
              name="password"
              required
              minLength="6"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-black uppercase tracking-widest mb-2">
              Phone Number
            </label>
            <input 
              type="tel" 
              name="phone_number"
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="1234567890"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? 'Creating Admin...' : 'Create Admin Account'}
          </button>

          <button 
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-lg transition-all"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;
