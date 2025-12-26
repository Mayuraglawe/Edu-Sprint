import { RequestHandler } from "express";
import { Subject, CreateSubjectRequest } from "@shared/api";

// Mock database
const mockSubjects: Subject[] = [
  {
    id: "subject_1",
    name: "Data Structures",
    code: "CS201",
    description: "Fundamental data structures including arrays, linked lists, trees, and graphs.",
    faculty: "faculty_1",
    students: 42,
    createdAt: new Date().toISOString(),
  },
  {
    id: "subject_2",
    name: "Database Design",
    code: "CS301",
    description: "Relational database design, normalization, and SQL programming.",
    faculty: "faculty_1",
    students: 35,
    createdAt: new Date().toISOString(),
  },
  {
    id: "subject_3",
    name: "Web Development",
    code: "CS251",
    description: "Full-stack web development with modern frameworks and tools.",
    faculty: "faculty_1",
    students: 38,
    createdAt: new Date().toISOString(),
  },
  {
    id: "subject_4",
    name: "Algorithms",
    code: "CS202",
    description: "Algorithm design, analysis, and optimization techniques.",
    faculty: "faculty_1",
    students: 40,
    createdAt: new Date().toISOString(),
  },
];

export const handleGetSubjects: RequestHandler = (req, res) => {
  try {
    const { faculty } = req.query;

    let filteredSubjects = mockSubjects;

    if (faculty) {
      filteredSubjects = filteredSubjects.filter((s) => s.faculty === faculty);
    }

    res.json({ success: true, data: filteredSubjects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch subjects" });
  }
};

export const handleGetSubjectById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const subject = mockSubjects.find((s) => s.id === id);

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch subject" });
  }
};

export const handleCreateSubject: RequestHandler = (req, res) => {
  try {
    const { name, code, description } = req.body as CreateSubjectRequest;
    const faculty = (req as any).user?.id || "faculty_1"; // In real app, get from auth

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required",
      });
    }

    const newSubject: Subject = {
      id: "subject_" + Math.random().toString(36).substr(2, 9),
      name,
      code,
      description,
      faculty,
      students: 0,
      createdAt: new Date().toISOString(),
    };

    mockSubjects.push(newSubject);

    res.status(201).json({ success: true, data: newSubject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create subject" });
  }
};

export const handleUpdateSubject: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const subjectIndex = mockSubjects.findIndex((s) => s.id === id);

    if (subjectIndex === -1) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    mockSubjects[subjectIndex] = {
      ...mockSubjects[subjectIndex],
      name: name || mockSubjects[subjectIndex].name,
      code: code || mockSubjects[subjectIndex].code,
      description: description || mockSubjects[subjectIndex].description,
    };

    res.json({ success: true, data: mockSubjects[subjectIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update subject" });
  }
};

export const handleDeleteSubject: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const subjectIndex = mockSubjects.findIndex((s) => s.id === id);

    if (subjectIndex === -1) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    const deletedSubject = mockSubjects.splice(subjectIndex, 1)[0];

    res.json({ success: true, data: deletedSubject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete subject" });
  }
};
