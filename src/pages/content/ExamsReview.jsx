import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const ExamsReview = () => {
  const { toast } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null); // When null, show list. When object, show questions.
  const [questions, setQuestions] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  
  // Editing state
  const [editingQuestion, setEditingQuestion] = useState(null);
   const [publishLoading, setPublishLoading] = useState(false);
   
   // New Question state
   const [isAddingQuestion, setIsAddingQuestion] = useState(false);
   const [newQuestion, setNewQuestion] = useState({
     question_text: '',
     option_a: '',
     option_b: '',
     option_c: '',
     option_d: '',
     correct_answer: 'A',
     explanation_text: '',
     language: 'tamil'
   });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await adminService.manageExams.listPending();
      const rawExams = Array.isArray(data) ? data : (data.data || []);
      
      // Filter out Daily Practice exams
      const filteredExams = rawExams.filter(e => e.exam_type !== 'DAILY_TEST');
      setExams(filteredExams);
    } catch (err) {
      toast.error('Sync Error', 'Could not fetch pending exams.');
    } finally {
      setLoading(false);
    }
  };

  const loadExamDetails = async (examId) => {
    setReviewLoading(true);
    try {
      const res = await adminService.manageExams.getExamDetailWithQuestions(examId);
      setSelectedExam(res.exam);
      setQuestions(res.questions || []);
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error('Load Error', 'Could not fetch exam questions.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      await adminService.manageExams.updateExam(selectedExam.id, {
        exam_name: selectedExam.exam_name,
        description: selectedExam.description
      });
      toast.success('Exam Updated', 'Basic details have been saved.');
    } catch (err) {
      toast.error('Update Failed', 'Could not save exam details.');
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.manageExams.updateQuestion(editingQuestion.id, editingQuestion);
      setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q));
      setEditingQuestion(null);
      toast.success('Question Saved', 'Changes have been recorded successfully.');
    } catch (err) {
      toast.error('Save Failed', 'Could not update the question.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await adminService.manageExams.deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
      toast.success('Question Deleted', 'Item removed from the exam.');
    } catch (err) {
      toast.error('Delete Failed', 'Could not remove the question.');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.manageExams.addQuestion(selectedExam.id, newQuestion);
      setQuestions([...questions, res.data || res]);
      setIsAddingQuestion(false);
      setNewQuestion({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation_text: '',
        language: 'tamil'
      });
      toast.success('Question Added', 'New question has been appended to the pool.');
    } catch (err) {
      toast.error('Add Failed', 'Could not append the new question.');
    }
  };

  const handlePublish = async () => {
    setPublishLoading(true);
    try {
      await adminService.manageExams.publishExam(selectedExam.id);
      toast.success('Exam Published! 🚀', 'Broadcast notification sent to all users.');
      setSelectedExam(null);
      fetchExams();
    } catch (err) {
      toast.error('Publish Failed', 'Could not transition the exam to live status.');
    } finally {
      setPublishLoading(false);
    }
  };

  const isPublishable = (exam) => {
    if (!exam) return false;
    const name = exam.exam_name?.toLowerCase() || '';
    const type = exam.exam_type?.toUpperCase() || '';
    return type === 'REAL_EXAM' || 
           name.includes('previous year') || 
           name.includes('pyq');
  };

  if (selectedExam) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
            <button onClick={() => setSelectedExam(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-500 font-bold transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to List
            </button>
            {isPublishable(selectedExam) && (
                <button 
                    onClick={handlePublish}
                    disabled={publishLoading}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                    {publishLoading ? 'Publishing...' : 'Approve & Publish'}
                </button>
            )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
             <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6">Exam Configuration</h2>
             <form onSubmit={handleUpdateExam} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Exam Name</label>
                    <input 
                        type="text" 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedExam.exam_name}
                        onChange={(e) => setSelectedExam({...selectedExam, exam_name: e.target.value})}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                        rows="3"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedExam.description}
                        onChange={(e) => setSelectedExam({...selectedExam, description: e.target.value})}
                    />
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Save Header</button>
                </div>
             </form>
        </div>

        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Question Pool ({questions.length})</h3>
                <button 
                  onClick={() => setIsAddingQuestion(true)}
                  className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    New Question
                </button>
            </div>

            {isAddingQuestion && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl p-8 animate-scale-up">
                    <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6">Add New Manual Question</h4>
                    <form onSubmit={handleAddQuestion} className="space-y-6">
                        <textarea 
                            required rows="3"
                            placeholder="Type your question here..."
                            className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={newQuestion.question_text}
                            onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['a', 'b', 'c', 'd'].map(opt => (
                                <div key={opt}>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Option {opt.toUpperCase()}</label>
                                    <input 
                                        required
                                        className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newQuestion[`option_${opt}`]}
                                        onChange={(e) => setNewQuestion({...newQuestion, [`option_${opt}`]: e.target.value})}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Correct Answer</label>
                                 <select 
                                     className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                     value={newQuestion.correct_answer}
                                     onChange={(e) => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                                 >
                                     <option value="A">Option A</option>
                                     <option value="B">Option B</option>
                                     <option value="C">Option C</option>
                                     <option value="D">Option D</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Explanation (Optional)</label>
                                 <input 
                                     className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                                     value={newQuestion.explanation_text}
                                     onChange={(e) => setNewQuestion({...newQuestion, explanation_text: e.target.value})}
                                 />
                             </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-blue-100 dark:border-blue-900/30">
                            <button type="button" onClick={() => setIsAddingQuestion(false)} className="px-6 py-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                            <button type="submit" className="px-10 py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20">Add Question</button>
                        </div>
                    </form>
                </div>
            )}
            {questions.map((q, idx) => (
                <div key={q.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 group">
                   {editingQuestion?.id === q.id ? (
                       <form onSubmit={handleUpdateQuestion} className="space-y-4">
                           <textarea 
                             className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                             value={editingQuestion.question_text}
                             onChange={(e) => setEditingQuestion({...editingQuestion, question_text: e.target.value})}
                           />
                           <div className="grid grid-cols-2 gap-4">
                               {['a', 'b', 'c', 'd'].map(opt => (
                                   <div key={opt}>
                                       <label className="text-[10px] font-black uppercase mb-1 block">Option {opt.toUpperCase()}</label>
                                       <input 
                                         className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                         value={editingQuestion[`option_${opt}`]}
                                         onChange={(e) => setEditingQuestion({...editingQuestion, [`option_${opt}`]: e.target.value})}
                                       />
                                   </div>
                               ))}
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Correct Answer</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                        value={editingQuestion.correct_answer}
                                        onChange={(e) => setEditingQuestion({...editingQuestion, correct_answer: e.target.value})}
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                                <div className="flex items-end justify-end gap-2">
                                    <button type="button" onClick={() => setEditingQuestion(null)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl">Save Question</button>
                                </div>
                           </div>
                       </form>
                   ) : (
                       <div className="flex justify-between gap-6">
                           <div className="flex-1">
                               <div className="flex items-center gap-3 mb-3">
                                   <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 text-sm">{idx + 1}</span>
                                   <p className="font-bold text-slate-800 dark:text-slate-100">{q.question_text}</p>
                               </div>
                               <div className="grid grid-cols-2 gap-x-8 gap-y-2 pl-11">
                                   {['a', 'b', 'c', 'd'].map(opt => (
                                       <p key={opt} className={`text-sm ${q.correct_answer === opt.toUpperCase() ? 'text-emerald-500 font-bold' : 'text-slate-500'}`}>
                                           {opt.toUpperCase()}: {q[`option_${opt}`]}
                                       </p>
                                   ))}
                               </div>
                               <div className="mt-4 pl-11">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Explanation</p>
                                   <p className="text-xs text-slate-500 italic">{q.explanation_text || 'No explanation provided.'}</p>
                               </div>
                           </div>
                           <div className="flex flex-col gap-2">
                               <button onClick={() => setEditingQuestion(q)} className="p-2 text-slate-400 hover:text-blue-500 transition-all shadow-sm rounded-lg border border-slate-100 dark:border-slate-800">
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                               </button>
                               <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-slate-400 hover:text-red-500 transition-all shadow-sm rounded-lg border border-slate-100 dark:border-slate-800">
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                           </div>
                       </div>
                   )}
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight text-gradient">
            Admin <span className="">Review</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Approve and verify auto-generated exams before publishing.</p>
        </div>
        
        <button 
           onClick={fetchExams}
           className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 transition-all"
        >
            <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
         <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Pending Review Queue</h2>
            <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                Action Required
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/30 dark:bg-slate-800/20 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                        <th className="px-8 py-5">Exam Details</th>
                        <th className="px-8 py-5">Subject</th>
                        <th className="px-8 py-5">Source Material</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                        <tr><td colSpan="4" className="text-center py-20 font-bold text-slate-400 animate-pulse uppercase tracking-widest">Scanning for pending items...</td></tr>
                    ) : exams.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-32">
                           <div className="flex flex-col items-center">
                               <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/10 flex items-center justify-center mb-4 border-4 border-emerald-50 dark:border-emerald-900/20">
                                   <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                               </div>
                               <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Queue Clear</h3>
                               <p className="text-slate-500 text-sm mt-1">All exams have been reviewed and published.</p>
                           </div>
                        </td></tr>
                    ) : (
                        exams.map(exam => (
                            <tr key={exam.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">{exam.exam_name}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {exam.id}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        {exam.subject}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{exam.material_title || 'Direct Upload'}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Processed via AI</div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button 
                                      onClick={() => loadExamDetails(exam.id)}
                                      className="px-6 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all"
                                    >
                                        Review Exam
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default ExamsReview;
