import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text">
        Admin Portal
      </h1>
      <p className="text-xl text-slate-300 mb-8 max-w-md text-center">
        Welcome to the admin dashboard. Manage your users, content, and settings efficiently.
      </p>
      <Link 
        to="/dashboard" 
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Home;
