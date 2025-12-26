import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Zap, Brain, BarChart3, Users, Clock } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg p-2">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              EduSprint
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-primary-600 transition">
              Features
            </a>
            <a href="#platform" className="text-gray-600 hover:text-primary-600 transition">
              Platform
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition">
              For Institutions
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-600 hover:text-primary-600 transition font-medium">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered Academic <br />
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Workload Management
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            EduSprint transforms academic assessment with intelligent task management, real-time grading, and adaptive student workload tracking. Built for modern institutions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:shadow-xl transition flex items-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <button className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg hover:bg-primary-50 transition font-medium">
              Watch Demo
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            Trusted by 100+ institutions worldwide • No credit card required
          </p>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-16 bg-white/50 backdrop-blur border-y border-primary-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
            <p className="text-gray-600">Active Students</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">10M+</div>
            <p className="text-gray-600">Tasks Completed</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
            <p className="text-gray-600">Time Saved</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Intelligent Features for Every Role
            </h2>
            <p className="text-xl text-gray-600">
              Designed with educators and students in mind
            </p>
          </div>

          {/* Faculty Features */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary-600" />
              For Faculty
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                icon={<BookOpen className="w-6 h-6" />}
                title="Syllabus-to-Sprint AI"
                description="Upload a PDF syllabus and let AI automatically generate unique, personalized tasks for every student based on their ID."
              />
              <FeatureCard
                icon={<Brain className="w-6 h-6" />}
                title="Triple-Tier Grading"
                description="Automated marking with configurable strictness (Loose, Medium, Hard) plus mandatory faculty override for accuracy."
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Workload Heatmaps"
                description="Visualize student stress levels across all subjects and coordinate deadlines to prevent burnout."
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Master Excel Dashboard"
                description="Centralized golden record where grade weightages update in real-time across the platform."
              />
            </div>
          </div>

          {/* Student Features */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary-600" />
              For Students
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Sprint Board"
                description="Track personalized tasks with deadline countdowns and real-time grade tracking on your dashboard."
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Penalty Visualization"
                description="Watch your grade potential in real-time. See green-to-red countdown as deadlines approach."
              />
              <FeatureCard
                icon={<Brain className="w-6 h-6" />}
                title="AI Feedback"
                description="Get immediate feedback on submissions before final grading, with learning mode for resubmission."
              />
              <FeatureCard
                icon={<BookOpen className="w-6 h-6" />}
                title="Professional Workflow"
                description="Learn industry-ready project management practices in a Jira-like issue tracking environment."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Architecture */}
      <section id="platform" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
            Circular Platform Flow
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <FlowCard
              number="1"
              title="Initialization"
              description="Faculty uploads Subject PDF & Syllabus"
              icon="📄"
            />
            <FlowCard
              number="2"
              title="Backlog Creation"
              description="AI parses to Sprint Units and generates unique tasks per student"
              icon="🎯"
            />
            <FlowCard
              number="3"
              title="Execution"
              description="Student starts Task Ticket with SLA Timer and AI Nudges"
              icon="⚡"
            />
            <FlowCard
              number="4"
              title="Assessment"
              description="AI evaluates work; marks held in Pending Review"
              icon="✅"
            />
          </div>
          <div className="mt-12 p-8 bg-white rounded-xl border border-primary-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Dynamic SLA Engine</h3>
            <p className="text-gray-600">
              Real-time soft penalties are applied as deadlines pass. Student's "Current Potential Mark" updates live—e.g., 10.0 becomes 9.8 after one hour late. Faculty always has override control.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary-600 to-blue-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Academic Management?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join institutions worldwide using EduSprint to automate grading, reduce faculty workload, and empower students.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-bold flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition font-medium">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">EduSprint</h4>
              <p className="text-sm">AI-powered academic workload management for modern institutions.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 EduSprint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 bg-white rounded-xl border border-primary-100 hover:shadow-lg hover:border-primary-300 transition">
      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-blue-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function FlowCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="relative">
      <div className="bg-white rounded-xl p-6 border border-primary-200 hover:shadow-lg transition h-full">
        <div className="text-4xl mb-4">{icon}</div>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {number}
          </div>
          <h4 className="text-lg font-bold text-gray-900">{title}</h4>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      {number !== "4" && (
        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-600 to-transparent"></div>
      )}
    </div>
  );
}
