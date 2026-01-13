import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';

const ExamsList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await adminService.manageExams.list();
        setExams(Array.isArray(data) ? data : (data.exams || []));
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch exams", error);
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await adminService.manageExams.delete(id);
        setExams(exams.filter(e => e.id !== id));
      } catch (err) {
        alert('Failed to delete exam');
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Official Exam Management</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Exam Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Total Marks</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
            ) : exams.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8">No official exams found</td></tr>
            ) : exams.map(exam => (
              <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{exam.exam_name}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{exam.exam_type_slug}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {new Date(exam.exam_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                   <button onClick={() => handleDelete(exam.id)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamsList;
