// services/api.js
import axios from 'axios';

// Base URL configuration
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create a reusable axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ===== Storage & Helper Functions =====

const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('❌ Error accessing localStorage:', error);
    return null;
  }
};

const setToken = (token) => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('❌ Error setting token in localStorage:', error);
  }
};

const removeToken = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingUser');
  } catch (error) {
    console.error('❌ Error removing token from localStorage:', error);
  }
};

// Get current user from localStorage
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    console.error('❌ Error getting user from localStorage:', error);
    return {};
  }
};

// Get pending user from localStorage (for institute approval flow)
const getPendingUser = () => {
  try {
    return JSON.parse(localStorage.getItem('pendingUser') || '{}');
  } catch (error) {
    console.error('❌ Error getting pending user from localStorage:', error);
    return {};
  }
};

// Update user in localStorage
const updateLocalUser = (updatedData) => {
  try {
    const currentUser = getCurrentUser();
    const updatedUser = { ...currentUser, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('❌ Error updating user in localStorage:', error);
    return null;
  }
};

// Auth header generator
const authHeaders = () => ({
  headers: { 
    Authorization: `Bearer ${getToken()}`,
  },
});

// File upload headers
const fileUploadHeaders = () => ({
  headers: { 
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'multipart/form-data',
  },
});

// ===== Request Interceptor =====
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [${response.status}] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    
    console.error('❌ API Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          removeToken();
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?session=expired';
          }
          break;
        case 403:
          console.warn('⚠️ Access forbidden:', originalRequest.url);
          // Handle institute approval status
          if (data?.status === 'pending') {
            // Store pending user data and redirect
            const user = getCurrentUser();
            localStorage.setItem('pendingUser', JSON.stringify(user));
            removeToken();
            window.location.href = '/pending-approval';
          }
          break;
        case 404:
          console.warn('🔍 Resource not found:', originalRequest.url);
          // Don't throw error for profile endpoints - use local fallback
          if (originalRequest.url.includes('/users/profile')) {
            console.log('🔄 Using local fallback for profile endpoint');
            return Promise.resolve({ data: getCurrentUser() });
          }
          break;
        case 409:
          console.warn('🚫 Resource conflict:', data.message);
          break;
        case 422:
          console.warn('📝 Validation error:', data.errors);
          break;
        case 429:
          console.warn('🚦 Rate limit exceeded');
          break;
        case 500:
          console.error('🔥 Server error occurred');
          break;
        default:
          console.error(`❌ HTTP ${status}:`, data.message);
      }
    } else if (error.request) {
      console.error('🌐 Network Error: Could not connect to server');
      // Use local fallback for network errors on profile endpoints
      if (originalRequest?.url?.includes('/users/profile')) {
        console.log('🔄 Using local fallback due to network error');
        return Promise.resolve({ data: getCurrentUser() });
      }
    } else {
      console.error('⚙️ Request Configuration Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ===== API Groups =====

// Auth APIs
const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout', {}, authHeaders()),
  refreshToken: () => api.post('/auth/refresh', {}, authHeaders()),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

// User APIs with fallback to localStorage
const userAPI = {
  getProfile: () => {
    return api.get('/users/profile', authHeaders())
      .then(response => response)
      .catch(error => {
        console.warn('⚠️ Using local fallback for getProfile');
        return { data: getCurrentUser() };
      });
  },
  
  updateProfile: (data) => {
    return api.put('/users/profile', data, authHeaders())
      .then(response => {
        // Update local storage with new data
        updateLocalUser(data);
        return response;
      })
      .catch(error => {
        console.warn('⚠️ Using local fallback for updateProfile');
        const updatedUser = updateLocalUser(data);
        return { data: { user: updatedUser, message: 'Profile updated locally' } };
      });
  },
  
  changePassword: (data) => api.put('/users/change-password', data, authHeaders()),
  deactivateAccount: () => api.put('/users/deactivate', {}, authHeaders()),
  deleteAccount: () => api.delete('/users/account', authHeaders()),
};

// Dashboard APIs
const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats', authHeaders()),
  getOverview: () => api.get('/dashboard', authHeaders()),
  getRecentActivity: () => api.get('/dashboard/activity', authHeaders()),
  getAnalytics: (period = 'monthly') => 
    api.get(`/dashboard/analytics?period=${period}`, authHeaders()),
  getInstituteStats: () => api.get('/dashboard/institute-stats', authHeaders()),
  getAdminStats: () => api.get('/dashboard/admin-stats', authHeaders()),
};

// Institute APIs
const instituteAPI = {
  // Public endpoints
  getAll: (params = {}) => api.get('/institutes', { params }),
  getById: (id) => api.get(`/institutes/${id}`),
  search: (query, filters = {}) => 
    api.get('/institutes/search', { params: { q: query, ...filters } }),
  getFeatured: () => api.get('/institutes/featured'),
  getByCategory: (category) => api.get(`/institutes/category/${category}`),
  
  // Protected endpoints
  create: (data) => api.post('/institutes', data, authHeaders()),
  update: (id, data) => api.put(`/institutes/${id}`, data, authHeaders()),
  delete: (id) => api.delete(`/institutes/${id}`, authHeaders()),
  getMyInstitutes: () => api.get('/institutes/my-institutes', authHeaders()),
  uploadImages: (id, formData) => 
    api.post(`/institutes/${id}/images`, formData, fileUploadHeaders()),
  removeImage: (id, imageId) => 
    api.delete(`/institutes/${id}/images/${imageId}`, authHeaders()),
  
  // Institute status management
  updateStatus: (id, status, reason = '') => 
    api.put(`/institutes/${id}/status`, { status, reason }, authHeaders()),
  getPendingInstitutes: () => api.get('/institutes/pending', authHeaders()),
  approveInstitute: (id) => api.put(`/institutes/${id}/approve`, {}, authHeaders()),
  rejectInstitute: (id, reason) => 
    api.put(`/institutes/${id}/reject`, { reason }, authHeaders()),
  
  // Institute analytics
  getInstituteAnalytics: (id) => api.get(`/institutes/${id}/analytics`, authHeaders()),
  trackView: (id) => api.post(`/institutes/${id}/track-view`),
};

// Course APIs
const courseAPI = {
  getAll: (params = {}) => api.get('/courses', { ...authHeaders(), params }),
  getById: (id) => api.get(`/courses/${id}`, authHeaders()),
  getByInstitute: (instituteId) => api.get(`/courses/institute/${instituteId}`),
  create: (data) => api.post('/courses', data, authHeaders()),
  update: (id, data) => api.put(`/courses/${id}`, data, authHeaders()),
  delete: (id) => api.delete(`/courses/${id}`, authHeaders()),
  bulkUpdate: (data) => api.put('/courses/bulk', data, authHeaders()),
};

// Enquiry APIs
const enquiryAPI = {
  getAll: (filters = {}) => 
    api.get('/enquiries', { ...authHeaders(), params: filters }),
  getById: (id) => api.get(`/enquiries/${id}`, authHeaders()),
  create: (data) => api.post('/enquiries', data, authHeaders()),
  reply: (id, data) => api.put(`/enquiries/${id}/reply`, data, authHeaders()),
  updateStatus: (id, status) => 
    api.put(`/enquiries/${id}/status`, { status }, authHeaders()),
  delete: (id) => api.delete(`/enquiries/${id}`, authHeaders()),
  getInstituteEnquiries: (instituteId) => 
    api.get(`/enquiries/institute/${instituteId}`, authHeaders()),
  markAsRead: (id) => api.put(`/enquiries/${id}/read`, {}, authHeaders()),
};

// Review APIs
const reviewAPI = {
  getAll: (filters = {}) => 
    api.get('/reviews', { ...authHeaders(), params: filters }),
  getById: (id) => api.get(`/reviews/${id}`, authHeaders()),
  getByInstitute: (instituteId) => api.get(`/reviews/institute/${instituteId}`),
  create: (data) => api.post('/reviews', data, authHeaders()),
  update: (id, data) => api.put(`/reviews/${id}`, data, authHeaders()),
  approve: (id) => api.put(`/reviews/${id}/approve`, {}, authHeaders()),
  reject: (id, reason) => api.put(`/reviews/${id}/reject`, { reason }, authHeaders()),
  delete: (id) => api.delete(`/reviews/${id}`, authHeaders()),
  flag: (id, reason = '') => 
    api.put(`/reviews/${id}/flag`, { flag: true, reason }, authHeaders()),
  unflag: (id) => 
    api.put(`/reviews/${id}/flag`, { flag: false }, authHeaders()),
  getMyReviews: () => api.get('/reviews/my-reviews', authHeaders()),
  report: (id, reason) => api.post(`/reviews/${id}/report`, { reason }, authHeaders()),
};

// Admin APIs
const adminAPI = {
  // User management
  getUsers: (filters = {}) => 
    api.get('/admin/users', { ...authHeaders(), params: filters }),
  getUserById: (id) => api.get(`/admin/users/${id}`, authHeaders()),
  updateUser: (id, data) => 
    api.put(`/admin/users/${id}`, data, authHeaders()),
  updateUserStatus: (id, status) => 
    api.put(`/admin/users/${id}/status`, { status }, authHeaders()),
  deleteUser: (id) => api.delete(`/admin/users/${id}`, authHeaders()),
  
  // Institute approval management
  getPendingApprovals: () => api.get('/admin/approvals/pending', authHeaders()),
  getApprovalStats: () => api.get('/admin/approvals/stats', authHeaders()),
  approveInstitute: (id, data = {}) => 
    api.post(`/admin/institutes/${id}/approve`, data, authHeaders()),
  rejectInstitute: (id, data) => 
    api.post(`/admin/institutes/${id}/reject`, data, authHeaders()),
  bulkApproveInstitutes: (ids) => 
    api.post('/admin/institutes/bulk-approve', { ids }, authHeaders()),
  
  // Platform management
  getPlatformStats: () => api.get('/admin/platform-stats', authHeaders()),
  getSystemAnalytics: () => api.get('/admin/analytics', authHeaders()),
  manageInstitute: (id, action) => 
    api.put(`/admin/institutes/${id}`, { action }, authHeaders()),
  getModerationQueue: () => api.get('/admin/moderation/queue', authHeaders()),
  
  // Settings
  updatePlatformSettings: (settings) => 
    api.put('/admin/settings', settings, authHeaders()),
  getPlatformSettings: () => api.get('/admin/settings', authHeaders()),
};

// Notification APIs
const notificationAPI = {
  getAll: (params = {}) => 
    api.get('/notifications', { ...authHeaders(), params }),
  getUnreadCount: () => api.get('/notifications/unread-count', authHeaders()),
  markAsRead: (id) => api.put(`/notifications/${id}/read`, {}, authHeaders()),
  markAllAsRead: () => api.put('/notifications/mark-all-read', {}, authHeaders()),
  delete: (id) => api.delete(`/notifications/${id}`, authHeaders()),
  getSettings: () => api.get('/notifications/settings', authHeaders()),
  updateSettings: (settings) => 
    api.put('/notifications/settings', settings, authHeaders()),
};

// File Upload APIs
const fileAPI = {
  upload: (formData, onProgress = null) => {
    const config = {
      ...fileUploadHeaders(),
      onUploadProgress: onProgress,
      timeout: 30000,
    };
    return api.post('/upload', formData, config);
  },
  delete: (fileId) => api.delete(`/upload/${fileId}`, authHeaders()),
  getUploads: () => api.get('/upload/my-uploads', authHeaders()),
  validateFile: (file, rules = {}) => 
    api.post('/upload/validate', { file, rules }, authHeaders()),
};

// Utility Functions
const apiUtils = {
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  },
  createCancelToken: () => axios.CancelToken.source(),
  isCancel: (error) => axios.isCancel(error),
  getCurrentUser: getCurrentUser,
  getPendingUser: getPendingUser,
  updateLocalUser: updateLocalUser,
  setPendingUser: (userData) => {
    try {
      localStorage.setItem('pendingUser', JSON.stringify(userData));
    } catch (error) {
      console.error('❌ Error setting pending user:', error);
    }
  },
  clearPendingUser: () => {
    try {
      localStorage.removeItem('pendingUser');
    } catch (error) {
      console.error('❌ Error clearing pending user:', error);
    }
  },
  // Institute status helpers
  isInstituteApproved: (user) => {
    return user?.role === 'institute' && user?.status === 'approved';
  },
  isInstitutePending: (user) => {
    return user?.role === 'institute' && user?.status === 'pending';
  },
  isInstituteRejected: (user) => {
    return user?.role === 'institute' && user?.status === 'rejected';
  },
};

