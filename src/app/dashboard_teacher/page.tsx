"use client";

import useSWR from "swr";
import {
  BookOpen,
  FileText,
  Users,
  Trophy,
  PlusCircle,
  LogOut,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TeacherDashboard() {
  const email = "teacher@test.com";

  const { data, isLoading } = useSWR(
    `/api/teacher/dashboard?email=${email}`,
    fetcher
  );

  if (isLoading) return <p>Loading...</p>;

  const exams = data?.createdExams || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="p-4 flex justify-between border-b">
        <div className="flex items-center gap-2">
          <BookOpen />
          <div>
            <h1>Teacher Dashboard</h1>
            <p>{email}</p>
          </div>
        </div>

        <button>
          <LogOut />
        </button>
      </header>

      <main className="p-8">
        <h2>My Exams</h2>

        <button className="flex items-center gap-2">
          <PlusCircle /> Create Exam
        </button>

        {exams.map((exam: any) => (
          <div key={exam.id} className="p-4 border mt-2">
            <h4>{exam.title}</h4>
            <p>{exam.studentsCount} students</p>
          </div>
        ))}
      </main>
    </div>
  );
}