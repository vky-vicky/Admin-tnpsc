import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import Pagination from '../../components/Pagination';
import BaseModal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import { useGlobalExam } from '../../context/GlobalExamContext';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between">
        <div className="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-6 w-12 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
  </div>
);

const InstructionModal = ({ exam, onClose }) => {
    const [instructions, setInstructions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructions = async () => {
            try {
                const res = await adminService.manageExams.getInstructions(exam.id);
                setInstructions(res.data || res);
            } catch (err) {
                console.error("Failed to fetch instructions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructions();
    }, [exam.id]);

    const getInstructionIcon = (index) => {
        const icons = ["🏆", "🔘", "⏳", "🔄", "💡", "📈"];
        return icons[index % icons.length];
    };

    return (
        <BaseModal 
            isOpen={!!exam} 
            onClose={onClose} 
            title="EXAM PREVIEW" 
            subtitle={exam.exam_name}
        >
            {loading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                        ))}
                    </div>
                </div>
            ) : instructions ? (
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Time Limit</p>
                            <p className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                {instructions.duration_minutes ? `${instructions.duration_minutes} Mins` : 'Unlimited Mins'}
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Questions</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                {instructions.total_questions || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="space-y-6">
                        <h3 className="font-black text-xs text-slate-500 uppercase tracking-[0.2em]">Candidate Instructions</h3>
                        <div className="space-y-5">
                            {instructions.instructions?.map((ins, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <span className="shrink-0 w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-sm group-hover:scale-110 transition-transform duration-300">
                                        {getInstructionIcon(i)}
                                    </span>
                                    <div className="flex-1 pt-1">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                                            {ins.split(':').length > 1 ? (
                                                <>
                                                    <span className="text-slate-900 dark:text-white">{ins.split(':')[0]}:</span>
                                                    <span className="font-medium text-slate-500 dark:text-slate-400"> {ins.split(':')[1]}</span>
                                                </>
                                            ) : ins}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fixed Action Button */}
                    <div className="pt-6 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
                    No configuration found for this exam.
                </div>
            )}
        </BaseModal>
    );
};

const EXAM_TYPE_LABELS = {
  TNPSC: 'TNPSC General',
  TNPSC_GROUP_1: 'Group 1',
  TNPSC_GROUP_2: 'Group 2',
  TNPSC_GROUP_4: 'Group 4',
  TET: 'TET',
  POLICE: 'Police Exam',
  REAL_EXAM: 'Real Exam',
  MOCK_EXAM: 'Mock Exam',
};

const Exams = () => {
  const { toast } = useToast();
  const { examType = 'TNPSC' } = useParams();
  const { activeExamType, allExamTypes, setActiveExamType, isLoading: isExamTypesLoading } = useGlobalExam();
  const navigate = useNavigate();
  
  // Sync global context with URL param (Sidebar/URL direct navigation)
  useEffect(() => {
    if (examType && activeExamType !== examType) {
      const normActive = activeExamType?.replace(/[_\s-]/g, '').toLowerCase();
      const normURL = examType?.replace(/[_\s-]/g, '').toLowerCase();
      if (normActive !== normURL) {
        setActiveExamType(examType);
      }
    }
  }, [examType]);

  // Sync URL param with global context (if changed via TopNavbar switcher)
  useEffect(() => {
    if (activeExamType && activeExamType !== 'ALL' && activeExamType !== examType) {
      const normActive = activeExamType?.replace(/[_\s-]/g, '').toLowerCase();
      const normURL = examType?.replace(/[_\s-]/g, '').toLowerCase();
      if (normActive !== normURL) {
        navigate(`/dashboard/exams/${activeExamType}`);
      }
    }
  }, [activeExamType, navigate]);

  // Find dynamic label if available
  const platformLabel = allExamTypes.find(t => t.slug?.toLowerCase() === examType?.toLowerCase())?.name || EXAM_TYPE_LABELS[examType] || examType;
  
  const [exams, setExams] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState(null); // For instruction preview
  const [examSubCategory, setExamSubCategory] = useState('REAL_EXAM'); // 'REAL_EXAM' or 'MOCK_EXAM'
  
  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Increased from 6 for better visibility
  
  // Form State
  const [formData, setFormData] = useState({
    exam_name: '',
    description: '',
    duration_minutes: 180,
    language: 'tamil',
    category: 'General',
    subject: '',
    exam_type: 'REAL_EXAM',
    materials: [{ material_id: '', num_questions: 1 }]
  });
  const [creationMode, setCreationMode] = useState('auto'); // 'auto' or 'manual'
  const [createLoading, setCreateLoading] = useState(false);

  // Question Management State
  const [managementExam, setManagementExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
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
  const [questionDeleteModal, setQuestionDeleteModal] = useState({
    isOpen: false,
    id: null
  });
  const [questionDeleteLoading, setQuestionDeleteLoading] = useState(false);

  // Add-Question mode: 'manual' | 'from_material'
  const [addMode, setAddMode] = useState('manual');
  const [fromMaterial, setFromMaterial] = useState({ material_id: '', num_questions: 3 });
  const [addFromMatLoading, setAddFromMatLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    fetchExams();
    fetchMaterials();
  }, [examType, examSubCategory, isExamTypesLoading]);

  const fetchExams = async () => {
    if (!examType || isExamTypesLoading) return;
    setLoading(true);
    try {
      // Use exam_type_code instead of exam_type to filter by platform (TNPSC, etc)
      const data = await adminService.manageExams.listReal({ 
        exam_type_code: examType, 
        exam_type: examSubCategory,
        limit: 1000 
      });
      
      const examsList = Array.isArray(data) ? data : (data.data || data.exams || []);
      
      // Filter the list with robust matching (spaces/underscores/etc)
      const filteredResult = examsList.filter(e => {
        const platform = e.exam_type_code || e.exam_type; 
        if (!platform || !examType) return false;
        
        const normItem = platform.replace(/[_\s-]/g, '').toLowerCase();
        const normTarget = examType.replace(/[_\s-]/g, '').toLowerCase();
        
        return normItem === normTarget;
      });
      
      setExams(filteredResult);
    } catch (err) {
      console.error("Error fetching exams:", err);
      toast.error("Fetch Error", "Failed to retrieve the exam list.");
    } finally {
      // Remove artificial delay or keep it short
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const data = await adminService.materials.listStudy({ limit: 1000 });
      setMaterials(Array.isArray(data) ? data : (data.data || data.materials || []));
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const validMaterials = formData.materials.filter(m => m.material_id !== '');
      if (validMaterials.length === 0) {
        toast.error('Material Required', 'Please select at least one study material source for this exam.');
        setCreateLoading(false);
        return;
      }

      const payload = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes) || 180,
        exam_type: formData.exam_type || 'REAL_EXAM', // User selected category
        exam_type_code: examType, // Keep platform specifics here
        materials: creationMode === 'auto' ? validMaterials.map(m => ({
          material_id: parseInt(m.material_id),
          num_questions: parseInt(m.num_questions)
        })) : []
      };

      if (creationMode === 'auto') {
        await adminService.manageExams.createReal(payload);
      } else {
        await adminService.manageExams.createExam(payload);
      }
      toast.success(`${examType.replace('_', ' ')} Created`, 'The exam has been successfully configured and listed.');
      setExamSubCategory(payload.exam_type); // Switch to the relevant tab
      setView('list');
      fetchExams();
    } catch (err) {
      console.error("Create Exam Error:", err);
      toast.error('Configuration Error', 'There was an issue generating the exam questions. Please verify your material selection.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openDeleteModal = (id, title) => {
    setDeleteModal({
      isOpen: true,
      id,
      title
    });
  };

  const handleConfirmDelete = async () => {
    const { id, title } = deleteModal;
    setDeleteLoading(true);
    try {
      await adminService.manageExams.deleteReal(id);
      setExams(exams.filter(e => e.id !== id));
      toast.success('Exam Deleted', `${title} has been permanently removed.`);
      setDeleteModal({ isOpen: false, id: null, title: '' });
    } catch (err) {
      toast.error('Deletion Failed', 'The server could not process the delete request for this exam.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Question Management Logic
  const handleManage = async (exam) => {
    setManagementExam(exam);
    setReviewLoading(true);
    try {
      const res = await adminService.manageExams.getExamDetailWithQuestions(exam.id);
      setQuestions(res.questions || []);
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error('Load Error', 'Could not fetch exam questions.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      await adminService.manageExams.updateQuestion(editingQuestion.id, editingQuestion);
      setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q));
      setEditingQuestion(null);
      toast.success('Question Saved', 'Changes have been recorded successfully.');
    } catch (err) {
      console.error("Save Error:", err);
      const errorMsg = err.response?.data?.message || err.message || 'Could not update the question.';
      toast.error(`Save Failed: ${errorMsg}`);
    }
  };

  const handleDeleteQuestion = (id) => {
    setQuestionDeleteModal({
      isOpen: true,
      id
    });
  };

  const handleConfirmDeleteQuestion = async () => {
    const { id } = questionDeleteModal;
    setQuestionDeleteLoading(true);
    try {
      await adminService.manageExams.deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
      toast.success('Question Deleted', 'Item removed from the exam.');
      setQuestionDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      toast.error('Delete Failed', 'Could not remove the question.');
    } finally {
      setQuestionDeleteLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.manageExams.addQuestion(managementExam.id, newQuestion);
      // Extract the newly created question from any common API response shape
      const addedQuestion = res?.data?.question || res?.question || res?.data || res;
      setQuestions(prev => [...prev, addedQuestion]);
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
      toast.success('Question Added', `Question Pool updated: ${questions.length + 1} questions total.`);
    } catch (err) {
      toast.error('Add Failed', 'Could not append the new question.');
    }
  };

  const handleAddFromMaterial = async (e) => {
    e.preventDefault();
    if (!fromMaterial.material_id) {
      toast.error('Material Required', 'Please select a study material first.');
      return;
    }
    setAddFromMatLoading(true);
    try {
      const res = await adminService.manageExams.addQuestionsFromMaterial(managementExam.id, {
        material_id: parseInt(fromMaterial.material_id),
        num_questions: parseInt(fromMaterial.num_questions) || 1
      });
      const addedList = res?.data || [];
      setQuestions(prev => [...prev, ...addedList]);
      setIsAddingQuestion(false);
      setFromMaterial({ material_id: '', num_questions: 3 });
      const newTotal = res?.new_total || (questions.length + addedList.length);
      toast.success('Questions Added!', `${res?.added_count || addedList.length} questions added. Pool: ${newTotal} total.`);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Could not add questions from material.';
      toast.error('Add Failed', msg);
    } finally {
      setAddFromMatLoading(false);
    }
  };

  const filteredExams = exams.filter(e => 
    e.exam_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  const accentColor = examSubCategory === 'MOCK_EXAM' ? 'cyan' : 'orange';
  const accentGradients = {
    cyan: 'from-cyan-500 to-blue-600 shadow-cyan-500/20',
    orange: 'from-orange-500 to-red-600 shadow-orange-500/20'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in min-h-screen">
      
      {/* Modal Overlays */}
      {selectedExam && (
          <InstructionModal 
            exam={selectedExam} 
            onClose={() => setSelectedExam(null)} 
          />
      )}

      {/* Exam Delete Confirm */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Exam?"
        message={`Are you sure you want to delete "${deleteModal.title}"? This action will remove all questions and results associated with this exam.`}
        confirmText="Yes, Delete Exam"
      />

      {/* Question Delete Confirm */}
      <ConfirmModal 
        isOpen={questionDeleteModal.isOpen}
        onClose={() => setQuestionDeleteModal({ ...questionDeleteModal, isOpen: false })}
        onConfirm={handleConfirmDeleteQuestion}
        loading={questionDeleteLoading}
        title="Delete Question?"
        message="Are you sure you want to remove this question? This action will permanently delete it from the exam pool."
        confirmText="Delete Question"
        cancelText="Keep Question"
      />

      {/* Premium Header & Toggle */}
      {managementExam ? (
          <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                  <button onClick={() => setManagementExam(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-500 font-bold transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      Back to Hub
                  </button>
                  <div className="text-right">
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{managementExam.exam_name}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Management Mode</p>
                  </div>
              </div>

              {reviewLoading ? (
                  <div className="py-32 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest text-xs">
                      Synchronizing with Question Pool...
                  </div>
              ) : (
                  <div className="space-y-6">
                      <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Question Pool ({questions.length})</h3>
                          <button 
                            onClick={() => { setIsAddingQuestion(true); setAddMode('manual'); }}
                            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                              New Question
                          </button>
                      </div>

                      {isAddingQuestion && (() => {
                          const selMat = materials.find(m => String(m.id) === String(fromMaterial.material_id));
                          const availCount = selMat?.question_count ?? null;
                          const isOver = availCount !== null && parseInt(fromMaterial.num_questions) > availCount;
                          return (
                          <div className="bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 animate-scale-up">
                              {/* Tab toggle */}
                              <div className="flex items-center gap-2 mb-6">
                                  <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                      <button
                                          type="button"
                                          onClick={() => setAddMode('manual')}
                                          className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${addMode === 'manual' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                      >
                                          ✏️ Manual
                                      </button>
                                      <button
                                          type="button"
                                          onClick={() => setAddMode('from_material')}
                                          className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${addMode === 'from_material' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                      >
                                          📚 From Material
                                      </button>
                                  </div>
                                  <button type="button" onClick={() => setIsAddingQuestion(false)} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                  </button>
                              </div>

                              {addMode === 'manual' ? (
                                  /* ── MANUAL TAB ── */
                                  <form onSubmit={handleAddQuestion} className="space-y-5">
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
                                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                          <button type="submit" className="px-10 py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20">Add Question</button>
                                      </div>
                                  </form>
                              ) : (
                                  /* ── FROM MATERIAL TAB ── */
                                  <form onSubmit={handleAddFromMaterial} className="space-y-5">
                                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                          Select a study material from <span className="font-black text-slate-700 dark:text-slate-300">{examType}</span> and choose how many questions to pull into this exam.
                                      </p>

                                      {/* Material dropdown */}
                                      <div>
                                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Study Material</label>
                                          <select
                                              required
                                              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                              value={fromMaterial.material_id}
                                              onChange={(e) => setFromMaterial(prev => ({ ...prev, material_id: e.target.value }))}
                                          >
                                              <option value="">Select a material...</option>
                                              {materials
                                                  .filter(m => m.exam_type?.toUpperCase() === examType?.toUpperCase())
                                                  .map(m => {
                                                      const cnt = m.question_count ?? null;
                                                      return (
                                                          <option key={m.id} value={m.id}>
                                                              {m.title}{cnt !== null ? ` — ${cnt} Questions` : ''}
                                                          </option>
                                                      );
                                                  })}
                                          </select>
                                          {/* Badge */}
                                          {selMat && (
                                              <div className={`mt-2 ml-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isOver ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'}`}>
                                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                                  {availCount !== null
                                                      ? isOver
                                                          ? `⚠ Only ${availCount} available — reduce count`
                                                          : `${availCount} questions available · taking ${parseInt(fromMaterial.num_questions) || 0}`
                                                      : selMat.title
                                                  }
                                              </div>
                                          )}
                                      </div>

                                      {/* Number of questions */}
                                      <div className="flex items-end gap-4">
                                          <div className="flex-1">
                                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                                  {availCount !== null ? `How Many to Add (max ${availCount})` : 'How Many to Add'}
                                              </label>
                                              <input
                                                  type="number" required min={1}
                                                  max={availCount ?? undefined}
                                                  className={`w-full p-4 bg-white dark:bg-slate-900 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-2xl font-black transition-colors ${isOver ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                                                  value={fromMaterial.num_questions}
                                                  onChange={(e) => setFromMaterial(prev => ({ ...prev, num_questions: e.target.value }))}
                                              />
                                          </div>
                                          {/* Quick pick buttons */}
                                          <div className="flex flex-col gap-1.5 pb-1">
                                              {[3, 5, 10, 25, 50].map(n => (
                                                  <button key={n} type="button"
                                                      onClick={() => setFromMaterial(prev => ({ ...prev, num_questions: n }))}
                                                      className={`px-3 py-1 rounded-lg text-[10px] font-black border transition-all ${parseInt(fromMaterial.num_questions) === n ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-500'}`}
                                                  >+{n}</button>
                                              ))}
                                          </div>
                                      </div>

                                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                          <button
                                              type="submit"
                                              disabled={addFromMatLoading || isOver}
                                              className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all"
                                          >
                                              {addFromMatLoading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                              {addFromMatLoading ? 'Adding...' : `Add ${fromMaterial.num_questions || ''} Questions`}
                                          </button>
                                      </div>
                                  </form>
                              )}
                          </div>
                          );
                      })()}

                      <div className="space-y-4">
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
                                              <div className="md:col-span-2">
                                                  <label className="text-[10px] font-black uppercase mb-1 block">Explanation</label>
                                                  <textarea 
                                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                                    rows="2"
                                                    value={editingQuestion.explanation_text || ''}
                                                    onChange={(e) => setEditingQuestion({...editingQuestion, explanation_text: e.target.value})}
                                                    placeholder="Add an explanation for the correct answer..."
                                                  />
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
              )}
          </div>
      ) : (
        <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase text-white bg-gradient-to-r ${accentGradients[accentColor]}`}>
              {platformLabel}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Exams <span className="text-gradient">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Curate and deploy <span className="font-bold text-slate-700 dark:text-slate-300">{platformLabel}</span> exams with enterprise control.
          </p>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => setView(view === 'list' ? 'create' : 'list')}
                className={`h-12 px-6 rounded-2xl font-bold flex items-center gap-2 transition-all transform active:scale-95 shadow-xl ${
                    view === 'list' 
                    ? `bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:opacity-90` 
                    : `bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700`
                }`}
            >
                {view === 'list' ? (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        Create Exam
                    </>
                ) : 'Back to Hub'}
            </button>
        </div>
      </div>

      {view === 'list' && (
        <div className="space-y-8 animate-slide-up">
            {/* Real/Mock Toggle Tabs */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 shadow-inner">
                <button 
                    onClick={() => setExamSubCategory('REAL_EXAM')}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        examSubCategory === 'REAL_EXAM' 
                        ? 'bg-white dark:bg-slate-800 shadow-lg text-orange-600 dark:text-orange-400' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${examSubCategory === 'REAL_EXAM' ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    Real Exams
                </button>
                <button 
                    onClick={() => setExamSubCategory('MOCK_EXAM')}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        examSubCategory === 'MOCK_EXAM' 
                        ? 'bg-white dark:bg-slate-800 shadow-lg text-cyan-600 dark:text-cyan-400' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${examSubCategory === 'MOCK_EXAM' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    Mock Exams
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center animate-slide-up">
                <div className="relative flex-1 group">
                    <input 
                        type="text" 
                        placeholder={`Search ${examType.toLowerCase()}s by name or subject...`}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-slate-800 dark:text-slate-200 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg className="w-5 h-5 absolute left-4 top-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                ) : filteredExams.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4 animate-scale-up">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No {examType.toLowerCase().replace('_', ' ')}s found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mb-6">Try adjusting your search or create a new exam for this category.</p>
                        <button onClick={() => setView('create')} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Start Creating</button>
                    </div>
                ) : (
                    currentExams.map((exam, idx) => (
                        <div 
                            key={exam.id} 
                            style={{ '--delay': `${idx * 0.05}s` }}
                            className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1.5 transition-all duration-300 group animate-slide-up"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col items-start gap-1">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase text-white bg-gradient-to-r ${accentGradients[accentColor]}`}>
                                        {exam.exam_type?.replace('_', ' ')} • {exam.exam_type_code || 'N/A'}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">ID: #{exam.id}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openDeleteModal(exam.id, exam.exam_name)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1 mb-2 group-hover:text-blue-500 transition-colors">
                                {exam.exam_name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10 mb-6">
                                {exam.description || 'No detailed instructions provided for this exam set yet.'}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-xs font-semibold">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.582a2.13 2.13 0 01-.476-.733l-.151-.383m0 0a2.13 2.13 0 00-3.328-1.536l-1.048.647h-1.048m1.048-.647l-1.048-.647m1.048.647v1.294m1.048-.647l1.048.647m-1.048-.647l-1.048.647"/></svg>
                                    {(exam.language || 'Tamil').toUpperCase()}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-xs font-semibold">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    {exam.duration_minutes || '0'} Mins
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    onClick={() => handleManage(exam)}
                                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Manage Questions
                                </button>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Status: Active</span>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedExam(exam)}
                                        className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1"
                                    >
                                        ID Instructions
                                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredExams.length > itemsPerPage && !loading && (
                <div className="pt-8">
                    <Pagination 
                        totalItems={filteredExams.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
      )}

      {view === 'create' && (
        <div className="animate-slide-up max-w-4xl mx-auto pb-12">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                <div className={`p-8 bg-gradient-to-r ${accentGradients[accentColor]}`}>
                    <h2 className="text-2xl font-black text-white">Create New {platformLabel}</h2>
                    <p className="text-white/80 text-sm font-medium">Configure your exam set and source materials.</p>
                </div>
                
                <form onSubmit={handleCreate} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">Exam Name</label>
                            <input 
                                type="text" required
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                placeholder="e.g. TNPSC Group 2 Preliminary Mock"
                                value={formData.exam_name}
                                onChange={(e) => setFormData({...formData, exam_name: e.target.value})}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">Public Description</label>
                            <textarea 
                                required rows="3"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                placeholder="Instructions for the students..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">Language</label>
                            <select 
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none"
                                value={formData.language}
                                onChange={(e) => setFormData({...formData, language: e.target.value})}
                            >
                                <option value="tamil">Tamil</option>
                                <option value="english">English</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">Duration (Mins)</label>
                            <input 
                                type="number" required
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={formData.duration_minutes}
                                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">Exam Category</label>
                            <select 
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none"
                                value={formData.exam_type}
                                onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                            >
                                <option value="REAL_EXAM">Real Exam (Scheduled)</option>
                                <option value="MOCK_EXAM">Mock Exam (Practice)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">Subject</label>
                            <input 
                                type="text" required
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Creation Method</h3>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                <button 
                                    type="button"
                                    onClick={() => setCreationMode('auto')}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${creationMode === 'auto' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    AI Auto-Gen
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setCreationMode('manual')}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${creationMode === 'manual' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Manual Shell
                                </button>
                            </div>
                        </div>

                        {creationMode === 'auto' ? (
                            <div className="animate-fade-in space-y-6">
                                    <div className="flex gap-4 items-center">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                // Navigate to Study Materials page with upload view
                                                // Since we are in a SPA, we can just use window.location or if we have navigate
                                                window.location.href = '/dashboard/study-materials?view=create';
                                            }}
                                            className="text-amber-500 hover:text-amber-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                            Upload New
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, materials: [...formData.materials, { material_id: '', num_questions: 1 }]})}
                                            className="text-blue-500 hover:text-blue-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                            Add Material
                                        </button>
                                    </div>
                                <div className="space-y-4">
                                    {formData.materials.map((m, idx) => {
                                        const selectedMat = materials.find(mat => String(mat.id) === String(m.material_id));
                                        const availableCount = selectedMat?.question_count ?? selectedMat?.num_questions ?? selectedMat?.total_questions ?? null;
                                        const taken = parseInt(m.num_questions) || 0;
                                        const isOverLimit = availableCount !== null && taken > availableCount;
                                        return (
                                        <div key={idx} className="animate-fade-in">
                                            <div className="flex gap-4 items-end">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Select Source Study Material</label>
                                                    <select 
                                                        required={creationMode === 'auto'}
                                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm"
                                                        value={m.material_id}
                                                        onChange={(e) => {
                                                            const updated = [...formData.materials];
                                                            updated[idx].material_id = e.target.value;
                                                            setFormData({...formData, materials: updated});
                                                        }}
                                                    >
                                                        <option value="">Select a study material...</option>
                                                        {materials
                                                            .filter(mat => mat.exam_type?.toUpperCase() === examType?.toUpperCase())
                                                            .map(mat => {
                                                                const cnt = mat.question_count ?? mat.num_questions ?? mat.total_questions;
                                                                return (
                                                                    <option key={mat.id} value={mat.id}>
                                                                        {mat.title}{cnt != null ? ` — ${cnt} Questions` : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                    </select>
                                                </div>
                                                <div className="w-36">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                                        {availableCount !== null ? `Take (max ${availableCount})` : 'Questions'}
                                                    </label>
                                                    <input 
                                                        type="number" required={creationMode === 'auto'}
                                                        min={1}
                                                        max={availableCount ?? undefined}
                                                        className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors ${
                                                            isOverLimit
                                                            ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10'
                                                            : 'border-slate-200 dark:border-slate-700'
                                                        }`}
                                                        value={m.num_questions}
                                                        onChange={(e) => {
                                                            const updated = [...formData.materials];
                                                            updated[idx].num_questions = e.target.value;
                                                            setFormData({...formData, materials: updated});
                                                        }}
                                                    />
                                                </div>
                                                {formData.materials.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            const updated = formData.materials.filter((_, i) => i !== idx);
                                                            setFormData({...formData, materials: updated});
                                                        }}
                                                        className="p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                            {/* Material info badge */}
                                            {selectedMat && (
                                                <div className={`mt-2 ml-1 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${
                                                    isOverLimit ? 'text-red-500' : availableCount !== null ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                                                }`}>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
                                                        isOverLimit
                                                        ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                        : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                                    }`}>
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                                        {availableCount !== null
                                                            ? isOverLimit
                                                                ? `⚠ Only ${availableCount} questions available — reduce count`
                                                                : `${availableCount} questions available · taking ${taken}`
                                                            : `Material: ${selectedMat.title}`
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-8 rounded-3xl animate-fade-in flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center shrink-0">
                                    <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-amber-900 dark:text-amber-200 font-black uppercase text-xs tracking-widest">Empty Exam Shell</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">This will create a draft exam with no questions. You can add questions manually later via the <strong>Review Portal</strong>.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Total Questions Summary */}
                    {creationMode === 'auto' && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Questions to Deploy</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                                    {formData.materials.reduce((sum, m) => sum + (parseInt(m.num_questions) || 0), 0)}
                                    <span className="text-sm font-medium text-slate-400 ml-2">questions</span>
                                </p>
                            </div>
                            <div className="text-right space-y-0.5">
                                {formData.materials.map((m, i) => {
                                    const mat = materials.find(x => String(x.id) === String(m.material_id));
                                    if (!mat || !m.num_questions) return null;
                                    return (
                                        <p key={i} className="text-xs text-slate-500">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{mat.title.length > 30 ? mat.title.slice(0, 30) + '…' : mat.title}</span>
                                            {' → '}<span className="font-black text-blue-500">{m.num_questions} Qns</span>
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-2">
                        <button 
                            type="button" onClick={() => setView('list')}
                            className="px-8 py-3 text-slate-500 font-black tracking-widest uppercase hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={createLoading}
                            className={`px-12 py-4 rounded-2xl font-black text-white tracking-widest uppercase shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 bg-gradient-to-r ${accentGradients[accentColor]} cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3`}
                        >
                            {createLoading && (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {createLoading ? 'Deploying...' : `Deploy ${examType}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
        </>
      )}

      {/* Professional Deletion Modal */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={`Delete ${examType.replace('_', ' ')}`}
        message={`Are you sure you want to delete "${deleteModal.title}"? All associated questions and student data for this exam will be permanently purged.`}
        confirmText="Yes, Permanently Delete"
      />
    </div>
  );
};

export default Exams;
