import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';

const MaterialsList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id, type) => {
    if(window.confirm('Delete this material?')) {
      try {
        if(type === 'Study') await adminService.materials.deleteStudy(id);
        else await adminService.materials.deleteResource(id);
        setMaterials(materials.filter(m => m.id !== id));
      } catch (err) {
        alert('Failed to delete');
      }
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
                  <button onClick={() => handleDelete(item.id, item.type)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialsList;
