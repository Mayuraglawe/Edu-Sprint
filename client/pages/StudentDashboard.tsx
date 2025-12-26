import { DashboardLayout } from "@/components/DashboardLayout";
import { Clock, AlertCircle, CheckCircle2, TrendingUp, Zap } from "lucide-react";

export default function StudentDashboard() {
  const tasks = [
    {
      id: 1,
      title: "Binary Search Tree Implementation",
      subject: "Data Structures",
      dueDate: "2024-01-15",
      priority: "high",
      penalty: 15,
      status: "in-progress",
      weight: "10%",
      currentGrade: 0,
      potentialGrade: 10,
      definition: ["Implement BST insert", "Implement BST search", "Unit tests required"],
    },
    {
      id: 2,
      title: "Database Schema Design",
      subject: "Database Design",
      dueDate: "2024-01-18",
      priority: "high",
      penalty: 20,
      status: "not-started",
      weight: "15%",
      currentGrade: 0,
      potentialGrade: 15,
      definition: ["Design normalized schema", "Create ERD", "SQL implementation"],
    },
    {
      id: 3,
      title: "React Component Library",
      subject: "Web Development",
      dueDate: "2024-01-20",
      priority: "medium",
      penalty: 10,
      status: "not-started",
      weight: "12%",
      currentGrade: 0,
      potentialGrade: 12,
      definition: ["Create 5+ reusable components", "Document with Storybook", "Add tests"],
    },
  ];

  const daysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUrgency = (days: number) => {
    if (days < 2) return "urgent";
    if (days < 5) return "high";
    if (days < 10) return "medium";
    return "low";
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Sprint Board</h1>
          <p className="text-gray-600 mt-2">Track your assignments, deadlines, and real-time grades</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <QuickStat
            icon={<Zap className="w-5 h-5" />}
            label="Active Tasks"
            value="3"
            color="primary"
          />
          <QuickStat
            icon={<Clock className="w-5 h-5" />}
            label="Due Soon"
            value="2"
            color="warning"
          />
          <QuickStat
            icon={<TrendingUp className="w-5 h-5" />}
            label="Current GPA"
            value="3.8"
            color="success"
          />
          <QuickStat
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Completed"
            value="12"
            color="success"
          />
        </div>

        {/* Tasks Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          <div className="grid gap-6">
            {tasks.map((task) => {
              const days = daysRemaining(task.dueDate);
              const urgency = getUrgency(days);
              const penaltyMultiplier = Math.max(0, task.penalty - days * 2) / 100;
              const adjustedGrade = task.potentialGrade * (1 - penaltyMultiplier);

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl border-2 p-6 hover:shadow-lg transition ${
                    urgency === "urgent"
                      ? "border-red-300 bg-red-50"
                      : urgency === "high"
                        ? "border-orange-300 bg-orange-50"
                        : "border-primary-100"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          urgency === "urgent"
                            ? "bg-red-200 text-red-800"
                            : urgency === "high"
                              ? "bg-orange-200 text-orange-800"
                              : "bg-blue-200 text-blue-800"
                        }`}>
                          {urgency.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600">{task.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">{adjustedGrade.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">/ {task.potentialGrade} points</p>
                    </div>
                  </div>

                  {/* Definition of Done */}
                  <div className="mb-4 p-4 bg-white rounded-lg border border-primary-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Definition of Done:</p>
                    <ul className="space-y-1">
                      {task.definition.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-primary-600 mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deadline & Penalty Visualization */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2">Days Until Deadline</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{days}</span>
                        <span className="text-gray-600">days</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2">Deadline</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2">Penalty Rate</p>
                      <p className="text-lg font-bold text-red-600">{task.penalty}%</p>
                    </div>
                  </div>

                  {/* Penalty Countdown Bar */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 font-medium mb-2">Penalty Progress</p>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          penaltyMultiplier > 0.7
                            ? "bg-red-500"
                            : penaltyMultiplier > 0.4
                              ? "bg-orange-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(penaltyMultiplier * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <button className="flex-1 bg-gradient-to-r from-primary-600 to-blue-600 text-white py-2 rounded-lg hover:shadow-lg transition font-medium text-sm">
                      Start Task
                    </button>
                    <button className="flex-1 border-2 border-primary-600 text-primary-600 py-2 rounded-lg hover:bg-primary-50 transition font-medium text-sm">
                      View Details
                    </button>
                    {task.status === "in-progress" && (
                      <button className="flex-1 border-2 border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition font-medium text-sm">
                        Submit Work
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Nudge Section */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-300 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
              🤖
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Nudge</h3>
              <p className="text-gray-700 mb-3">
                Your Binary Search Tree task has been overdue for 2 days. Each day adds a 2% penalty. Consider submitting by end of day to preserve your 10 points.
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Get AI Feedback →
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600",
    warning: "bg-orange-100 text-orange-600",
    success: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white rounded-lg border border-primary-100 p-4 hover:shadow-md transition">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]} mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
