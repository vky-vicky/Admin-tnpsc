import api from './axios';

export const reportService = {
  getReports: (params = {}) => api.get('/reports/admin/all', { params }),
  takeAction: (reportId, actionData) => api.post(`/reports/admin/${reportId}/action`, actionData),
  
  // To preview content, we might need these
  getPost: (postId) => api.get(`/community/poll/${postId}`), // The backend unified get might be needed or specific ones
  // Note: community_routes.py has /poll/{post_id} which returns poll details. 
  // For normal posts, we might need another one, but format_post_data is used in get_posts.
};
