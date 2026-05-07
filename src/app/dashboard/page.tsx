"use client";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  Trophy,
  Calendar,
  Clock,
  FileText,
  Users,
  PlusCircle,
  LogOut,
} from "lucide-react";

interface DashboardProps {
  role: "student" | "teacher";
  email: string;
  onLogout: () => void;
  onExamClick: (examTitle: string) => void;
}

export default function Dashboard({
  role,
  email,
  onLogout,
  onExamClick,
}: DashboardProps) {
  const router = useRouter();
  const upcomingExams = [
    {
      id: 1,
      title: "English Literature",
      date: "2026-04-25",
      time: "10:00 AM",
      duration: "30 mins",
    },
    {
      id: 2,
      title: "History Quiz",
      date: "2026-04-26",
      time: "2:00 PM",
      duration: "45 mins",
    },
    {
      id: 3,
      title: "Science Midterm",
      date: "2026-04-28",
      time: "9:00 AM",
      duration: "1.5 hours",
    },
  ];

  const recentExams = [
    {
      id: 1,
      title: "English Literature",
      score: 85,
      date: "2026-04-20",
    },
    {
      id: 2,
      title: "Physics Chapter 3",
      score: 92,
      date: "2026-04-18",
    },
    {
      id: 3,
      title: "Biology Quiz",
      score: 78,
      date: "2026-04-15",
    },
  ];

  const myExams = [
    {
      id: 1,
      title: "Mathematics Final",
      students: 45,
      date: "2026-04-25",
      status: "Published",
    },
    {
      id: 2,
      title: "History Quiz",
      students: 38,
      date: "2026-04-26",
      status: "Published",
    },
    {
      id: 3,
      title: "Physics Midterm",
      students: 0,
      date: null,
      status: "Draft",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                <BookOpen className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">EduAssist</h1>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">
            Welcome back, {role === "student" ? "Student" : "Teacher"}!
          </h2>

          <p className="text-muted-foreground">
            {role === "student"
              ? "Here are your upcoming exams and recent results"
              : "Manage your exams and track student performance"}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {role === "student" ? (
            <>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">Upcoming Exams</h3>
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>

                <p className="mb-1 text-3xl font-bold">
                  {upcomingExams.length}
                </p>

                <p className="text-sm text-muted-foreground">This week</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">Average Score</h3>
                  <Trophy className="h-5 w-5 text-amber-500" />
                </div>

                <p className="mb-1 text-3xl font-bold">85%</p>

                <p className="text-sm text-muted-foreground">
                  Last 5 exams
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">Completed</h3>
                  <ClipboardList className="h-5 w-5 text-green-500" />
                </div>

                <p className="mb-1 text-3xl font-bold">12</p>

                <p className="text-sm text-muted-foreground">Total exams</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">Active Exams</h3>
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>

                <p className="mb-1 text-3xl font-bold">5</p>

                <p className="text-sm text-muted-foreground">Published</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">Total Students</h3>
                  <Users className="h-5 w-5 text-amber-500" />
                </div>

                <p className="mb-1 text-3xl font-bold">156</p>

                <p className="text-sm text-muted-foreground">Enrolled</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">Avg Completion</h3>
                  <Trophy className="h-5 w-5 text-green-500" />
                </div>

                <p className="mb-1 text-3xl font-bold">78%</p>

                <p className="text-sm text-muted-foreground">
                  Class average
                </p>
              </div>
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {role === "student" ? "Upcoming Exams" : "My Exams"}
              </h3>

              {role === "teacher" && (
                <button className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90">
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Exam</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {role === "student"
                ? upcomingExams.map((exam) => (
                    <div
                      key={exam.id}
                      onClick={() => onExamClick(exam.title)}
                      className="cursor-pointer rounded-lg border border-border bg-accent/50 p-4 transition-colors hover:border-primary/50"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="flex-1 font-medium">{exam.title}</h4>

                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                          Upcoming
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{exam.date}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{exam.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                : myExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="cursor-pointer rounded-lg border border-border bg-accent/50 p-4 transition-colors hover:border-primary/50"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="flex-1 font-medium">{exam.title}</h4>

                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            exam.status === "Published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {exam.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{exam.students} students</span>
                        </div>

                        {exam.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{exam.date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">
              {role === "student"
                ? "Recent Results"
                : "Recent Activity"}
            </h3>

            <div className="space-y-3">
              {role === "student" ? (
                recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="rounded-lg border border-border bg-accent/50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="flex-1 font-medium">{exam.title}</h4>

                      <div
                        className={`text-2xl font-bold ${
                          exam.score >= 90
                            ? "text-green-600"
                            : exam.score >= 75
                            ? "text-blue-600"
                            : "text-amber-600"
                        }`}
                      >
                        {exam.score}%
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Completed on {exam.date}
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div className="rounded-lg border border-border bg-accent/50 p-4">
                    <p className="mb-1">
                      45 students completed Mathematics Final
                    </p>

                    <p className="text-sm text-muted-foreground">
                      2 hours ago
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-accent/50 p-4">
                    <p className="mb-1">
                      New student enrolled in your class
                    </p>

                    <p className="text-sm text-muted-foreground">
                      5 hours ago
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-accent/50 p-4">
                    <p className="mb-1">
                      History Quiz published successfully
                    </p>

                    <p className="text-sm text-muted-foreground">
                      1 day ago
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}