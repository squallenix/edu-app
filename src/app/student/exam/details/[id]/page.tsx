"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  FileText,
  BookOpen,
  ChevronLeft,
  Play,
} from "lucide-react";

interface Exam {
  _id: string;
  title: string;
  duration: number;
  availableAt: string;
  canTake: boolean;
  totalMarks: number;
  questionCount: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch exam");
  }

  const data = await response.json();

  // Support both:
  // { data: {...} }
  // and
  // { ... }
  return data.data || data;
};

export default function ExamDetailPage() {
  const router = useRouter();
  const params = useParams();

  const examId = params.id as string;

  const {
    data: exam,
    error,
    isLoading,
  } = useSWR<Exam>(
    examId ? `/api/exams/${examId}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading exam...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-red-600">
          Failed to load exam details.
        </p>
      </div>
    );
  }

  const handleStart = () => {
    if (!exam.canTake) return;

    router.push(`/student/exam/take/${exam._id}`);
  };

  const availableAt = new Date(exam.availableAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Exam Info Card */}
        <div className="bg-card rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <BookOpen className="w-8 h-8" />
            </div>

            <div>
              <h1 className="mb-1">{exam.title}</h1>
              <p className="text-muted-foreground">
                Multiple Choice Questions
              </p>
            </div>
          </div>

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-accent/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3>Questions</h3>
              </div>

              <p className="text-2xl">
                {exam.questionCount}
              </p>

              <p className="text-sm text-muted-foreground">
                Multiple choice
              </p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3>Duration</h3>
              </div>

              <p className="text-2xl">
                {exam.duration} min
              </p>

              <p className="text-sm text-muted-foreground">
                Time limit
              </p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-500" />
                <h3>Total Points</h3>
              </div>

              <p className="text-2xl">
                {exam.totalMarks}
              </p>

              <p className="text-sm text-muted-foreground">
                {exam.questionCount > 0
                  ? `${Math.round(
                      exam.totalMarks /
                        exam.questionCount
                    )} pts each`
                  : "Points"}
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-border bg-accent/40 p-4">
            <h3 className="mb-1">Available From</h3>
            <p className="text-muted-foreground">
              {availableAt.toLocaleDateString()} at{" "}
              {availableAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="mb-3">Instructions</h3>

            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  You have {exam.duration} minutes to
                  complete all {exam.questionCount} questions
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  Each question has only one correct answer
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  You can navigate between questions freely
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  The exam will auto-submit when time runs
                  out
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  Make sure you have a stable internet
                  connection
                </span>
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!exam.canTake}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            <span>
              {exam.canTake
                ? "Start Exam"
                : "Not Available Yet"}
            </span>
          </button>

          {/* Warning */}
          <p className="text-center mt-4 text-sm text-muted-foreground">
            Once you start, the timer will begin immediately
          </p>
        </div>
      </div>
    </div>
  );
}
