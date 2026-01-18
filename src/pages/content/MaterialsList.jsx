import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const MaterialsList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: '',
    type: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const study = await adminService.materials.listStudy();
        const resource = await adminService.materials.listResource();
        
        // Combine or handle separately. For now, let's combine with tags
        const combined = [
          ...(Array.isArray(study) ? study : []).map(m => ({ ...m, type: 'Study' })),
          ...(Array.isArray(resource) ? resource : []).map(m => ({ ...m, type: 'Resource' }))
        ];
        
        setMaterials(combined);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch materials", error);
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const openDeleteModal = (id, title, type) => {
    setDeleteModal({
      isOpen: true,
      id,
      title,
      type
    });
  };

  const handleConfirmDelete = async () => {
    const { id, title, type } = deleteModal;
    setDeleteLoading(true);
    try {
      if(type === 'Study') await adminService.materials.deleteStudy(id);
      else await adminService.materials.deleteResource(id);
      
      setMaterials(materials.filter(m => m.id !== id));
      toast.success('Material Deleted', `${title} has been permanently removed.`);
      setDeleteModal({ isOpen: false, id: null, title: '', type: '' });
    } catch (err) {
      toast.error('Delete Failed', 'The server could not process the deletion request.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Study & Resource Materials</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan="3" className="text-center py-8">Loading...</td></tr>
            ) : materials.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-8">No materials found</td></tr>
            ) : materials.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.type === 'Study' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {item.category || item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openDeleteModal(item.id, item.title, item.type)} className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px] tracking-widest transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Material"
        message={`Are you sure you want to delete "${deleteModal.title}"? This will permanently remove the ${deleteModal.type?.toLowerCase()} material.`}
        confirmText="Confirm Delete"
      />
    </div>
  );
};

export default MaterialsList;
