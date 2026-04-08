"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle, Clock, AlertCircle, Award } from "lucide-react";
import Button from "@/components/ui/Button";
import { intentionalityClass } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SkeletonGroup } from "@/components/ui/Skeleton";

interface Enrollment {
  id: string;
  status: string;
  examScore?: number | null;
  examPassed?: boolean | null;
  certificateUrl?: string | null;
  completedAt?: string | null;
  course: {
    id: string;
    title: string;
    description: string;
    passingThreshold: number;
    modules: Array<{ id: string; title: string; order: number }>;
  };
  completions: Array<{ moduleId: string }>;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  IN_PROGRESS: { label: "In Progress", color: "text-warning bg-warning/10", icon: <Clock size={14} /> },
  EXAM_READY: { label: "Exam Ready", color: "text-info bg-info/10", icon: <AlertCircle size={14} /> },
  PASSED: { label: "Passed", color: "text-success bg-success/10", icon: <CheckCircle size={14} /> },
  FAILED: { label: "Failed", color: "text-error bg-error/10", icon: <AlertCircle size={14} /> },
};

function MyClassesContent() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    intentionalityClass.getMyCourses()
      .then((data) => setEnrollments(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
          <SkeletonGroup count={3} variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen">
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-text hover:text-purple transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-slate">My Courses</h1>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-gray-border mb-4" />
            <h3 className="font-heading text-lg font-bold text-slate mb-2">No courses yet</h3>
            <p className="font-body text-sm text-gray-text mb-6">
              Enroll in the Intentionality Class to start your learning journey.
            </p>
            <Link href="/grow/intentionality-class">
              <Button variant="primary">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const totalModules = enrollment.course.modules.length;
              const completedModules = enrollment.completions.length;
              const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
              const status = statusConfig[enrollment.status] || statusConfig.IN_PROGRESS;

              return (
                <div
                  key={enrollment.id}
                  className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-bold text-slate">
                        {enrollment.course.title}
                      </h3>
                      <p className="font-body text-sm text-gray-text mt-1">
                        {enrollment.course.description}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-heading font-semibold ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-xs text-gray-text">
                        {completedModules} of {totalModules} modules completed
                      </span>
                      <span className="font-heading text-xs font-semibold text-slate">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-off-white overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-vivid transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Exam result */}
                  {enrollment.examPassed !== null && enrollment.examPassed !== undefined && (
                    <div className="flex items-center gap-2 mb-4 rounded-[4px] bg-off-white px-3 py-2">
                      <Award size={16} className={enrollment.examPassed ? "text-success" : "text-error"} />
                      <span className="font-body text-sm text-slate">
                        Exam Score: {enrollment.examScore ?? 0} — {enrollment.examPassed ? "Passed" : "Failed"}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/dashboard/class/${enrollment.course.id}?enrollmentId=${enrollment.id}`}>
                      <Button variant="primary" className="text-xs py-2 px-4 min-w-0">
                        {enrollment.status === "EXAM_READY" ? "Take Exam" : "Continue Learning"}
                      </Button>
                    </Link>
                    {enrollment.certificateUrl && (
                      <a href={enrollment.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" className="text-xs py-2 px-4 min-w-0">
                          View Certificate
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyClassesPage() {
  return (
    <ProtectedRoute>
      <MyClassesContent />
    </ProtectedRoute>
  );
}
