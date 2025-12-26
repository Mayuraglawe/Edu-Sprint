import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authAPI.login(email, password);

      if (data.success) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
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
          description: data.message || "Login failed",
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
              EduSprint
            </h1>
            <p className="text-xl text-gray-600">
              AI-powered academic workload and assessment ecosystem
            </p>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">For Faculty</h3>
              <p className="text-gray-600">Master Dashboard • AI-powered grading • Workload analytics</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">For Students</h3>
              <p className="text-gray-600">Sprint Board • Real-time penalties • AI feedback</p>
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

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-2.5 rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Create one
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-primary-200">
            <p className="text-xs text-gray-500 text-center">
              Demo credentials: faculty@edusprint.com / student@edusprint.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
