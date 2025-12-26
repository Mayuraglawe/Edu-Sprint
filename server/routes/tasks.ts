import { RequestHandler } from "express";
import { Task, CreateTaskRequest } from "@shared/api";

// Mock database
const mockTasks: Task[] = [
  {
    id: "task_1",
    title: "Binary Search Tree Implementation",
    description: "Implement a complete binary search tree with insert, search, and delete operations.",
    subjectId: "subject_1",
    studentId: "student_1",
    status: "in-progress",
    dueDate: "2024-01-15",
    weight: 10,
    maxScore: 10,
    currentScore: 0,
    penalty: 15,
    definition: [
      "Implement BST insert operation",
      "Implement BST search operation",
      "Implement BST delete operation",
      "Comprehensive unit tests required",
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task_2",
    title: "Database Schema Design",
    description: "Design a normalized database schema for an e-commerce platform.",
    subjectId: "subject_2",
    studentId: "student_1",
    status: "not-started",
    dueDate: "2024-01-18",
    weight: 15,
    maxScore: 15,
    currentScore: 0,
    penalty: 20,
    definition: [
      "Create normalized relational schema",
      "Generate Entity-Relationship Diagram",
      "Implement SQL DDL statements",
      "Write sample queries",
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task_3",
    title: "React Component Library",
    description: "Create a reusable component library using React and TypeScript.",
    subjectId: "subject_3",
    studentId: "student_1",
    status: "not-started",
    dueDate: "2024-01-20",
    weight: 12,
    maxScore: 12,
    currentScore: 0,
    penalty: 10,
    definition: [
      "Create 5+ reusable UI components",
      "Document with Storybook",
      "Write unit tests (90%+ coverage)",
      "Deploy to npm registry",
    ],
    createdAt: new Date().toISOString(),
  },
];

export const handleGetTasks: RequestHandler = (req, res) => {
  try {
    const { subjectId, studentId, status } = req.query;

    let filteredTasks = mockTasks;

    if (subjectId) {
      filteredTasks = filteredTasks.filter((t) => t.subjectId === subjectId);
    }

    if (studentId) {
      filteredTasks = filteredTasks.filter((t) => t.studentId === studentId);
    }

    if (status) {
      filteredTasks = filteredTasks.filter((t) => t.status === status);
    }

    res.json({ success: true, data: filteredTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

export const handleGetTaskById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const task = mockTasks.find((t) => t.id === id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch task" });
  }
};

export const handleCreateTask: RequestHandler = (req, res) => {
  try {
    const { title, description, subjectId, dueDate, weight, maxScore, definition } =
      req.body as CreateTaskRequest;

    if (!title || !subjectId || !dueDate || !maxScore) {
      return res.status(400).json({
        success: false,
        message: "Title, subjectId, dueDate, and maxScore are required",
      });
    }

    const newTask: Task = {
      id: "task_" + Math.random().toString(36).substr(2, 9),
      title,
      description,
      subjectId,
      status: "not-started",
      dueDate,
      weight: weight || 10,
      maxScore,
      currentScore: 0,
      penalty: 2,
      definition: definition || [],
      createdAt: new Date().toISOString(),
    };

    mockTasks.push(newTask);

    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

export const handleUpdateTask: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, weight, maxScore, definition } = req.body;

    const taskIndex = mockTasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      title: title || mockTasks[taskIndex].title,
      description: description || mockTasks[taskIndex].description,
      status: status || mockTasks[taskIndex].status,
      dueDate: dueDate || mockTasks[taskIndex].dueDate,
      weight: weight || mockTasks[taskIndex].weight,
      maxScore: maxScore || mockTasks[taskIndex].maxScore,
      definition: definition || mockTasks[taskIndex].definition,
    };

    res.json({ success: true, data: mockTasks[taskIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

export const handleDeleteTask: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const taskIndex = mockTasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const deletedTask = mockTasks.splice(taskIndex, 1)[0];

    res.json({ success: true, data: deletedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};

export const handleAssignTask: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const taskIndex = mockTasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      studentId,
    };

    res.json({ success: true, data: mockTasks[taskIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to assign task" });
  }
};

export const handleSubmitTask: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { submissionData } = req.body;

    const taskIndex = mockTasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      status: "submitted",
    };

    res.json({ success: true, data: mockTasks[taskIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit task" });
  }
};
