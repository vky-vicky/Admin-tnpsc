import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';
import { useGlobalExam } from '../../context/GlobalExamContext';

import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';

const ResourceMaterials = () => {
  const { toast } = useToast();
  const { activeExamType, allExamTypes } = useGlobalExam();
  
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'create'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    exam_type: activeExamType === 'ALL' ? (allExamTypes?.[0]?.slug || 'TNPSC') : activeExamType,
    uploaded_by: 1,
    file: null,
    toughness_level: 'medium' // mapping 'Normal' to 'medium'
  });

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeExamType]);

  const filteredMaterials = Array.isArray(materials) ? materials.filter(m => {
    const matchesSearch = m.title?.toLowerCase().includes(searchQuery?.toLowerCase() || '') || 
                          m.category?.toLowerCase().includes(searchQuery?.toLowerCase() || '');
    const matchesExam = activeExamType === 'ALL' || 
                        m.exam_type?.toLowerCase() === activeExamType?.toLowerCase() ||
                        !m.exam_type;
    return matchesSearch && matchesExam;
  }) : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMaterials = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await adminService.materials.listResource();
      setMaterials(Array.isArray(data) ? data : (data.data || data.materials || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('exam_type', formData.exam_type);
    data.append('uploaded_by', formData.uploaded_by);
    data.append('file', formData.file);
    data.append('toughness_level', formData.toughness_level);

    try {
      await adminService.materials.createResource(data);
      toast.success('Resource Uploaded', 'The material is now available for download in the general category.');
      setFormData({ title: '', category: '', exam_type: activeExamType === 'ALL' ? 'TNPSC' : activeExamType, uploaded_by: 1, file: null, toughness_level: 'medium' });
      setView('list');
      fetchMaterials();
    } catch (err) {
      toast.error('Upload Failed', 'There was an issue processing your resource file.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDownload = async (id, title) => {
    toast.info('Downloading Resource', `Starting download for ${title}...`);
    try {
      await adminService.materials.downloadResource(id);
      toast.success('Download Successful', `${title} has been saved to your device.`);
    } catch (err) {
      toast.error('Download Failed', 'Could not retrieve the file from the server.');
    }
  };

  const handleTriggerExamFlow = async (id, title) => {
    toast.info('Starting AI Flow', `Processing ${title} for exam questions...`);
    try {
      await adminService.materials.triggerExamFlow(id);
      toast.success('AI Flow Triggered', 'Question extraction started! Check "Exams Review" in a few minutes.');
    } catch (err) {
      toast.error('Trigger Failed', 'Could not start AI processing for this resource.');
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
      await adminService.materials.deleteResource(id);
      setMaterials(materials.filter(m => m.id !== id));
      toast.success('Resource Deleted', `${title} has been permanently removed.`);
      setDeleteModal({ isOpen: false, id: null, title: '' });
    } catch (err) {
      toast.error('Delete Failed', 'The server could not process the deletion request.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Resource Materials</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage general resources, PDFs and links</p>
        </div>
        <button onClick={() => setView(view === 'list' ? 'create' : 'list')} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all">
          {view === 'list' ? '+ Add Resource' : 'View All'}
        </button>
      </div>

      {view === 'create' ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-lg">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input type="text" required className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category (Optional)</label>
              <input type="text" className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Syllabus, Previous Year" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Exam Type</label>
              <select 
                className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                value={formData.exam_type}
                onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
              >
                {allExamTypes?.map(t => (
                  <option key={t.slug} value={t.slug}>{t.name}</option>
                )) || <option disabled>Loading Exam Types...</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Toughness Level</label>
              <select 
                className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                value={formData.toughness_level}
                onChange={(e) => setFormData({...formData, toughness_level: e.target.value})}
              >
                <option value="medium">Normal</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">File Attachment</label>
              <input type="file" required className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg cursor-pointer" onChange={(e) => setFormData({...formData, file: e.target.files[0]})} />
            </div>
            <button 
              type="submit" 
              disabled={uploading}
              className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg shadow-lg hover:bg-orange-500 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {uploading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search resources by title or category..." 
                className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 dark:text-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm font-medium text-slate-500">
              Showing {currentMaterials.length} of {filteredMaterials.length} results
            </div>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Resource Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Uploaded At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12">Loading resources...</td></tr>
              ) : currentMaterials.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-400">No resources found</td></tr>
              ) : (
                currentMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">#{m.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{m.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{m.category || 'General'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(m.uploaded_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {/* 
                      <button 
                        onClick={() => handleTriggerExamFlow(m.id, m.title)} 
                        className="text-amber-500 hover:text-amber-700 p-2 mr-2" 
                        title="Generate Exam (AI)"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </button>
                      */}
                      <button onClick={() => handleDownload(m.id, m.title)} className="text-blue-500 hover:text-blue-700 p-2 mr-2" title="Download">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                      <button onClick={() => openDeleteModal(m.id, m.title)} className="text-red-500 hover:text-red-700 p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {view === 'list' && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
               <Pagination 
                 totalItems={filteredMaterials.length}
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
        title="Delete Resource"
        message={`Are you sure you want to delete "${deleteModal.title}"? This general resource will be removed from the public repository.`}
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default ResourceMaterials;
