"use client";

import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { GraduationCap, Plus, Users, Award, BookOpen } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { intentionalityClass } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

const courseOptions = [
  { value: "", label: "All Courses" },
];

function AdminClassContent() {
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courseFilter, setCourseFilter] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const { success, error } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await intentionalityClass.adminGetStats();
        setStats(statsData);
        // In a real scenario, you'd also fetch courses here
        setCourses(statsData.courses || []);
      } catch (err) {
        error("Failed to load class data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [error]);

  const handleCreateCourse = async () => {
    if (!formData.title || !formData.description) {
      error("Please fill in all required fields");
      return;
    }

    try {
      const newCourse = await intentionalityClass.adminCreateCourse({
        title: formData.title,
        description: formData.description,
      });
      setCourses([newCourse, ...courses]);
      setShowCreateModal(false);
      setFormData({ title: "", description: "" });
      success("Course created successfully");
    } catch (err) {
      error("Failed to create course");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Intentionality Class</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate">Intentionality Class</h1>
          <p className="text-body-small mt-1">Course management, enrollment stats, and exam results</p>
        </div>
        <Button variant="primary" className="text-xs py-2 px-4 min-w-0" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} className="mr-1" /> New Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={16} className="text-purple" />
            <p className="text-[11px] text-gray-text">Total Courses</p>
          </div>
          <p className="font-heading text-xl font-bold text-slate">{stats?.totalCourses || 0}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-info" />
            <p className="text-[11px] text-gray-text">Total Enrollments</p>
          </div>
          <p className="font-heading text-xl font-bold text-info">{stats?.totalEnrolled || 0}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-success" />
            <p className="text-[11px] text-gray-text">Completed</p>
          </div>
          <p className="font-heading text-xl font-bold text-success">{stats?.totalCompleted || 0}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-warning" />
            <p className="text-[11px] text-gray-text">Avg Score</p>
          </div>
          <p className="font-heading text-xl font-bold text-warning">{stats?.avgScore || "0"}%</p>
        </div>
      </div>

      {/* Courses Table */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">Courses</h2>
      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm mb-8">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Course</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Enrolled</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Completed</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">In Progress</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Avg Score</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {(courses || []).map((c) => (
              <tr key={c.id} className="hover:bg-off-white/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-purple/50" />
                    <span className="font-heading text-sm font-semibold text-slate">{c.title || c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{c.enrolled || 0}</td>
                <td className="px-4 py-3 font-heading text-sm font-semibold text-success">{c.completed || 0}</td>
                <td className="px-4 py-3 font-heading text-sm font-semibold text-warning">{c.inProgress || 0}</td>
                <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{c.avgScore || 0}%</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-heading font-semibold text-success">
                    {c.status || "ACTIVE"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Exam Results */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">Recent Exam Results</h2>
      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Student</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Course</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Exam</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Score</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Date</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {(stats?.recentExams || []).slice(0, 5).map((exam: any) => (
              <tr key={exam.id} className="hover:bg-off-white/50">
                <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{exam.student}</td>
                <td className="px-4 py-3 font-body text-sm text-gray-text">{exam.course}</td>
                <td className="px-4 py-3 font-body text-sm text-gray-text">{exam.exam}</td>
                <td className="px-4 py-3 font-heading text-sm font-bold text-slate">{exam.score}</td>
                <td className="px-4 py-3 font-body text-sm text-gray-text">{exam.date}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${exam.result === "PASS" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                    {exam.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Course Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Course">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Course Title</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., IC 101 - Foundations"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Description</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Course description and overview..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1" onClick={handleCreateCourse}>Create Course</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminClassPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminClassContent />
    </ProtectedRoute>
  );
}
