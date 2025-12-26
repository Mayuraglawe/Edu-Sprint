import { RequestHandler } from "express";
import { GradeRecord, GradeOverrideRequest } from "@shared/api";

// Mock database
const mockGradeRecords: GradeRecord[] = [
  {
    id: "grade_1",
    taskId: "task_1",
    studentId: "student_1",
    autoScore: 85,
    feedback: "Good implementation. Missing some edge case handling.",
    strictness: "medium",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

export const handleGetGrades: RequestHandler = (req, res) => {
  try {
    const { taskId, studentId, status } = req.query;

    let filteredGrades = mockGradeRecords;

    if (taskId) {
      filteredGrades = filteredGrades.filter((g) => g.taskId === taskId);
    }

    if (studentId) {
      filteredGrades = filteredGrades.filter((g) => g.studentId === studentId);
    }

    if (status) {
      filteredGrades = filteredGrades.filter((g) => g.status === status);
    }

    res.json({ success: true, data: filteredGrades });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch grades" });
  }
};

export const handleGetGradeById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const grade = mockGradeRecords.find((g) => g.id === id);

    if (!grade) {
      return res.status(404).json({ success: false, message: "Grade record not found" });
    }

    res.json({ success: true, data: grade });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch grade" });
  }
};

export const handleCreateGrade: RequestHandler = (req, res) => {
  try {
    const { taskId, studentId, autoScore, feedback, strictness } = req.body;

    if (!taskId || !studentId || typeof autoScore !== "number") {
      return res.status(400).json({
        success: false,
        message: "TaskId, studentId, and autoScore are required",
      });
    }

    const newGrade: GradeRecord = {
      id: "grade_" + Math.random().toString(36).substr(2, 9),
      taskId,
      studentId,
      autoScore,
      feedback,
      strictness: strictness || "medium",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    mockGradeRecords.push(newGrade);

    res.status(201).json({ success: true, data: newGrade });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create grade record" });
  }
};

export const handleOverrideGrade: RequestHandler = (req, res) => {
  try {
    const { taskId, studentId, finalScore, reason } = req.body as GradeOverrideRequest;

    const gradeIndex = mockGradeRecords.findIndex(
      (g) => g.taskId === taskId && g.studentId === studentId
    );

    if (gradeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Grade record not found",
      });
    }

    mockGradeRecords[gradeIndex] = {
      ...mockGradeRecords[gradeIndex],
      finalScore,
      status: "approved",
    };

    res.json({ success: true, data: mockGradeRecords[gradeIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to override grade" });
  }
};

export const handleApproveGrade: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const gradeIndex = mockGradeRecords.findIndex((g) => g.id === id);

    if (gradeIndex === -1) {
      return res.status(404).json({ success: false, message: "Grade record not found" });
    }

    mockGradeRecords[gradeIndex] = {
      ...mockGradeRecords[gradeIndex],
      status: "approved",
    };

    res.json({ success: true, data: mockGradeRecords[gradeIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to approve grade" });
  }
};
