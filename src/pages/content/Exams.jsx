import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import Pagination from '../../components/Pagination';
import BaseModal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

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

const Exams = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get('type') || 'REAL_EXAM').toUpperCase().includes('REAL') ? 'REAL_EXAM' : 'MOCK_EXAM';
  
  const [examType, setExamType] = useState(initialType);
  const [exams, setExams] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState(null); // For instruction preview
  
  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Form State
  const [formData, setFormData] = useState({
    exam_name: '',
    description: '',
    duration_minutes: 180,
    language: 'tamil',
    category: 'General',
    subject: '',
    materials: [{ material_id: '', num_questions: 1 }]
  });

  useEffect(() => {
    setSearchParams({ type: examType.toLowerCase() });
    fetchExams();
    fetchMaterials();
  }, [examType]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      // Use the exact string MOCK_EXAM or REAL_EXAM
      const data = await adminService.manageExams.listReal(examType);
      
      // The user snippet shows data is inside a 'data' property
      const examsList = Array.isArray(data) ? data : (data.data || data.exams || []);
      
      // Filter the list to ensure we only show the selected type
      const filteredResult = examsList.filter(e => e.exam_type === examType);
      
      setExams(filteredResult);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const fetchMaterials = async () => {
    try {
      const data = await adminService.materials.listStudy();
      setMaterials(Array.isArray(data) ? data : (data.data || data.materials || []));
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const validMaterials = formData.materials.filter(m => m.material_id !== '');
      if (validMaterials.length === 0) {
        toast.error('Material Required', 'Please select at least one study material source for this exam.');
        return;
      }

      const payload = {
        ...formData,
        exam_type: examType, // Sending MOCK_EXAM or REAL_EXAM
        materials: validMaterials.map(m => ({
          material_id: parseInt(m.material_id),
          num_questions: parseInt(m.num_questions)
        }))
      };

      await adminService.manageExams.createReal(payload);
      toast.success(`${examType.replace('_', ' ')} Created`, 'The exam has been successfully configured and listed.');
      setView('list');
      fetchExams();
    } catch (err) {
      console.error("Create Exam Error:", err);
      toast.error('Configuration Error', 'There was an issue generating the exam questions. Please verify your material selection.');
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

  const filteredExams = exams.filter(e => 
    e.exam_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  const accentColor = examType === 'MOCK_EXAM' ? 'cyan' : 'orange';
  const accentGradients = {
    cyan: 'from-cyan-500 to-blue-600 shadow-cyan-500/20',
    orange: 'from-orange-500 to-red-600 shadow-orange-500/20'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in min-h-screen">
      
      {/* Modal Overlay for Instructions */}
      {selectedExam && (
          <InstructionModal 
            exam={selectedExam} 
            onClose={() => setSelectedExam(null)} 
          />
      )}

      {/* Premium Header & Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Exams <span className="text-gradient">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Curate and deploy {examType.toLowerCase().replace('_', ' ')}s with enterprise control.
          </p>
        </div>

        <div className="flex items-center gap-4">
            {/* Exam Type Toggle */}
            <div className="bg-slate-200 dark:bg-slate-900 p-1 rounded-2xl flex relative h-12 w-64 border border-slate-300 dark:border-slate-800 shadow-inner">
                <div 
                    className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out shadow-lg ${
                        examType === 'MOCK_EXAM' 
                        ? 'translate-x-0 bg-gradient-to-r from-cyan-500 to-blue-600' 
                        : 'translate-x-full bg-gradient-to-r from-orange-500 to-red-600'
                    }`}
                />
                <button 
                    onClick={() => setExamType('MOCK_EXAM')}
                    className={`flex-1 z-10 font-bold text-sm transition-colors duration-300 ${examType === 'MOCK_EXAM' ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    MOCK EXAM
                </button>
                <button 
                    onClick={() => setExamType('REAL_EXAM')}
                    className={`flex-1 z-10 font-bold text-sm transition-colors duration-300 ${examType === 'REAL_EXAM' ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    REAL EXAM
                </button>
            </div>

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
                        Create {examType.split('_')[0]}
                    </>
                ) : 'Back to Hub'}
            </button>
        </div>
      </div>

      {view === 'list' && (
        <div className="space-y-6">
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
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">No {examType.toLowerCase()}s found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search or create a new exam for this category.</p>
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
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase text-white bg-gradient-to-r ${accentGradients[accentColor]}`}>
                                    {examType}
                                </span>
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
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Status: Active</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedExam(exam)}
                                    className="text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1"
                                >
                                    Manage
                                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                </button>
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
                    <h2 className="text-2xl font-black text-white">Create New {examType}</h2>
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
                            <input 
                                type="text" required
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            />
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
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Question Sources</h3>
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, materials: [...formData.materials, { material_id: '', num_questions: 1 }]})}
                                className="text-blue-500 hover:text-blue-400 font-black text-sm uppercase tracking-widest flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                Add Material
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {formData.materials.map((m, idx) => (
                                <div key={idx} className="flex gap-4 items-end animate-fade-in">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Select Source Study Material</label>
                                        <select 
                                            required
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm"
                                            value={m.material_id}
                                            onChange={(e) => {
                                                const updated = [...formData.materials];
                                                updated[idx].material_id = e.target.value;
                                                setFormData({...formData, materials: updated});
                                            }}
                                        >
                                            <option value="">Select a study material...</option>
                                            {materials.map(mat => (
                                                <option key={mat.id} value={mat.id}>{mat.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Questions</label>
                                        <input 
                                            type="number" required
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button 
                            type="button" onClick={() => setView('list')}
                            className="px-8 py-3 text-slate-500 font-black tracking-widest uppercase hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={`px-12 py-4 rounded-2xl font-black text-white tracking-widest uppercase shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 bg-gradient-to-r ${accentGradients[accentColor]}`}
                        >
                            Deploy {examType}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