// ===== Mock Data for Development =====

// Mock responses for development when API is not available
const mockAPI = {
  getPendingInstitutes: () => {
    return Promise.resolve({
      data: {
        success: true,
        institutes: [
          {
            _id: '1',
            name: 'Global Education Institute',
            email: 'contact@globaledu.com',
            phone: '+1-555-0101',
            address: {
              street: '123 Education Street',
              city: 'New York',
              state: 'NY',
              country: 'USA',
              zipCode: '10001'
            },
            description: 'A premier educational institution offering various courses.',
            documents: {
              registration: 'verified',
              accreditation: 'pending',
              license: 'verified'
            },
            submittedAt: new Date().toISOString(),
            status: 'pending',
            contactPerson: {
              name: 'Dr. Sarah Johnson',
              position: 'Director',
              email: 'sarah@globaledu.com',
              phone: '+1-555-0102'
            },
            facilities: ['Library', 'Computer Lab', 'Sports Complex'],
            courses: ['Computer Science', 'Business Administration']
          }
        ]
      }
    });
  },
  
  approveInstitute: (id) => {
    return Promise.resolve({
      data: {
        success: true,
        message: 'Institute approved successfully',
        institute: {
          _id: id,
          status: 'approved',
          approvedAt: new Date().toISOString()
        }
      }
    });
  },
  
  rejectInstitute: (id, data) => {
    return Promise.resolve({
      data: {
        success: true,
        message: 'Institute rejected successfully',
        institute: {
          _id: id,
          status: 'rejected',
          rejectionReason: data.reason
        }
      }
    });
  }
};

