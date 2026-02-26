import api from "./axios";

export const adminService = {
  // Authentication
  login: (email, password) => api.post("/admin/login", { email, password }),
  register: (userData) => api.post("/admin/register", userData),

  // User Management
  getUsers: (params = {}) => api.get("/admin/users/", { params }),
  getUserDetail: (userId) => api.get(`/admin/users/${userId}`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  banUser: (userId, reason) =>
    api.post(`/admin/users/${userId}/ban`, { reason }),
  unbanUser: (userId) => api.post(`/admin/users/${userId}/unban`),

  // Legacy/Other
  getUserProfile: (userId) => api.get(`/profile/user/profile/${userId}`),
  updateProfile: (data) => api.post("/profile/user/updateProfile", data),

  // Notifications & Admin Broadcast
  broadcastMessage: (data) =>
    api.post("/notifications/broadcast", null, {
      params: {
        title: data.title,
        body: data.message, // Map 'message' from UI to 'body' expected by API
        exam_type: data.target === "all" ? null : data.target,
      },
    }),
  getNotifications: () => api.get("/notifications/"), // Fetch app notifications
  markNotificationRead: (id) => api.post(`/notifications/read/${id}`),
  deleteNotificationRead: (id) => api.delete(`/notifications/read/${id}`),

  manageExams: {
    // Official Notifications/Exams
    listUpcoming: () => api.get("/admin/notifications/upcoming-exams"),
    createNotification: (data) => api.post("/notifications/exams/", data),
    updateNotification: (id, data) =>
      api.put(`/notifications/exams/${id}`, data),
    deleteNotification: (id) => api.delete(`/notifications/exams/${id}`),

    // Real Exams Management
    listReal: (type) => api.get("/exams/", { params: { exam_type: type } }),
    createReal: (data) => api.post("/exam/real-exam", data),
    deleteReal: (id) => api.delete(`/exam/real-exam/${id}`),
    getRealDetails: (id) => api.get(`/exams/${id}`),

    // NEW CRUD ENDPOINTS
    createExam: (data) => api.post("/admin/exams", data),
    deleteExam: (id) => api.delete(`/admin/exams/${id}`),

    // Admin Review Flow
    listPending: () => api.get("/admin/exams/pending"),
    getExamDetailWithQuestions: (id) => api.get(`/admin/exams/${id}`),
    updateExam: (id, data) => api.patch(`/admin/exams/${id}`, data),
    publishExam: (id) => api.post(`/admin/exams/${id}/publish`),

    // Question Management
    addQuestion: (examId, data) => api.post(`/admin/exams/${examId}/questions`, data),
    updateQuestion: (id, data) => api.patch(`/admin/questions/${id}`, data),
    deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
    getQuestionReports: (status) =>
      api.get("/questions/reports", { params: { status } }),
    actionQuestionReport: (id, action) =>
      api.post(`/questions/reports/${id}/action`, { action }),

    // Exam Flow & Instructions (New from snippet)
    getInstructions: (examId) => api.get(`/exam/${examId}/instructions`),

    // Performance Analysis
    getPerformanceAnalysis: (userId, params = {}) =>
      api.get(`/exam/performance-analysis/${userId}`, { params }),
    getSubjectAccuracy: (userId, params = {}) =>
      api.get(`/exam/subject-accuracy/${userId}`, { params }),
  },

  // Content Management
  materials: {
    // Study Materials
    listStudy: () => api.get("/study-materials/"),
    createStudy: (formData) =>
      api.post("/study-materials/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    searchStudy: (query) =>
      api.get("/study-materials/search", { params: { query } }),
    getGroupedStudy: () => api.get("/study-materials/grouped"),
    getByCategory: (category) =>
      api.get(`/study-materials/category/${category}`),
    getStudyDetails: (id) => api.get(`/study-materials/${id}`),
    deleteStudy: (id) => api.delete(`/study-materials/${id}`),
    downloadStudy: async (id) => {
      try {
        const response = await api.get(`/study-materials/${id}/download`, {
          responseType: "blob",
        });

        // With the axios interceptor fix, 'response' is now the full Axios response object
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers["content-disposition"];
        let fileName = "study-material.pdf";

        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (fileNameMatch && fileNameMatch.length === 2)
            fileName = fileNameMatch[1];
          else {
            // Alternative check for filename*=UTF-8''filename.pdf
            const fileNameMatchStar = contentDisposition.match(
              /filename\*=UTF-8''(.+)/,
            );
            if (fileNameMatchStar && fileNameMatchStar.length === 2)
              fileName = decodeURIComponent(fileNameMatchStar[1]);
          }
        }

        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
          link.remove();
          window.URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error("Download failed", error);
        alert(
          "Failed to download file. It might be missing on the server or your session might have expired.",
        );
      }
    },

    // Resource Materials
    listResource: () => api.get("/resource-materials/"),
    createResource: (formData) =>
      api.post("/resource-materials/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    deleteResource: (id) => api.delete(`/resource-materials/${id}`),
    getResourceByCategory: (category) =>
      api.get(`/resource-materials/category/${category}`),
    downloadResource: async (id) => {
      try {
        const response = await api.get(`/resource-materials/${id}/download`, {
          responseType: "blob",
        });

        // Create download link from blob
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers["content-disposition"];
        let fileName = "resource-material.pdf";

        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (fileNameMatch && fileNameMatch.length === 2)
            fileName = fileNameMatch[1];
          else {
            // Alternative check for filename*=UTF-8''filename.pdf
            const fileNameMatchStar = contentDisposition.match(
              /filename\*=UTF-8''(.+)/,
            );
            if (fileNameMatchStar && fileNameMatchStar.length === 2)
              fileName = decodeURIComponent(fileNameMatchStar[1]);
          }
        }

        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
          link.remove();
          window.URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error("Download failed", error);
        throw error;
      }
    },
    triggerExamFlow: (id) =>
      api.post(`/resource-materials/${id}/trigger-exam-flow`),
  },

  // Gamification & Stats
  getStats: () => api.get("/gamification/stats"),
  getLeaderboard: () => api.get("/gamification/leaderboard"),
  getDailyLeaderboard: () => api.get("/leaderboard/daily"),
  getWeeklyLeaderboard: () => api.get("/leaderboard/weekly"),
  awardXP: (data) => api.post("/gamification/award-xp", data),

  // Activity Logs
  getRecentActivity: (limit = 10) =>
    api.get("/admin/recent-activity", { params: { limit } }),

  // Error Logs
  getErrorLogs: (params = {}) =>
    api.get("/admin/reports/error-logs", { params }),

  // Moderation / Reports
  getReports: (params = {}) => api.get("/admin/reports", { params }),
};
