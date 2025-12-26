import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutGrid,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  Upload,
  Users,
  Clock,
  Bell,
  User,
} from "lucide-react";
import { authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "faculty" | "student";
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = authAPI.getCurrentUser();

  const facultyMenuItems = [
    { label: "Dashboard", href: "/faculty", icon: LayoutGrid },
    { label: "Subjects", href: "/faculty/subjects", icon: BookOpen },
    { label: "Analytics", href: "/faculty/analytics", icon: BarChart3 },
    { label: "Grading", href: "/faculty/grading", icon: Clock },
    { label: "Students", href: "/faculty/students", icon: Users },
  ];

  const studentMenuItems = [
    { label: "Sprint Board", href: "/student", icon: LayoutGrid },
    { label: "My Tasks", href: "/student/tasks", icon: Clock },
    { label: "Grades", href: "/student/grades", icon: BarChart3 },
    { label: "Subjects", href: "/student/subjects", icon: BookOpen },
  ];

  const menuItems = userRole === "faculty" ? facultyMenuItems : studentMenuItems;

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-primary-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg p-2">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="hidden sm:inline text-2xl font-bold text-gray-900">EduSprint</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {currentUser?.name?.charAt(0).toUpperCase() || (userRole === "faculty" ? "F" : "S")}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-900">
                  {currentUser?.name || (userRole === "faculty" ? "Faculty" : "Student")}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-primary-200 rounded-lg shadow-lg">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition text-gray-900 text-sm"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition text-gray-900 text-sm border-t border-primary-100"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600 text-sm border-t border-primary-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-primary-200 transition-transform lg:translate-x-0 z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition text-sm font-medium"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-6 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
