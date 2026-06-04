"use client";

import useSWR from "swr";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  FileText,
  Users,
  Trophy,
  Calendar,
  PlusCircle,
  LogOut,
} from "lucide-react";
import router from "next/router";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard");
  }

  return res.json();
};

type TeacherExam = {
  id: string;
  title: string;
  students: number;
  date: string | null;
  status: string;
};

type DashboardResponse = {
  teacherName: string;
  email: string;

  stats: {
    activeExams: number;
    totalStudents: number;
    avgCompletion: number;
  };

  exams: TeacherExam[];
};

export default function TeacherDashboard() {
  const { data, isLoading, error } =
    useSWR<DashboardResponse>(
      "/api/teacher/dashboard",
      fetcher
    );

  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Failed to load dashboard
      </div>
    );
  }

  const exams = data.exams ?? [];

  const activeExams =
    data.stats?.activeExams ?? 0;

  const totalStudents =
    data.stats?.totalStudents ?? 0;

  const avgCompletion =
    data.stats?.avgCompletion ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  EduAssist
                </h1>

                <p className="text-sm text-muted-foreground">
                  {data.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {data.teacherName}!
          </h2>

          <p className="text-muted-foreground">
            Manage your exams and track student
            performance
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                Active Exams
              </h3>

              <FileText className="w-5 h-5 text-blue-500" />
            </div>

            <p className="text-3xl font-bold">
              {activeExams}
            </p>

            <p className="text-sm text-muted-foreground">
              Published
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                Total Students
              </h3>

              <Users className="w-5 h-5 text-amber-500" />
            </div>

            <p className="text-3xl font-bold">
              {totalStudents}
            </p>

            <p className="text-sm text-muted-foreground">
              Enrolled
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                Avg Completion
              </h3>

              <Trophy className="w-5 h-5 text-green-500" />
            </div>

            <p className="text-3xl font-bold">
              {avgCompletion}%
            </p>

            <p className="text-sm text-muted-foreground">
              Class average
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exams */}
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                My Exams
              </h3>

              <button  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
              onClick={() =>
              router.push("/teacher/exams/create")
                }>
                <PlusCircle className="w-4 h-4" />
                <span>Create Exam</span>
              </button>
            </div>

            {exams.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No exams created yet
              </div>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">
                        {exam.title}
                      </h4>

                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          exam.status ===
                          "Published"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {exam.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {exam.students} students
                        </span>
                      </div>

                      {exam.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {exam.date}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h3 className="mb-4 font-semibold">
              Recent Activity
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-lg border">
                <p className="mb-1">
                  Dashboard connected successfully
                </p>

                <p className="text-sm text-muted-foreground">
                  Live data from Prisma
                </p>
              </div>

              <div className="p-4 rounded-lg border">
                <p className="mb-1">
                  Exams loaded
                </p>

                <p className="text-sm text-muted-foreground">
                  {exams.length} exams found
                </p>
              </div>

              <div className="p-4 rounded-lg border">
                <p className="mb-1">
                  Total enrolled students
                </p>

                <p className="text-sm text-muted-foreground">
                  {totalStudents} students
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}