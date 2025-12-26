import axios, { AxiosInstance } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Create axios instance with default config
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'admin';
  institution?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token?: string;
  message: string;
}

export const authAPI = {
  /**
   * User signup
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * User login
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * User logout
   */
  logout: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return response.data;
  },

  /**
   * Verify JWT token
   */
  verify: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/verify');
    return response.data;
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};

// ============================================================================
// SUBJECTS API
// ============================================================================

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  facultyId: string;
  studentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  description?: string;
}

export const subjectsAPI = {
  /**
   * Get all subjects
   */
  getAll: async (): Promise<Subject[]> => {
    const response = await api.get<Subject[]>('/subjects');
    return response.data;
  },

  /**
   * Get subject by ID
   */
  getById: async (id: string): Promise<Subject> => {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  /**
   * Get subjects for current faculty
   */
  getMySubjects: async (): Promise<Subject[]> => {
    const response = await api.get<Subject[]>('/subjects/my');
    return response.data;
  },

  /**
   * Create new subject
   */
  create: async (data: CreateSubjectRequest): Promise<Subject> => {
    const response = await api.post<Subject>('/subjects', data);
    return response.data;
  },

  /**
   * Update subject
   */
  update: async (id: string, data: Partial<CreateSubjectRequest>): Promise<Subject> => {
    const response = await api.put<Subject>(`/subjects/${id}`, data);
    return response.data;
  },

  /**
   * Delete subject
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  },
};

// ============================================================================
// TASKS API
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  status: string;
  dueDate: string;
  weight: number;
  maxScore: number;
  penaltyPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  subjectId: string;
  dueDate: string;
  weight?: number;
  maxScore: number;
  penaltyPercent?: number;
}

export const tasksAPI = {
  /**
   * Get all tasks
   */
  getAll: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },

  /**
   * Get task by ID
   */
  getById: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Get tasks for a subject
   */
  getBySubject: async (subjectId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/subjects/${subjectId}/tasks`);
    return response.data;
  },

  /**
   * Get student's tasks
   */
  getMyTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks/my');
    return response.data;
  },

  /**
   * Create new task
   */
  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  /**
   * Update task
   */
  update: async (id: string, data: Partial<CreateTaskRequest>): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Delete task
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// ============================================================================
// ASSIGNMENTS API
// ============================================================================

export interface TaskAssignment {
  id: string;
  taskId: string;
  studentId: string;
  submittedAt?: string;
  submissionContent?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitAssignmentRequest {
  taskId: string;
  submissionContent?: string;
  fileUrl?: string;
}

export const assignmentsAPI = {
  /**
   * Get all assignments for current user
   */
  getMyAssignments: async (): Promise<TaskAssignment[]> => {
    const response = await api.get<TaskAssignment[]>('/assignments/my');
    return response.data;
  },

  /**
   * Get assignment by ID
   */
  getById: async (id: string): Promise<TaskAssignment> => {
    const response = await api.get<TaskAssignment>(`/assignments/${id}`);
    return response.data;
  },

  /**
   * Submit assignment
   */
  submit: async (data: SubmitAssignmentRequest): Promise<TaskAssignment> => {
    const response = await api.post<TaskAssignment>('/assignments/submit', data);
    return response.data;
  },

  /**
   * Update assignment
   */
  update: async (id: string, data: Partial<SubmitAssignmentRequest>): Promise<TaskAssignment> => {
    const response = await api.put<TaskAssignment>(`/assignments/${id}`, data);
    return response.data;
  },
};

// ============================================================================
// GRADES API
// ============================================================================

export interface Grade {
  id: string;
  taskId: string;
  studentId: string;
  autoScore?: number;
  finalScore?: number;
  feedback?: string;
  strictness: string;
  status: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitGradeRequest {
  taskId: string;
  studentId: string;
  autoScore?: number;
  finalScore: number;
  feedback?: string;
  strictness?: 'loose' | 'medium' | 'hard';
}

export const gradesAPI = {
  /**
   * Get all grades
   */
  getAll: async (): Promise<Grade[]> => {
    const response = await api.get<Grade[]>('/grades');
    return response.data;
  },

  /**
   * Get my grades (student)
   */
  getMyGrades: async (): Promise<Grade[]> => {
    const response = await api.get<Grade[]>('/grades/my');
    return response.data;
  },

  /**
   * Get grades for a task
   */
  getByTask: async (taskId: string): Promise<Grade[]> => {
    const response = await api.get<Grade[]>(`/tasks/${taskId}/grades`);
    return response.data;
  },

  /**
   * Get grades for a student
   */
  getByStudent: async (studentId: string): Promise<Grade[]> => {
    const response = await api.get<Grade[]>(`/students/${studentId}/grades`);
    return response.data;
  },

  /**
   * Submit grade (faculty)
   */
  submit: async (data: SubmitGradeRequest): Promise<Grade> => {
    const response = await api.post<Grade>('/grades', data);
    return response.data;
  },

  /**
   * Update grade
   */
  update: async (id: string, data: Partial<SubmitGradeRequest>): Promise<Grade> => {
    const response = await api.put<Grade>(`/grades/${id}`, data);
    return response.data;
  },
};

// ============================================================================
// HEALTH CHECK API
// ============================================================================

export const healthAPI = {
  /**
   * Ping server
   */
  ping: async (): Promise<{ message: string }> => {
    const response = await api.get<{ message: string }>('/ping');
    return response.data;
  },

  /**
   * Demo endpoint
   */
  demo: async (): Promise<any> => {
    const response = await api.get('/demo');
    return response.data;
  },
};

// Export default API instance
export default api;
