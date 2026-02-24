import axios from 'axios';

const API_BASE_URL = 'https://hrms-app-3wzl.onrender.com/api/'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Employee API functions
export const employeeAPI = {
  // Get all employees with optional filters
  getAll: (params = {}) => {
    return api.get('/employees/', { params });
  },

  // Get employee by ID
  getById: (id) => {
    return api.get(`/employees/${id}/`);
  },

  // Create new employee
  create: (data) => {
    return api.post('/employees/', data);
  },

  // Update employee
  update: (id, data) => {
    return api.put(`/employees/${id}/`, data);
  },

  // Delete employee
  delete: (id) => {
    return api.delete(`/employees/${id}/`);
  },

  // Get simple employee list for dropdowns
  getSimpleList: () => {
    return api.get('/employees/simple/');
  },

  // Get employee attendance summary
  getAttendanceSummary: (id) => {
    return api.get(`/employees/${id}/attendance-summary/`);
  },
};

// Attendance API functions
export const attendanceAPI = {
  // Get all attendance records with optional filters
  getAll: (params = {}) => {
    return api.get('/attendance/', { params });
  },

  // Get attendance record by ID
  getById: (id) => {
    return api.get(`/attendance/${id}/`);
  },

  // Create new attendance record
  create: (data) => {
    return api.post('/attendance/', data);
  },

  // Update attendance record
  update: (id, data) => {
    return api.put(`/attendance/${id}/`, data);
  },

  // Delete attendance record
  delete: (id) => {
    return api.delete(`/attendance/${id}/`);
  },
};

// Dashboard API functions
export const dashboardAPI = {
  // Get dashboard summary
  getSummary: () => {
    return api.get('/dashboard/');
  },
};

// Utility functions for error handling
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (status === 400) {
      // Validation errors
      return {
        type: 'validation',
        message: data.message || 'Validation failed',
        errors: data.errors || {},
      };
    } else if (status === 404) {
      return {
        type: 'not_found',
        message: 'Resource not found',
      };
    } else if (status === 500) {
      return {
        type: 'server_error',
        message: 'Internal server error. Please try again later.',
      };
    } else {
      return {
        type: 'unknown',
        message: data.message || 'An unexpected error occurred',
      };
    }
  } else if (error.request) {
    // Network error
    return {
      type: 'network',
      message: 'Unable to connect to the server. Please check your internet connection.',
    };
  } else {
    // Other error
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred',
    };
  }
};

// Format API response data
export const formatAPIResponse = (response) => {
  return {
    data: response.data.data || response.data,
    message: response.data.message,
    status: response.status,
  };
};

export default api;
