import api from './axios';

export const analyticsService = {
  getDashboardStats: () => api.get('/admin/reports/dashboard'),
  getSubjectProficiency: () => api.get('/admin/reports/subject-proficiency'),
  getToughnessAnalytics: () => api.get('/admin/reports/toughness-analytics'),
  getUserPerformance: (limit = 50) => api.get('/admin/reports/user-performance', { params: { limit } }),
  getEngagementStats: () => api.get('/admin/reports/engagement-stats'),
};
