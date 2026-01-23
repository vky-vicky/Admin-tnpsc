import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';

import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';

const ResourceMaterials = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'create'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    file: null
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMaterials = materials.slice(indexOfFirstItem, indexOfLastItem);

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
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('file', formData.file);

    try {
      if (formData.category) {
        await adminService.materials.createResourceInCategory(formData.category, data);
      } else {
        await adminService.materials.createResource(data);
      }
      toast.success('Resource Uploaded', 'The material is now available for download in the general category.');
      setFormData({ title: '', category: '', file: null });
      setView('list');
      fetchMaterials();
    } catch (err) {
      toast.error('Upload Failed', 'There was an issue processing your resource file.');
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">File Attachment</label>
              <input type="file" required className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg cursor-pointer" onChange={(e) => setFormData({...formData, file: e.target.files[0]})} />
            </div>
            <button type="submit" className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg shadow-lg hover:bg-orange-500 transition-all">Upload Resource</button>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Resource Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Uploaded At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-12">Loading resources...</td></tr>
              ) : currentMaterials.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-12 text-slate-400">No resources found</td></tr>
              ) : (
                currentMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{m.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{m.category || 'General'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(m.uploaded_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => adminService.materials.downloadResource(m.id)} className="text-blue-500 hover:text-blue-700 p-2 mr-2" title="Download">
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
                 totalItems={materials.length}
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
