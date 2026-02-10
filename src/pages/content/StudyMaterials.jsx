import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';

import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';

const StudyMaterials = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search');

  const [materials, setMaterials] = useState([]);
  const [groupedMaterials, setGroupedMaterials] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'create', 'grouped'
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    language: 'english',
    category: '',
    subject: '',
    exam_type: 'TNPSC',
    uploaded_by: 1, 
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
    if (searchParam) {
      handleSearch(null, searchParam);
    } else {
      fetchData();
    }
  }, [view, searchParam]);

  // Filter and Pagination (Only for list view)
  const filteredMaterials = Array.isArray(materials) ? materials.filter(m => 
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMaterials = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'grouped') {
        const data = await adminService.materials.getGroupedStudy();
        const normalizedData = data.data || data || {};
        setGroupedMaterials(normalizedData);
      } else {
        const data = await adminService.materials.listStudy();
        setMaterials(Array.isArray(data) ? data : (data.data || data.materials || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e, forcedQuery) => {
    if (e) e.preventDefault();
    const q = forcedQuery || searchQuery;
    if (!q) return fetchData();
    
    setLoading(true);
    try {
      const data = await adminService.materials.searchStudy(q);
      setMaterials(Array.isArray(data) ? data : (data.data || data.materials || []));
      setCurrentPage(1); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('language', formData.language);
    data.append('category', formData.category);
    data.append('subject', formData.subject);
    data.append('exam_type', formData.exam_type);
    data.append('uploaded_by', formData.uploaded_by);
    data.append('file', formData.file);

    try {
      await adminService.materials.createStudy(data);
      toast.success('Study material uploaded successfully!', 'General students will now be able to view this asset.');
      setView('list');
      setFormData({
        title: '',
        language: 'english',
        category: '',
        subject: '',
        exam_type: 'TNPSC',
        uploaded_by: 1,
        file: null
      });
      fetchData(); 
    } catch (err) {
      toast.error('Upload failed', 'There was an error pushing the file to the cloud. Please try again.');
    }
  };

  const handleDownload = async (id, title) => {
    toast.info('Downloading File', `Starting download for ${title}...`);
    try {
      await adminService.materials.downloadStudy(id);
      toast.success('Download Successful', `${title} has been saved to your device.`);
    } catch (err) {
      toast.error('Download Failed', 'Could not retrieve the file from the server.');
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
      await adminService.materials.deleteStudy(id);
      if (view === 'grouped') {
         fetchData(); // Refresh grouped
      } else {
         setMaterials(materials.filter(m => m.id !== id));
      }
      toast.success('Material Deleted', `${title} has been permanently removed.`);
      setDeleteModal({ isOpen: false, id: null, title: '' });
    } catch (err) {
      toast.error('Delete Failed', 'The server could not process the deletion request.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Study <span className="text-gradient">Materials</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage, search and distribute educational content</p>
        </div>
        
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <button 
            onClick={() => setView('list')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white dark:bg-slate-800 shadow-lg text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            All Items
          </button>
          <button 
            onClick={() => setView('grouped')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'grouped' ? 'bg-white dark:bg-slate-800 shadow-lg text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Categories
          </button>
          <button 
            onClick={() => setView('create')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'create' ? 'bg-white dark:bg-slate-800 shadow-lg text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Upload
          </button>
        </div>
      </div>

      {view !== 'create' && view !== 'grouped' && (
        <form onSubmit={handleSearch} className="relative max-w-xl animate-slide-up">
          <input 
            type="text" 
            placeholder="Search by title or subject..."
            className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200 font-medium shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="w-6 h-6 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      )}

      {view === 'create' ? (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Upload New Material</h2>
            <p className="text-slate-500 text-sm font-medium">Add study materials for TNPSC preparation</p>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Resource Title</label>
              <input 
                type="text" required
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="e.g. 10th Standard History - Ancient India"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
             <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Display Language</label>
              <select 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
              >
                <option value="english">English</option>
                <option value="tamil">Tamil</option>
              </select>
            </div>

             <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Broad Category</label>
              <input 
                type="text" required
                placeholder="e.g. History"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Subject / Topic</label>
              <input 
                type="text" required
                placeholder="e.g. Ancient India - Part 1"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Target Exam Type</label>
              <select 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none"
                value={formData.exam_type}
                onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
              >
                <option value="TNPSC">TNPSC General</option>
                <option value="TNPSC_GROUP_4">TNPSC Group 4</option>
                <option value="TNPSC_GROUP_2">TNPSC Group 2</option>
                <option value="TET">TET</option>
                <option value="POLICE">Police Exam</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Source File (PDF Preferred)</label>
              <input 
                type="file" required
                onChange={handleFileChange}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => setView('list')} className="px-8 py-3 text-slate-500 font-black uppercase text-xs tracking-widest">Cancel</button>
              <button type="submit" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:opacity-90 transform active:scale-95 transition-all">Upload Material</button>
            </div>
          </form>
        </div>
      ) : view === 'grouped' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
           {loading ? (
             [...Array(6)].map((_, i) => (
               <div key={i} className="bg-slate-100 dark:bg-slate-900/50 h-64 rounded-3xl animate-pulse"></div>
             ))
           ) : Object.keys(groupedMaterials).length === 0 ? (
             <div className="col-span-full py-20 text-center">
                <p className="text-slate-500 font-bold">No categorized materials available.</p>
             </div>
           ) : (
             Object.entries(groupedMaterials).map(([category, items], idx) => (
                <div key={category} className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                        </div>
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-slate-500">
                           {items.length} Files
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-blue-500 transition-colors uppercase tracking-tight">{category}</h3>
                    <p className="text-slate-500 text-sm mb-6 font-medium">Comprehensive reading materials for {category.toLowerCase()} topics.</p>
                    
                    <div className="space-y-3">
                        {items.slice(0, 3).map(item => (
                            <div key={item.id} className="flex items-center justify-between group/item">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{item.title}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleDownload(item.id, item.title)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-all" title="Download">
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                    </button>
                                    <button onClick={() => openDeleteModal(item.id, item.title)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all" title="Delete">
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {items.length > 3 && (
                            <p className="text-xs font-black text-blue-500 pt-2 uppercase tracking-widest">+ {items.length - 3} more files</p>
                        )}
                    </div>
                </div>
             ))
           )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Material Info</th>
                <th className="px-8 py-5">Exam Type</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Language</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-20 text-slate-400 animate-pulse font-bold">Fetching educational assets...</td></tr>
              ) : currentMaterials.length === 0 ? (
                <tr>
                   <td colSpan="4" className="text-center py-20">
                      <p className="text-slate-500 font-bold mb-4">No assets found matching your criteria.</p>
                      <button onClick={fetchData} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl">Refresh List</button>
                   </td>
                </tr>
              ) : (
                currentMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{m.title}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{m.subject || 'Uncategorized Subject'}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {m.exam_type?.replace('_', ' ') || 'TNPSC'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {m.category || 'General'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="capitalize text-slate-600 dark:text-slate-400 text-xs font-bold tracking-tighter">{m.language || 'English'}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleDownload(m.id, m.title)} className="p-3 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-xl transition-all" title="Download">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                         <button onClick={() => openDeleteModal(m.id, m.title)} className="p-3 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 rounded-xl transition-all" title="Delete">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Total: {filteredMaterials.length} Files</p>
              <Pagination 
                totalItems={filteredMaterials.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
          </div>
        </div>
      )}

      {/* Professional Deletion Modal */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteModal.title}"? This educational resource will be removed from all student platforms.`}
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default StudyMaterials;