// ===== EXPORTS =====

// Export everything
export {
  api as default,
  getToken,
  setToken,
  removeToken,
  authHeaders,
  fileUploadHeaders,
  authAPI,
  userAPI,
  dashboardAPI,
  instituteAPI,
  courseAPI,
  enquiryAPI,
  reviewAPI,
  adminAPI,
  notificationAPI,
  fileAPI,
  apiUtils,
  mockAPI,
};

// Export all APIs in a single object
export const API = {
  auth: authAPI,
  user: userAPI,
  dashboard: dashboardAPI,
  institute: instituteAPI,
  course: courseAPI,
  enquiry: enquiryAPI,
  review: reviewAPI,
  admin: adminAPI,
  notification: notificationAPI,
  file: fileAPI,
  utils: apiUtils,
  mock: mockAPI,
};

// Legacy exports for backward compatibility
export const login = authAPI.login;
export const register = authAPI.register;

// Dashboard data exports
export const getDashboardData = () => api.get('/dashboard', authHeaders());
export const getDashboardStats = dashboardAPI.getStats;

export const getCourses = courseAPI.getAll;
export const createCourse = courseAPI.create;
export const updateCourse = courseAPI.update;
export const deleteCourse = courseAPI.delete;
export const getEnquiries = enquiryAPI.getAll;
export const replyToEnquiry = enquiryAPI.reply;
export const updateEnquiryStatus = enquiryAPI.updateStatus;
export const deleteEnquiry = enquiryAPI.delete;
export const getReviews = reviewAPI.getAll;
export const flagReview = reviewAPI.flag;
export const approveReview = reviewAPI.approve;
export const deleteReview = reviewAPI.delete;

// Institute approval exports
export const getPendingInstitutes = instituteAPI.getPendingInstitutes;
export const approveInstitute = instituteAPI.approveInstitute;
export const rejectInstitute = instituteAPI.rejectInstitute;
export const updateInstituteStatus = instituteAPI.updateStatus;