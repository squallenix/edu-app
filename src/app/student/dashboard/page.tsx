"use client";

import useSWR from "swr";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  Trophy,
  Calendar,
  Clock,
  LogOut,
  Library,
  Search,
} from "lucide-react";

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch data");
  }

  return response.json();
};

type Exam = {
  id: string;
  title: string;
  dueDate: string;
  time: string;
  duration: number | null;
};

type Result = {
  id: string;
  title: string;
  score: number | null;
  completedAt: string | null;
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data, isLoading, error } = useSWR(
    status === "authenticated"
      ? "/api/student/dashboard"
      : null,
    fetcher
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading session...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Please login first.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {error.message}
      </div>
    );
  }

  const email = session?.user?.email ?? "";

  const upcomingExams: Exam[] =
    data?.upcomingExams ?? [];

  const recentExams: Result[] =
    data?.recentResults ?? [];

  const gradedExams = recentExams.filter(
    (exam) => exam.score !== null
  );

  const averageScore =
    gradedExams.length > 0
      ? Math.round(
          gradedExams.reduce(
            (sum, exam) => sum + (exam.score ?? 0),
            0
          ) / gradedExams.length
        )
      : 0;

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
                  {email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  router.push("/student/exams")
                }
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Browse Exams</span>
              </button>

              <button
                onClick={() =>
                  router.push("/student/materials")
                }
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Library className="w-4 h-4" />
                <span>Study Materials</span>
              </button>

              <button
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                  })
                }
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back,{" "}
            {session?.user?.name ?? "Student"}!
          </h2>

          <p className="text-muted-foreground">
            Here are your upcoming exams and recent
            results.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                Upcoming Exams
              </h3>

              <Calendar className="w-5 h-5 text-blue-500" />
            </div>

            <p className="text-3xl font-bold">
              {upcomingExams.length}
            </p>

            <p className="text-sm text-muted-foreground">
              Scheduled
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                Average Score
              </h3>

              <Trophy className="w-5 h-5 text-amber-500" />
            </div>

            <p className="text-3xl font-bold">
              {averageScore}%
            </p>

            <p className="text-sm text-muted-foreground">
              Graded exams
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                Completed
              </h3>

              <ClipboardList className="w-5 h-5 text-green-500" />
            </div>

            <p className="text-3xl font-bold">
              {recentExams.length}
            </p>

            <p className="text-sm text-muted-foreground">
              Total exams
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Exams */}
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h3 className="mb-4 font-semibold">
              Upcoming Exams
            </h3>

            <div className="space-y-3">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4>{exam.title}</h4>

                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Upcoming
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(
                          exam.dueDate
                        ).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(
                          `1970-01-01T${exam.time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {exam.duration !== null && (
                        <div>
                          Duration: {exam.duration} mins
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No upcoming exams.
                </p>
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h3 className="mb-4 font-semibold">
              Recent Results
            </h3>

            <div className="space-y-3">
              {recentExams.length > 0 ? (
                recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4>{exam.title}</h4>

                      <div
                        className={`text-2xl font-bold ${
                          (exam.score ?? 0) >= 90
                            ? "text-green-600"
                            : (exam.score ?? 0) >= 75
                            ? "text-blue-600"
                            : "text-amber-600"
                        }`}
                      >
                        {exam.score ?? "-"}%
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Completed on{" "}
                      {exam.completedAt
                        ? new Date(
                            exam.completedAt
                          ).toLocaleDateString()
                        : "Not completed"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No completed exams yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}