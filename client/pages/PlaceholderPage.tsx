import { DashboardLayout } from "@/components/DashboardLayout";
import { useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function PlaceholderPage() {
  const params = useParams();
  const role = location.pathname.split("/")[1] as "faculty" | "student";
  const page = params.page || "";

  const pageNames: Record<string, string> = {
    subjects: "Subjects",
    analytics: "Analytics",
    grading: "Grading",
    students: "Students",
    tasks: "My Tasks",
    grades: "Grades",
    profile: "Profile",
    settings: "Settings",
  };

  const pageName = pageNames[page] || "Page";

  return (
    <DashboardLayout userRole={role}>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏗️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {pageName} Coming Soon
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            This feature is currently under development. We're building something amazing for you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2 group">
              Notify Me
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg hover:bg-primary-50 transition font-medium">
              Go Back
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
