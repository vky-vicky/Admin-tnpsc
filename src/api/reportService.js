import api from './axios';

export const reportService = {
  getReports: (params = {}) => api.get('/admin/reports', { params }),
  takeAction: (reportId, actionData) => api.post(`/admin/reports/${reportId}/action`, actionData),
  
  // To preview content, we might need these
  getPost: (postId) => api.get(`/community/poll/${postId}`), 
};
