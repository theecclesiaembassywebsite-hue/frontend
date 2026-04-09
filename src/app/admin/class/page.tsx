"use client";

import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { GraduationCap, Plus, Users, Award, BookOpen, ChevronDown, ChevronRight, Video, FileText, Trash2, Edit } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { intentionalityClass, upload } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

function AdminClassContent() {
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [moduleFormData, setModuleFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "",
    pdfUrl: "",
    content: "",
    order: 1,
  });
  const [questionFormData, setQuestionFormData] = useState({
    courseId: "",
    question: "",
    type: "MCQ",
    options: ["", "", "", ""],
    answer: "",
    points: 1,
    order: 1,
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, coursesData] = await Promise.all([
        intentionalityClass.adminGetStats(),
        intentionalityClass.adminGetCourses(),
      ]);
      setStats(statsData);
      setCourses(coursesData || []);
    } catch (err) {
      error("Failed to load class data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const openModuleModal = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    const nextOrder = course?.modules?.length ? course.modules.length + 1 : 1;
    setModuleFormData({
      courseId,
      title: "",
      description: "",
      videoUrl: "",
      pdfUrl: "",
      content: "",
      order: nextOrder,
    });
    setShowModuleModal(true);
  };

  const handleCreateModule = async () => {
    if (!moduleFormData.title) {
      error("Please enter a module title");
      return;
    }

    try {
      await intentionalityClass.adminCreateModule({
        courseId: moduleFormData.courseId,
        title: moduleFormData.title,
        description: moduleFormData.description || undefined,
        videoUrl: moduleFormData.videoUrl || undefined,
        pdfUrl: moduleFormData.pdfUrl || undefined,
        content: moduleFormData.content || undefined,
        order: moduleFormData.order,
      });
      setShowModuleModal(false);
      success("Module added successfully");
      // Refresh courses to get updated module list
      const updated = await intentionalityClass.adminGetCourses();
      setCourses(updated || []);
    } catch (err) {
      error("Failed to create module");
      console.error(err);
    }
  };

  const openQuestionModal = (courseId: string) => {
    setQuestionFormData({
      courseId,
      question: "",
      type: "MCQ",
      options: ["", "", "", ""],
      answer: "",
      points: 1,
      order: 1,
    });
    setShowQuestionModal(true);
  };

  const handleCreateQuestion = async () => {
    if (!questionFormData.question || !questionFormData.answer) {
      error("Please fill in the question and answer");
      return;
    }

    try {
      const data: any = {
        courseId: questionFormData.courseId,
        question: questionFormData.question,
        type: questionFormData.type,
        answer: questionFormData.answer,
        points: questionFormData.points,
        order: questionFormData.order,
      };

      if (questionFormData.type === "MCQ") {
        data.options = questionFormData.options.filter((o) => o.trim() !== "");
        if (data.options.length < 2) {
          error("MCQ questions need at least 2 options");
          return;
        }
      }

      await intentionalityClass.adminCreateQuestion(data);
      setShowQuestionModal(false);
      success("Exam question added");
    } catch (err) {
      error("Failed to create question");
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

      {/* Courses with Expandable Modules */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">Courses & Modules</h2>
      <div className="space-y-3 mb-8">
        {(courses || []).map((c) => {
          const enrolled = c._count?.enrollments ?? 0;
          const completedCount = c.enrollments?.filter((e: any) => e.status === "PASSED").length ?? 0;
          const inProgressCount = c.enrollments?.filter((e: any) => e.status === "IN_PROGRESS").length ?? 0;
          const isExpanded = expandedCourseId === c.id;

          return (
            <div key={c.id} className="rounded-[8px] border border-gray-border bg-white shadow-sm overflow-hidden">
              {/* Course Header */}
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-off-white/50 transition-colors"
                onClick={() => setExpandedCourseId(isExpanded ? null : c.id)}
              >
                {isExpanded ? <ChevronDown size={16} className="text-gray-text flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-text flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-purple/50 flex-shrink-0" />
                    <span className="font-heading text-sm font-semibold text-slate truncate">{c.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-heading font-semibold ${c.published ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {c.published ? "ACTIVE" : "DRAFT"}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-[11px] font-body text-gray-text">
                    <span>{enrolled} enrolled</span>
                    <span>{completedCount} completed</span>
                    <span>{inProgressCount} in progress</span>
                    <span>{c.modules?.length || 0} modules</span>
                  </div>
                </div>
              </div>

              {/* Expanded Module List */}
              {isExpanded && (
                <div className="border-t border-gray-border bg-off-white/30">
                  {/* Modules */}
                  <div className="px-5 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-heading text-xs font-bold text-slate uppercase tracking-wider">Modules</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); openModuleModal(c.id); }}
                        className="text-[11px] font-heading font-semibold text-purple-vivid hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Module
                      </button>
                    </div>

                    {c.modules?.length > 0 ? (
                      <div className="space-y-2">
                        {c.modules
                          .sort((a: any, b: any) => a.order - b.order)
                          .map((mod: any) => (
                            <div key={mod.id} className="flex items-center gap-3 rounded-[4px] border border-gray-border bg-white px-4 py-2.5">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-vivid text-white text-[10px] font-bold flex-shrink-0">
                                {mod.order}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-heading text-sm font-semibold text-slate truncate">{mod.title}</p>
                              </div>
                              <div className="flex items-center gap-2 text-gray-text">
                                {mod.videoUrl && <Video size={13} />}
                                {mod.pdfUrl && <FileText size={13} />}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-text font-body py-3">No modules yet. Add the first module to this course.</p>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="px-5 py-3 border-t border-gray-border flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openModuleModal(c.id); }}
                      className="text-[11px] font-heading font-semibold text-purple-vivid hover:underline flex items-center gap-1"
                    >
                      <BookOpen size={12} /> Add Module
                    </button>
                    <span className="text-gray-border">|</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); openQuestionModal(c.id); }}
                      className="text-[11px] font-heading font-semibold text-purple-vivid hover:underline flex items-center gap-1"
                    >
                      <Edit size={12} /> Add Exam Question
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Exam Results */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">Recent Exam Results</h2>
      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Student</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Course</th>
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
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Course Title *</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., IC 101 - Foundations"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Description *</label>
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

      {/* Add Module Modal */}
      <Modal isOpen={showModuleModal} onClose={() => setShowModuleModal(false)} title="Add Course Module">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Module Title *</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., Week 1: Kingdom Identity"
              value={moduleFormData.title}
              onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Description</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Brief description of this module..."
              rows={2}
              value={moduleFormData.description}
              onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Video URL (YouTube embed)</label>
            <input
              type="url"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="https://www.youtube.com/embed/..."
              value={moduleFormData.videoUrl}
              onChange={(e) => setModuleFormData({ ...moduleFormData, videoUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">PDF Material URL</label>
            <input
              type="url"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="https://..."
              value={moduleFormData.pdfUrl}
              onChange={(e) => setModuleFormData({ ...moduleFormData, pdfUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Written Content</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Module text content (supports plain text)..."
              rows={4}
              value={moduleFormData.content}
              onChange={(e) => setModuleFormData({ ...moduleFormData, content: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Order</label>
            <input
              type="number"
              min="1"
              className="w-24 rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              value={moduleFormData.order}
              onChange={(e) => setModuleFormData({ ...moduleFormData, order: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1" onClick={handleCreateModule}>Add Module</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowModuleModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Add Exam Question Modal */}
      <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title="Add Exam Question">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Question *</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Enter the exam question..."
              rows={2}
              value={questionFormData.question}
              onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Question Type</label>
            <select
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              value={questionFormData.type}
              onChange={(e) => setQuestionFormData({ ...questionFormData, type: e.target.value })}
            >
              <option value="MCQ">Multiple Choice</option>
              <option value="SHORT_ANSWER">Short Answer</option>
            </select>
          </div>
          {questionFormData.type === "MCQ" && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Options</label>
              <div className="space-y-2">
                {questionFormData.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...questionFormData.options];
                      newOptions[i] = e.target.value;
                      setQuestionFormData({ ...questionFormData, options: newOptions });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Correct Answer *</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder={questionFormData.type === "MCQ" ? "Must match one of the options exactly" : "Expected answer..."}
              value={questionFormData.answer}
              onChange={(e) => setQuestionFormData({ ...questionFormData, answer: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Points</label>
              <input
                type="number"
                min="1"
                className="w-20 rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                value={questionFormData.points}
                onChange={(e) => setQuestionFormData({ ...questionFormData, points: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Order</label>
              <input
                type="number"
                min="1"
                className="w-20 rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                value={questionFormData.order}
                onChange={(e) => setQuestionFormData({ ...questionFormData, order: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1" onClick={handleCreateQuestion}>Add Question</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowQuestionModal(false)}>Cancel</Button>
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
