import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';

import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const RealExams = () => {
  const [exams, setExams] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'create'
  const { toast } = useToast();

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
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
    fetchExams();
    fetchMaterials();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = exams.slice(indexOfFirstItem, indexOfLastItem);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await adminService.manageExams.listReal();
      setExams(Array.isArray(data) ? data : (data.data || data.exams || []));
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoading(false);
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
      // Validate materials
      const validMaterials = formData.materials.filter(m => m.material_id !== '');
      if (validMaterials.length === 0) {
        toast.error('Missing Information', 'Please add at least one study material source.');
        return;
      }

      const payload = {
        ...formData,
        materials: validMaterials.map(m => ({
          material_id: parseInt(m.material_id),
          num_questions: parseInt(m.num_questions)
        }))
      };

      await adminService.manageExams.createReal(payload);
      toast.success('Exam Published', 'The real exam attempt has been successfully created.');
      setView('list');
      fetchExams();
    } catch (err) {
      console.error("Create Exam Error (Full):", err);
      let errorMessage = 'Unknown error';
      
      if (err.response) {
          // Server responded with non-2xx code
          if (err.response.data) {
              const data = err.response.data;
              if (data.detail) {
                  const detail = data.detail;
                  if (Array.isArray(detail)) {
                       errorMessage = detail.map(d => {
                           if (typeof d === 'string') return d;
                           return `${d.msg || 'Error'} (in ${d.loc ? d.loc.join(' -> ') : 'field'})`;
                       }).join('\n');
                  } else if (typeof detail === 'object') {
                      errorMessage = JSON.stringify(detail, null, 2);
                  } else {
                      errorMessage = String(detail);
                  }
              } else {
                  // Fallback if no 'detail' field but other data
                   errorMessage = JSON.stringify(data, null, 2);
              }
          } else {
              errorMessage = `Status ${err.response.status}: ${err.response.statusText}`;
          }
      } else if (err.message) {
          // Request setup error or network error
          errorMessage = typeof err.message === 'object' ? JSON.stringify(err.message) : String(err.message);
      } else {
          // Fallback
          errorMessage = JSON.stringify(err);
      }
      
      toast.error('Publishing Failed', errorMessage);
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
      toast.error('Delete Failed', 'The server could not process the deletion request.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // ... (keep addMaterialField, updateMaterialField, removeMaterialField)
  const addMaterialField = () => {
    setFormData({
      ...formData,
      materials: [...formData.materials, { material_id: '', num_questions: 1 }]
    });
  };

  const updateMaterialField = (index, field, value) => {
    const updated = [...formData.materials];
    updated[index][field] = value;
    setFormData({ ...formData, materials: updated });
  };

  const removeMaterialField = (index) => {
    const updated = formData.materials.filter((_, i) => i !== index);
    setFormData({ ...formData, materials: updated });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Real Exams</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage core exam attempts and question sets</p>
        </div>
        <button 
          onClick={() => setView(view === 'list' ? 'create' : 'list')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
        >
          {view === 'list' ? '+ Create Real Exam' : 'Back to List'}
        </button>
      </div>

      {view === 'create' ? (
        // ... (Create form JSX remains same)
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
           {/* Re-using existing form structure but ensuring it's wrapped correctly */}
           <form onSubmit={handleCreate} className="space-y-6">
             {/* ... form fields inputs ... */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Exam Name</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.exam_name}
                  onChange={(e) => setFormData({...formData, exam_name: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea 
                  required
                  rows="3"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter exam instructions or details..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Language</label>
                <select 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                >
                  <option value="tamil">Tamil</option>
                  <option value="english">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration (Minutes)</label>
                <input 
                  type="number" required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Questions Source (Materials)</h3>
                <button 
                  type="button" onClick={addMaterialField}
                  className="text-blue-500 hover:text-blue-400 text-sm font-bold"
                >
                  + Add Material
                </button>
              </div>
              
              {formData.materials.map((m, index) => (
                <div key={index} className="flex gap-4 mb-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Select Material</label>
                    <select 
                      required
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={m.material_id}
                      onChange={(e) => updateMaterialField(index, 'material_id', e.target.value)}
                    >
                      <option value="">Select a study material...</option>
                      {materials.map(mat => (
                        <option key={mat.id} value={mat.id}>{mat.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-500 mb-1">No. Qns</label>
                    <input 
                      type="number" required
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={m.num_questions}
                      onChange={(e) => updateMaterialField(index, 'num_questions', e.target.value)}
                    />
                  </div>
                  {formData.materials.length > 1 && (
                    <button 
                      type="button" onClick={() => removeMaterialField(index)}
                      className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="px-10 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20">
                Publish Real Exam
              </button>
            </div>
           </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Exam Name</th>
                <th className="px-6 py-4">Category / Subject</th>
                <th className="px-6 py-4 text-center">Duration</th>
                <th className="px-6 py-4 text-center">Lang</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12">Loading exams...</td></tr>
              ) : currentExams.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-400">No real exams found</td></tr>
              ) : currentExams.map(exam => (
                <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{exam.exam_name}</div>
                    <div className="text-xs text-slate-400 truncate max-w-xs">{exam.description || 'No description'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 dark:text-slate-300">{exam.category}</div>
                    <div className="text-xs text-slate-500">{exam.subject}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-sm">
                    {exam.duration_minutes ? (
                        <span>{exam.duration_minutes}m</span>
                    ) : (
                        <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="uppercase text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-white">
                        {exam.language || 'TAMIL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openDeleteModal(exam.id, exam.exam_name)} className="text-red-500 hover:text-red-700 p-2 opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {view === 'list' && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
               <Pagination 
                 totalItems={exams.length}
                 itemsPerPage={itemsPerPage}
                 currentPage={currentPage}
                 onPageChange={setCurrentPage}
               />
            </div>
          )}
        </div>
      )}

      {/* Professional Deletion Modal */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Real Exam"
        message={`Are you sure you want to delete "${deleteModal.title}"? All associated student attempts and question configurations will be lost.`}
        confirmText="Confirm Delete"
      />
    </div>
  );
};

export default RealExams;
