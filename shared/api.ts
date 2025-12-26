/**
 * Shared code between client and server
 * EduSprint API Types
 */

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: "student" | "faculty" | "admin";
  institution?: string;
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
  message?: string;
}

// Subject/Project
export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  faculty: string;
  students: number;
  createdAt: string;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  description: string;
}

// Task/Ticket
export interface Task {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  studentId?: string;
  status: "not-started" | "in-progress" | "submitted" | "graded";
  dueDate: string;
  weight: number;
  maxScore: number;
  currentScore: number;
  penalty: number;
  definition: string[];
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  subjectId: string;
  dueDate: string;
  weight: number;
  maxScore: number;
  definition: string[];
}

// Grading
export interface GradeRecord {
  id: string;
  taskId: string;
  studentId: string;
  autoScore: number;
  finalScore?: number;
  feedback: string;
  strictness: "loose" | "medium" | "hard";
  status: "pending" | "reviewed" | "approved";
  createdAt: string;
}

export interface GradeOverrideRequest {
  taskId: string;
  studentId: string;
  finalScore: number;
  reason: string;
}

// SLA/Penalty
export interface PenaltyRecord {
  id: string;
  taskId: string;
  studentId: string;
  appliedAt: string;
  penaltyPercent: number;
  reason: string;
}

// Example response type for /api/demo
export interface DemoResponse {
  message: string;
}
