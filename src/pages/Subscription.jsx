import React from 'react';

const Subscriptions = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                        Subscription <span className="text-gradient">Management</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Monitor revenue, plan distributions, and student premium access.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xl">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4 uppercase tracking-tight">Subscription Engine Initializing</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-medium">
                    We are currently integrating the payment gateway and plan management tools. Check back soon for full billing analytics.
                </p>
                <div className="flex justify-center gap-4">
                    <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Coming Soon</div>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
