# 🚀 EduSprint Backend Setup with Supabase

## ✅ Configuration Complete!

Your Spring Boot backend is now configured to connect to Supabase PostgreSQL database.

---

## 📋 SETUP STEPS

### Step 1: Get Your Supabase Database Password

1. Go to https://supabase.com/dashboard
2. Select your project: **mdofvunyvoljkemihsrf**
3. Navigate to **Settings** → **Database**
4. If you forgot your password, click **"Reset Database Password"**
5. Copy the new password

### Step 2: Configure Backend Environment

Edit `backend/.env` and replace `YOUR_SUPABASE_PASSWORD_HERE` with your actual password:

```properties
SUPABASE_DB_PASSWORD=your_actual_password_here
```

### Step 3: Run Database Migration

Execute these commands in order:

```bash
cd backend

# Clean and compile
mvn clean compile

# Run Flyway migration to create tables in Supabase
mvn flyway:migrate

# Verify migration
mvn flyway:info

# Start the application
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### Step 4: Verify Database Tables Created

1. Go to Supabase Dashboard → **Table Editor**
2. You should see these 10 tables:
   - ✅ users
   - ✅ subjects
   - ✅ tasks
   - ✅ task_definitions
   - ✅ task_assignments
   - ✅ grades
   - ✅ grade_overrides
   - ✅ subject_enrollments
   - ✅ penalties
   - ✅ workload_tracking

---

## 🔌 API Endpoints Available

### Base URL: `http://localhost:8081/api`

### 🔐 Authentication Endpoints

#### 1. Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "institution": "Test University"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Signup successful"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 3. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

---

## 🎨 Frontend Integration

### Install Required Dependencies

```bash
npm install axios
# or
pnpm add axios
```

### Create API Service (`client/lib/api.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: async (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'faculty' | 'admin';
    institution?: string;
  }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Subjects API
export const subjectsAPI = {
  getAll: async () => {
    const response = await api.get('/subjects');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    code: string;
    description?: string;
  }) => {
    const response = await api.post('/subjects', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  getBySubject: async (subjectId: string) => {
    const response = await api.get(`/subjects/${subjectId}/tasks`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    subjectId: string;
    dueDate: string;
    maxScore: number;
    weight?: number;
  }) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

// Grades API
export const gradesAPI = {
  getAll: async () => {
    const response = await api.get('/grades');
    return response.data;
  },

  getByStudent: async (studentId: string) => {
    const response = await api.get(`/students/${studentId}/grades`);
    return response.data;
  },

  getByTask: async (taskId: string) => {
    const response = await api.get(`/tasks/${taskId}/grades`);
    return response.data;
  },

  submit: async (taskId: string, data: {
    autoScore?: number;
    finalScore: number;
    feedback?: string;
    strictness?: 'loose' | 'medium' | 'hard';
  }) => {
    const response = await api.post(`/tasks/${taskId}/grades`, data);
    return response.data;
  },
};

export default api;
```

### Example React Component

```typescript
// Example: Login Form
import { useState } from 'react';
import { authAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await authAPI.login(email, password);
      if (result.success) {
        console.log('Login successful:', result.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Signup
curl -X POST http://localhost:8081/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student",
    "institution": "Test University"
  }'

# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Using Swagger UI

Visit: `http://localhost:8081/swagger-ui.html`

---

## 🔍 Verify Data in Supabase

1. Go to Supabase Dashboard → **Table Editor**
2. Click on **users** table
3. You should see the test users you created via API
4. Verify data is being stored correctly

---

## 🚨 Troubleshooting

**Problem: Connection refused**
- Check if backend is running: `mvn spring-boot:run -Dspring-boot.run.profiles=prod`
- Verify Supabase password is correct in `backend/.env`

**Problem: Tables not created**
- Run: `mvn flyway:migrate`
- Check logs for Flyway errors

**Problem: CORS errors in frontend**
- Backend already configured for `localhost:5173` and `localhost:8080`
- Check browser console for specific error

**Problem: 401 Unauthorized**
- Token might be expired (7 days validity)
- Login again to get new token

---

## 📊 Database Schema

Your Supabase database now has this structure:

```
users (id, name, email, password_hash, role, institution)
  ↓
subjects (id, name, code, faculty_id)
  ↓
tasks (id, title, subject_id, due_date, max_score)
  ↓
task_assignments (id, task_id, student_id, submitted_at)
  ↓
grades (id, task_id, student_id, auto_score, final_score)
```

---

## ✅ Next Steps

1. ✅ Configure `backend/.env` with Supabase password
2. ✅ Run `mvn flyway:migrate` to create tables
3. ✅ Start backend: `mvn spring-boot:run -Dspring-boot.run.profiles=prod`
4. ✅ Test signup/login via Swagger UI or cURL
5. ✅ Integrate frontend using the API service
6. ✅ Build your UI components to interact with the backend

**Your full-stack application is ready! 🎉**
