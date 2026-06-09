"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import {
  Trophy,
  CheckCircle,
  XCircle,
  Home,
} from "lucide-react";

interface QuestionReview {
  id: string;
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

interface ExamResult {
  examTitle: string;
  score: number;
  percentage: number;
  grade: string;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  questions: QuestionReview[];
}

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load result");
  }

  const data = await response.json();

  return data.data || data;
};

export default function ExamResultPage() {
  const router = useRouter();
  const params = useParams();

  const attemptId = params.id as string;

  const {
    data: result,
    error,
    isLoading,
  } = useSWR<ExamResult>(
    attemptId
      ? `/api/exam-attempts/${attemptId}`
      : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        Loading result...
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex justify-center py-12 text-red-600">
        Failed to load result.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Results Header */}
        <div className="bg-card rounded-2xl shadow-xl p-8 mb-6 border border-border text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              result.passed
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            {result.passed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h1 className="mb-2">
            {result.passed
              ? "Congratulations!"
              : "Exam Complete"}
          </h1>

          <p className="text-muted-foreground mb-6">
            {result.examTitle}
          </p>

          {/* Score Display */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-accent/50 rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Score
              </p>

              <p className="text-3xl">
                {result.percentage}%
              </p>
            </div>

            <div className="bg-accent/50 rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Grade
              </p>

              <p
                className={`text-3xl ${
                  result.passed
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {result.grade}
              </p>
            </div>

            <div className="bg-accent/50 rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Correct
              </p>

              <p className="text-3xl">
                {result.correctAnswers}/
                {result.totalQuestions}
              </p>
            </div>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-card rounded-2xl shadow-xl p-8 mb-6 border border-border">
          <h2 className="mb-6">
            Answer Review
          </h2>

          {result.questions.length > 0 ? (
            <div className="space-y-4">
              {result.questions.map(
              (question, index) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border-2 ${
                    question.isCorrect
                      ? "border-green-200 bg-green-50/50"
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 ${
                        question.isCorrect
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {question.isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="mb-2">
                        <span className="text-muted-foreground">
                          Q{index + 1}:
                        </span>{" "}
                        {question.question}
                      </p>

                      {question.isCorrect ? (
                        <p className="text-sm text-green-600">
                          {question.userAnswer}
                        </p>
                      ) : (
                        <div className="space-y-1 text-sm">
                          <p className="text-red-600">
                            Your answer:{" "}
                            {question.userAnswer ||
                              "Not answered"}
                          </p>

                          <p className="text-green-600">
                            Correct answer:{" "}
                            {question.correctAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Detailed answer review is not available for
              this attempt.
            </p>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={() =>
            router.push("/student/dashboard")
          }
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
        >
          <Home className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
