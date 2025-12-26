import { RequestHandler } from "express";
import { LoginRequest, SignupRequest, AuthResponse } from "@shared/api";

// Mock user database
const mockUsers = [
  {
    id: "faculty_1",
    name: "Dr. Smith",
    email: "faculty@edusprint.com",
    password: "password123",
    role: "faculty",
  },
  {
    id: "student_1",
    name: "John Doe",
    email: "student@edusprint.com",
    password: "password123",
    role: "student",
  },
];

export const handleLogin: RequestHandler = (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      } as AuthResponse);
    }

    const user = mockUsers.find((u) => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      } as AuthResponse);
    }

    const response: AuthResponse = {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: "mock_jwt_token_" + user.id,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    } as AuthResponse);
  }
};

export const handleSignup: RequestHandler = (req, res) => {
  try {
    const { name, email, password, role, institution } = req.body as SignupRequest;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      } as AuthResponse);
    }

    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      } as AuthResponse);
    }

    const newUser = {
      id: `${role}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password,
      role,
    };

    mockUsers.push(newUser as any);

    const response: AuthResponse = {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token: "mock_jwt_token_" + newUser.id,
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signup failed",
    } as AuthResponse);
  }
};

export const handleLogout: RequestHandler = (_req, res) => {
  try {
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const handleVerifyToken: RequestHandler = (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token || !token.startsWith("mock_jwt_token_")) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = token.replace("mock_jwt_token_", "");
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Token verification failed" });
  }
};
