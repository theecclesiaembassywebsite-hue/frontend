"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { intentionalityClass } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import {
  GraduationCap, PlayCircle, FileText, CheckCircle, Lock, Award, Calendar,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  videoUrl?: string;
  completed: boolean;
}

interface LiveSession {
  id: string;
  title: string;
  date: string;
  time: string;
}

export default function IntentionalityClassPage() {
  const { success, error } = useToast();
  const [enrolled, setEnrolled] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [completingModule, setCompletingModule] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const courses = await intentionalityClass.getMyCourses();
      if (courses.length > 0) {
        const course = courses[0];
        setEnrolled(true);
        setCourseId(course.id);
        loadModules(course.id);
        loadLiveSessions(course.id);
      }
    } catch (err) {
      error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function loadModules(id: string) {
    try {
      const modulesData = await intentionalityClass.getModules(id);
      setModules(modulesData);
    } catch (err) {
      error("Failed to load modules");
    }
  }

  async function loadLiveSessions(id: string) {
    try {
      const sessions = await intentionalityClass.getLiveSessions(id);
      setLiveSessions(sessions);
    } catch (err) {
      console.error("Failed to load live sessions");
    }
  }

  async function handleEnroll() {
    try {
      setLoading(true);
      await intentionalityClass.enroll("intentionality-class");
      setEnrolled(true);
      success("Enrolled successfully!");
      loadCourses();
    } catch (err) {
      error("Failed to enroll");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteModule(moduleId: string) {
    try {
      setCompletingModule(moduleId);
      await intentionalityClass.completeModule(moduleId);
      success("Module marked as complete!");
      if (courseId) {
        loadModules(courseId);
      }
    } catch (err) {
      error("Failed to complete module");
    } finally {
      setCompletingModule(null);
    }
  }

  const completedCount = modules.filter((m) => m.completed).length;
  const progress = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  return (
    <ProtectedRoute>
      <>
        <section className="relative flex items-center justify-center py-24 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
          <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
          <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
            <GraduationCap className="mx-auto h-12 w-12 text-white/80 mb-3" />
            <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
              Intentionality Class
            </h1>
            <h6 className="mt-3 font-serif text-lg font-light text-off-white">
              Service Readiness — Prepare to serve in the church
            </h6>
          </div>
        </section>

        {!enrolled ? (
          <SectionWrapper variant="white">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-[28px] font-bold text-slate">
                About the Course
              </h2>
              <p className="mt-4 font-body text-base text-gray-text leading-relaxed">
                The Intentionality Class is a 6-module course designed for members
                who want to serve actively in The Ecclesia Embassy. You will learn
                about your identity, the church&apos;s vision, ministry ethics, and
                practical service skills through video lessons, written materials,
                and live teaching sessions.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-[8px] bg-off-white p-4">
                  <p className="font-heading text-2xl font-bold text-purple">6</p>
                  <p className="text-[11px] text-gray-text">Modules</p>
                </div>
                <div className="rounded-[8px] bg-off-white p-4">
                  <p className="font-heading text-2xl font-bold text-purple">1</p>
                  <p className="text-[11px] text-gray-text">Final Exam</p>
                </div>
                <div className="rounded-[8px] bg-off-white p-4">
                  <p className="font-heading text-2xl font-bold text-purple">1</p>
                  <p className="text-[11px] text-gray-text">Certificate</p>
                </div>
              </div>
              <Button
                variant="giving"
                className="mt-8"
                onClick={handleEnroll}
                disabled={loading}
              >
                {loading ? "Enrolling..." : "Enroll in the Intentionality Class"}
              </Button>
            </div>
          </SectionWrapper>
        ) : (
          <>
            {/* Progress */}
            <SectionWrapper variant="white" className="!py-8">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-heading text-lg font-bold text-slate">
                    Your Progress
                  </h2>
                  <span className="font-heading text-sm font-bold text-purple">
                    {progress}% Complete
                  </span>
                </div>
                <div className="h-3 rounded-full bg-off-white overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple to-purple-vivid transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-body-small">
                  {completedCount} of {modules.length} modules completed
                </p>
              </div>
            </SectionWrapper>

            {/* Module List */}
            <SectionWrapper variant="off-white" className="!pt-4">
              <div className="mx-auto max-w-3xl space-y-3">
                {loading ? (
                  <SkeletonGroup count={3} variant="card" />
                ) : modules.length > 0 ? (
                  modules.map((mod, i) => {
                    const isUnlocked = i === 0 || modules[i - 1]?.completed;
                    const isActive = activeModule === mod.id;

                    return (
                      <div key={mod.id}>
                        <button
                          onClick={() => isUnlocked && setActiveModule(isActive ? null : mod.id)}
                          disabled={!isUnlocked}
                          className={`w-full flex items-center gap-4 rounded-[8px] border bg-white p-4 text-left transition-shadow ${
                            isUnlocked ? "border-gray-border shadow-sm hover:shadow-md cursor-pointer" : "border-gray-border/50 opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            mod.completed ? "bg-success" : isUnlocked ? "bg-purple" : "bg-gray-text/30"
                          }`}>
                            {mod.completed ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : isUnlocked ? (
                              <PlayCircle className="h-5 w-5 text-white" />
                            ) : (
                              <Lock className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm font-bold text-slate">
                              {mod.title}
                            </p>
                            <p className="text-[11px] text-gray-text">
                              {mod.completed ? "Completed" : isUnlocked ? "In Progress" : "Locked"}
                            </p>
                          </div>
                        </button>

                        {/* Expanded module content */}
                        {isActive && isUnlocked && (
                          <div className="mt-2 ml-14 space-y-4 rounded-[8px] border border-gray-border bg-white p-5">
                            {mod.videoUrl && (
                              <div className="aspect-video overflow-hidden rounded-[8px] bg-near-black">
                                <iframe
                                  src={`https://www.youtube.com/embed/${mod.videoUrl}`}
                                  title={mod.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="h-full w-full"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <button className="flex items-center gap-1 text-xs font-heading font-semibold text-purple-vivid hover:underline">
                                <FileText size={14} /> Download PDF Materials
                              </button>
                            </div>
                            {!mod.completed && (
                              <Button
                                variant="primary"
                                className="text-xs py-2 min-w-0"
                                disabled={completingModule === mod.id}
                                onClick={() => handleCompleteModule(mod.id)}
                              >
                                <CheckCircle size={14} className="mr-1" />
                                {completingModule === mod.id ? "Marking..." : "Mark as Complete"}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : null}

                {/* Exam */}
                <div className={`flex items-center gap-4 rounded-[8px] border bg-white p-4 ${
                  completedCount === modules.length ? "border-purple shadow-sm" : "border-gray-border/50 opacity-60"
                }`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    completedCount === modules.length ? "bg-purple" : "bg-gray-text/30"
                  }`}>
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-sm font-bold text-slate">Final Examination</p>
                    <p className="text-[11px] text-gray-text">
                      {completedCount === modules.length
                        ? "All modules complete — you may now take the exam"
                        : "Complete all modules to unlock the exam"}
                    </p>
                  </div>
                  {completedCount === modules.length && (
                    <Button variant="giving" className="text-xs py-2 px-4 min-w-0">
                      Take Exam
                    </Button>
                  )}
                </div>
              </div>
            </SectionWrapper>

            {/* Live Sessions */}
            {liveSessions.length > 0 && (
              <SectionWrapper variant="white">
                <div className="mx-auto max-w-3xl">
                  <h2 className="font-heading text-xl font-bold text-slate mb-4">
                    Upcoming Live Sessions
                  </h2>
                  <div className="space-y-3">
                    {liveSessions.map((s) => (
                      <div key={s.id} className="flex items-center gap-4 rounded-[8px] border border-gray-border bg-off-white p-4">
                        <Calendar className="h-5 w-5 text-purple shrink-0" />
                        <div>
                          <p className="font-heading text-sm font-bold text-slate">{s.title}</p>
                          <p className="text-[11px] text-gray-text">{s.date} at {s.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionWrapper>
            )}
          </>
        )}
      </>
    </ProtectedRoute>
  );
}
