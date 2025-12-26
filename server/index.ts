import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleLogin,
  handleSignup,
  handleLogout,
  handleVerifyToken,
} from "./routes/auth";
import {
  handleGetSubjects,
  handleGetSubjectById,
  handleCreateSubject,
  handleUpdateSubject,
  handleDeleteSubject,
} from "./routes/subjects";
import {
  handleGetTasks,
  handleGetTaskById,
  handleCreateTask,
  handleUpdateTask,
  handleDeleteTask,
  handleAssignTask,
  handleSubmitTask,
} from "./routes/tasks";
import {
  handleGetGrades,
  handleGetGradeById,
  handleCreateGrade,
  handleOverrideGrade,
  handleApproveGrade,
} from "./routes/grading";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth Routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/verify", handleVerifyToken);

  // Subject/Project Routes
  app.get("/api/subjects", handleGetSubjects);
  app.get("/api/subjects/:id", handleGetSubjectById);
  app.post("/api/subjects", handleCreateSubject);
  app.put("/api/subjects/:id", handleUpdateSubject);
  app.delete("/api/subjects/:id", handleDeleteSubject);

  // Task/Ticket Routes
  app.get("/api/tasks", handleGetTasks);
  app.get("/api/tasks/:id", handleGetTaskById);
  app.post("/api/tasks", handleCreateTask);
  app.put("/api/tasks/:id", handleUpdateTask);
  app.delete("/api/tasks/:id", handleDeleteTask);
  app.post("/api/tasks/:id/assign", handleAssignTask);
  app.post("/api/tasks/:id/submit", handleSubmitTask);

  // Grading Routes
  app.get("/api/grades", handleGetGrades);
  app.get("/api/grades/:id", handleGetGradeById);
  app.post("/api/grades", handleCreateGrade);
  app.post("/api/grades/:id/approve", handleApproveGrade);
  app.post("/api/grades/override", handleOverrideGrade);

  return app;
}
