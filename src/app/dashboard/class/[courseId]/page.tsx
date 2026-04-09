"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, BookOpen, CheckCircle, Lock, Play, FileText,
  ChevronRight, AlertCircle, Send,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { intentionalityClass } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface Module {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  content?: string;
  order: number;
  completed: boolean;
  unlocked: boolean;
}

interface ExamQuestion {
  id: string;
  question: string;
  type: "MCQ" | "SHORT_ANSWER";
  options?: string[];
  points: number;
  order: number;
}

function CourseContent({ courseId }: { courseId: string }) {
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get("enrollmentId") || "";
  const { success, error: showError } = useToast();

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [completing, setCompleting] = useState(false);

  // Exam state
  const [showExam, setShowExam] = useState(false);
  const [exam, setExam] = useState<{ enrollmentId: string; questions: ExamQuestion[] } | null>(null);
  const [examLoading, setExamLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<{ autoScore: number; totalPoints: number } | null>(null);

  useEffect(() => {
    intentionalityClass.getModules(courseId)
      .then((data) => {
        setModules(data || []);
        const firstUnlocked = (data || []).find((m: Module) => m.unlocked && !m.completed);
        if (firstUnlocked) setActiveModule(firstUnlocked);
        else if (data?.length > 0) setActiveModule(data[0]);
      })
      .catch((err) => showError(err instanceof Error ? err.message : "Failed to load modules"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleCompleteModule = async () => {
    if (!activeModule || !enrollmentId) return;
    setCompleting(true);
    try {
      await intentionalityClass.completeModule(activeModule.id, enrollmentId);
      success("Module completed!");
      // Refresh modules
      const updated = await intentionalityClass.getModules(courseId);
      setModules(updated || []);
      // Auto-advance to next module
      const next = (updated || []).find((m: Module) => m.unlocked && !m.completed);
      if (next) setActiveModule(next);
      else setActiveModule(updated.find((m: Module) => m.id === activeModule.id) || activeModule);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to complete module");
    } finally {
      setCompleting(false);
    }
  };

  const handleStartExam = async () => {
    setExamLoading(true);
    try {
      const data = await intentionalityClass.getExam(courseId);
      setExam(data);
      setShowExam(true);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Complete all modules before taking the exam");
    } finally {
      setExamLoading(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!exam) return;
    const unanswered = exam.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      showError(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }
    setSubmitting(true);
    try {
      const result = await intentionalityClass.submitExam(courseId, {
        enrollmentId: exam.enrollmentId,
        answers,
      });
      setExamResult(result);
      success("Exam submitted!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  const allCompleted = modules.length > 0 && modules.every((m) => m.completed);

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
          <SkeletonGroup count={5} />
        </div>
      </div>
    );
  }

  // Exam view
  if (showExam && exam) {
    if (examResult) {
      const percentage = exam.questions.length > 0
        ? Math.round((examResult.autoScore / examResult.totalPoints) * 100)
        : 0;
      return (
        <div className="bg-off-white min-h-screen">
          <div className="mx-auto max-w-[700px] px-4 py-8 sm:px-6 md:px-8">
            <div className="rounded-[8px] border border-gray-border bg-white p-8 shadow-sm text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-success mb-4" />
              <h2 className="font-heading text-2xl font-bold text-slate mb-2">Exam Submitted!</h2>
              <p className="font-body text-lg text-slate mb-1">
                Score: {examResult.autoScore} / {examResult.totalPoints} ({percentage}%)
              </p>
              <p className="font-body text-sm text-gray-text mb-6">
                Your results have been recorded. Check your dashboard for the final result.
              </p>
              <Link href="/dashboard/class">
                <Button variant="primary">Back to My Courses</Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 md:px-8">
          <button
            onClick={() => setShowExam(false)}
            className="flex items-center gap-2 text-purple-vivid hover:underline mb-6 font-body text-sm"
          >
            <ArrowLeft size={16} /> Back to Modules
          </button>

          <h1 className="font-heading text-2xl font-bold text-slate mb-6">Course Exam</h1>

          <div className="space-y-6">
            {exam.questions.map((q, idx) => (
              <div key={q.id} className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-vivid text-white text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-heading text-sm font-semibold text-slate">{q.question}</p>
                    <p className="font-body text-[11px] text-gray-text mt-1">{q.points} point{q.points !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {q.type === "MCQ" && q.options ? (
                  <div className="space-y-2 ml-10">
                    {q.options.map((option, oi) => (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 rounded-[4px] border px-4 py-3 cursor-pointer transition-colors ${
                          answers[q.id] === option
                            ? "border-purple-vivid bg-lavender"
                            : "border-gray-border hover:bg-off-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={option}
                          checked={answers[q.id] === option}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                          className="accent-purple-vivid"
                        />
                        <span className="font-body text-sm text-slate">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="ml-10">
                    <textarea
                      rows={3}
                      placeholder="Type your answer..."
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-full rounded-[4px] border border-gray-border bg-off-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none resize-y"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              onClick={handleSubmitExam}
              disabled={submitting}
              loading={submitting}
              className="flex items-center gap-2"
            >
              <Send size={16} /> {submitting ? "Submitting..." : "Submit Exam"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Module learning view
  return (
    <div className="bg-off-white min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
        <Link href="/dashboard/class" className="flex items-center gap-2 text-purple-vivid hover:underline mb-6 font-body text-sm">
          <ArrowLeft size={16} /> Back to My Courses
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Module sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-[8px] border border-gray-border bg-white shadow-sm overflow-hidden sticky top-20">
              <div className="bg-purple-vivid px-4 py-3">
                <h2 className="font-heading text-sm font-bold text-white">Modules</h2>
              </div>
              <div className="divide-y divide-gray-border">
                {modules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => mod.unlocked && setActiveModule(mod)}
                    disabled={!mod.unlocked}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeModule?.id === mod.id
                        ? "bg-lavender"
                        : mod.unlocked
                        ? "hover:bg-off-white"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {mod.completed ? (
                      <CheckCircle size={16} className="text-success flex-shrink-0" />
                    ) : mod.unlocked ? (
                      <BookOpen size={16} className="text-purple flex-shrink-0" />
                    ) : (
                      <Lock size={16} className="text-gray-text flex-shrink-0" />
                    )}
                    <span className="font-body text-sm text-slate truncate">{mod.title}</span>
                  </button>
                ))}
              </div>

              {/* Exam button */}
              {allCompleted && (
                <div className="p-4 border-t border-gray-border">
                  <Button
                    variant="primary"
                    className="w-full text-xs py-2"
                    onClick={handleStartExam}
                    disabled={examLoading}
                    loading={examLoading}
                  >
                    <AlertCircle size={14} className="mr-1" />
                    {examLoading ? "Loading..." : "Take Exam"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Module content */}
          <div className="lg:col-span-3">
            {activeModule ? (
              <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate">{activeModule.title}</h2>
                    {activeModule.description && (
                      <p className="font-body text-sm text-gray-text mt-1">{activeModule.description}</p>
                    )}
                  </div>
                  {activeModule.completed && (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-heading font-semibold text-success">
                      <CheckCircle size={12} /> Completed
                    </span>
                  )}
                </div>

                {/* Video */}
                {activeModule.videoUrl && (
                  <div className="mb-6">
                    <div className="aspect-video rounded-[8px] overflow-hidden bg-slate">
                      <iframe
                        src={activeModule.videoUrl}
                        title={activeModule.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* PDF link */}
                {activeModule.pdfUrl && (
                  <div className="mb-6">
                    <a
                      href={activeModule.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-[8px] border border-gray-border bg-off-white px-4 py-3 hover:bg-lavender transition-colors"
                    >
                      <FileText size={20} className="text-purple" />
                      <div>
                        <p className="font-heading text-sm font-semibold text-slate">Download Resource</p>
                        <p className="font-body text-xs text-gray-text">PDF study material</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-text ml-auto" />
                    </a>
                  </div>
                )}

                {/* Text content */}
                {activeModule.content && (
                  <div className="mb-6 font-body text-sm text-slate leading-relaxed whitespace-pre-wrap">
                    {activeModule.content}
                  </div>
                )}

                {/* No content placeholder */}
                {!activeModule.videoUrl && !activeModule.pdfUrl && !activeModule.content && (
                  <div className="mb-6 rounded-[8px] bg-off-white p-8 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-gray-border mb-3" />
                    <p className="font-body text-sm text-gray-text">
                      Content for this module will be available soon.
                    </p>
                  </div>
                )}

                {/* Complete button */}
                {activeModule.unlocked && !activeModule.completed && (
                  <Button
                    variant="primary"
                    onClick={handleCompleteModule}
                    disabled={completing}
                    loading={completing}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {completing ? "Marking..." : "Mark as Complete"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
                <BookOpen className="mx-auto h-10 w-10 text-gray-border mb-3" />
                <p className="font-body text-sm text-gray-text">
                  Select a module from the sidebar to begin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return (
    <ProtectedRoute>
      <CourseContent courseId={courseId} />
    </ProtectedRoute>
  );
}
