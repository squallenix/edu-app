"use client";

import useSWR from "swr";
import {
  BookOpen,
  ClipboardList,
  Trophy,
  Calendar,
  Clock,
  LogOut,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function StudentDashboard() {
  const email = "student@test.com"; // later from auth/session

  const { data, isLoading } = useSWR(
    `/api/student/dashboard?email=${email}`,
    fetcher
  );

  if (isLoading) return <p>Loading...</p>;

  const upcomingExams = data?.exams || [];
  const recentExams = data?.results || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-card border-b p-4 flex justify-between">
        <div className="flex items-center gap-3">
          <BookOpen />
          <div>
            <h1>EduAssist</h1>
            <p>{email}</p>
          </div>
        </div>

        <button>
          <LogOut />
        </button>
      </header>

      <main className="p-8">
        <h2>Student Dashboard</h2>

        {/* Upcoming Exams */}
        <div>
          {upcomingExams.map((exam: any) => (
            <div key={exam.id} className="p-4 border">
              <h4>{exam.title}</h4>
              <p>{exam.date}</p>
            </div>
          ))}
        </div>

        {/* Results */}
        <div>
          {recentExams.map((res: any) => (
            <div key={res.id}>
              {res.title} - {res.score}%
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}