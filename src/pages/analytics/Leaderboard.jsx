import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';

const Leaderboard = () => {
    const { toast } = useToast();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('daily'); // 'daily', 'weekly', 'alltime'

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            let res;
            if (timeframe === 'daily') {
                res = await adminService.getDailyLeaderboard();
            } else if (timeframe === 'weekly') {
                res = await adminService.getWeeklyLeaderboard();
            } else {
                res = await adminService.getLeaderboard();
            }

            // The daily/weekly endpoints return { status: 'success', data: { leaderboard: [...] } }
            // The alltime might return the array directly or in a different field
            const data = Array.isArray(res) ? res : (res.data?.leaderboard || res.leaderboard || res.data || []);
            
            // Map the fields if they are different (e.g., user_id -> id, total_score -> score/accuracy)
            const mappedData = data.map(item => ({
                ...item,
                id: item.user_id || item.id,
                accuracy: item.total_score || item.accuracy || 0,
                level: item.level || 1,
                exams_taken: item.exams_taken || 0
            }));

            setLeaderboard(mappedData);
        } catch (err) {
            toast.error('Sync Error', 'Could not retrieve real-time leaderboard data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-200 dark:ring-amber-500/50">
                <span className="text-white text-lg font-black tracking-tighter">1</span>
            </div>
        );
        if (rank === 2) return (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-400/20 ring-2 ring-slate-100 dark:ring-slate-400/50">
                <span className="text-white text-lg font-black tracking-tighter">2</span>
            </div>
        );
        if (rank === 3) return (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-2 ring-orange-200 dark:ring-orange-500/50">
                <span className="text-white text-lg font-black tracking-tighter">3</span>
            </div>
        );
        return (
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-black">{rank}</span>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                        Global <span className="text-gradient">Leaderboard</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Tracking the top-performing students across all categories</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                    <button 
                        onClick={() => setTimeframe('daily')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === 'daily' ? 'bg-white dark:bg-slate-800 shadow-lg text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => setTimeframe('weekly')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === 'weekly' ? 'bg-white dark:bg-slate-800 shadow-lg text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        This Week
                    </button>
                    <button 
                        onClick={() => setTimeframe('alltime')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === 'alltime' ? 'bg-white dark:bg-slate-800 shadow-lg text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {/* Top 3 Spades Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {leaderboard.slice(0, 3).map((player, idx) => (
                    <div 
                        key={player.id} 
                        className={`relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${idx === 0 ? 'md:-translate-y-4 ring-2 ring-amber-500/20' : ''}`}
                    >
                        {/* Background Ornament */}
                        <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full opacity-10 dark:opacity-5 bg-gradient-to-br ${idx === 0 ? 'from-amber-400 to-amber-600' : idx === 1 ? 'from-slate-400 to-slate-600' : 'from-orange-400 to-orange-600'}`}></div>
                        
                        <div className="relative flex flex-col items-center text-center">
                            <div className="mb-6 relative">
                                <div className={`w-24 h-24 rounded-full p-1 bg-gradient-to-tr ${idx === 0 ? 'from-amber-400 to-yellow-300' : idx === 1 ? 'from-slate-400 to-slate-200' : 'from-orange-500 to-orange-300'} shadow-2xl`}>
                                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-inner">
                                        <span className="text-3xl font-black text-slate-800 dark:text-white uppercase">
                                            {player.name?.[0]}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute -top-3 -right-3">
                                    {getRankBadge(idx + 1)}
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">{player.name}</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Level {player.level || 1}</span>
                            </div>

                            <div className="w-full pt-6 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    {timeframe === 'alltime' ? 'Avg Accuracy' : 'Total Score'}
                                </p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                                    {player.accuracy}{timeframe === 'alltime' ? '%' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Ranking List Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Full Ranking Statistics</h2>
                    <span className="text-[10px] font-black bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest">Live Updates</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-6">Rank</th>
                                <th className="px-8 py-6">Student Prototype</th>
                                <th className="px-8 py-6 text-center">Exams Taken</th>
                                <th className="px-8 py-6 text-right font-black text-blue-500 uppercase tracking-widest">
                                    {timeframe === 'alltime' ? 'Accuracy' : 'Score'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-48 mb-2"></div><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-32 opacity-50"></div></td>
                                        <td className="px-8 py-6 text-center"><div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-20 mx-auto"></div></td>
                                        <td className="px-8 py-6"><div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-24 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest">Initializing User Tracking...</td>
                                </tr>
                            ) : leaderboard.map((player, idx) => (
                                <tr key={player.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-default">
                                    <td className="px-8 py-6">{getRankBadge(idx + 1)}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 border border-slate-200 dark:border-slate-700 overflow-hidden group-hover:scale-105 transition-transform">
                                                {player.name?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">{player.name}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{player.email || 'Hiden @ User'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 inline-block">
                                            {player.exams_taken || 0} Exams
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xl font-black text-blue-500 uppercase tracking-tighter">
                                                {player.accuracy}{timeframe === 'alltime' ? '%' : ''}
                                            </span>
                                            {timeframe === 'alltime' && (
                                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                                                        style={{ width: `${Math.min(player.accuracy || 0, 100)}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
