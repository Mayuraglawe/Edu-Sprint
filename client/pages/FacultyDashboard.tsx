import { BarChart3, BookOpen, Clock, TrendingUp, Upload, Settings, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function FacultyDashboard() {
  return (
    <DashboardLayout userRole="faculty">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Master Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your subjects, assignments, and student workload</p>
          </div>
          <button className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition flex items-center gap-2 font-medium">
            <Upload className="w-5 h-5" />
            Upload Syllabus
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Active Subjects"
            value="5"
            subtext="2 pending review"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Total Students"
            value="156"
            subtext="across all subjects"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Pending Grades"
            value="24"
            subtext="awaiting override"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Avg. Workload"
            value="8.2 hrs"
            subtext="student weekly load"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workload Heatmap */}
            <div className="bg-white rounded-xl border border-primary-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary-600" />
                Student Workload Heatmap
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Data Structures</span>
                    <span className="text-sm text-gray-600">7.5 hrs/week</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Database Design</span>
                    <span className="text-sm text-gray-600">9.2 hrs/week</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2.5 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Web Development</span>
                    <span className="text-sm text-gray-600">6.8 hrs/week</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2.5 rounded-full" style={{ width: "68%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Algorithms</span>
                    <span className="text-sm text-gray-600">10.5 hrs/week</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ Algorithms exceeds recommended workload. Consider adjusting deadlines.
                </p>
              </div>
            </div>

            {/* Recent Subjects */}
            <div className="bg-white rounded-xl border border-primary-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary-600" />
                Your Subjects
              </h2>
              <div className="space-y-4">
                {["Data Structures", "Database Design", "Web Development", "Algorithms"].map((subject) => (
                  <div key={subject} className="flex items-center justify-between p-4 border border-primary-100 rounded-lg hover:bg-primary-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                      <span className="font-medium text-gray-900">{subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">42 students</span>
                      <button className="p-2 hover:bg-primary-100 rounded-lg transition">
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pending Reviews */}
            <div className="bg-white rounded-xl border border-primary-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Grades</h3>
              <div className="space-y-3">
                {[
                  { student: "Ava Johnson", subject: "Data Structures", grade: "8.5" },
                  { student: "Marcus Lee", subject: "Database", grade: "7.8" },
                  { student: "Sara Williams", subject: "Web Dev", grade: "9.2" },
                ].map((item) => (
                  <div key={item.student} className="p-3 bg-gray-50 rounded-lg border border-primary-100">
                    <p className="font-medium text-sm text-gray-900">{item.student}</p>
                    <p className="text-xs text-gray-600">{item.subject}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-primary-600">{item.grade}</span>
                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Golden Record */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Master Excel</h3>
              <p className="text-sm text-gray-600 mb-4">
                Centralized golden record for all grade weightages and calculations
              </p>
              <button className="w-full bg-white text-primary-600 border-2 border-primary-600 py-2 rounded-lg hover:bg-primary-50 transition font-medium text-sm">
                Open Master Excel
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-primary-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 p-3 hover:bg-primary-50 rounded-lg transition text-left text-sm font-medium text-gray-900">
                  <Plus className="w-4 h-4 text-primary-600" />
                  Create New Assignment
                </button>
                <button className="w-full flex items-center gap-2 p-3 hover:bg-primary-50 rounded-lg transition text-left text-sm font-medium text-gray-900">
                  <Upload className="w-4 h-4 text-primary-600" />
                  Bulk Import Students
                </button>
                <button className="w-full flex items-center gap-2 p-3 hover:bg-primary-50 rounded-lg transition text-left text-sm font-medium text-gray-900">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-primary-100 p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  );
}
