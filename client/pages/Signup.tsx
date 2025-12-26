import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "faculty" | "admin",
    institution: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authAPI.signup(formData);

      if (data.success) {
        toast({
          title: "Success",
          description: "Account created successfully!",
        });

        // Navigate based on user role
        if (data.user?.role === "faculty") {
          navigate("/faculty");
        } else if (data.user?.role === "student") {
          navigate("/student");
        } else {
          navigate("/");
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Signup failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-primary-50 to-blue-50">
      <div className="flex-1 hidden lg:flex items-center justify-center p-12">
        <div>
          <div className="mb-12">
            <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg p-3 w-fit">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mt-8 mb-4">
              Join EduSprint
            </h1>
            <p className="text-xl text-gray-600">
              Transform academic management with AI-powered assessment and workload tracking
            </p>
          </div>
          <div className="space-y-6 mt-12">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-gray-900">AI-Powered Grading</h3>
                <p className="text-gray-600 text-sm">Automated assessment with configurable strictness</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Real-Time Analytics</h3>
                <p className="text-gray-600 text-sm">Workload heatmaps and performance dashboards</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Syllabus to Sprint</h3>
                <p className="text-gray-600 text-sm">Generate unique tasks from PDF syllabus automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg p-2">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">EduSprint</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600 mb-8">Join thousands of institutions transforming education</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Institution (Optional)
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="University Name"
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" required />
              <span className="text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-2.5 rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
