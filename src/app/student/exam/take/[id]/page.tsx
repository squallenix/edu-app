"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface Exam {
  _id: string;
  title: string;
  duration: number; // minutes
  availableAt: string;
  canTake: boolean;
  questions: Question[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch exam");
  }

  const data = await res.json();
  return data.data || data;
};

export default function ExamTakingPage() {
  const router = useRouter();
  const params = useParams();

  const examId = params.id as string;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] =
    useState(false);
  const submittedRef = useRef(false);
  const timerInitializedRef = useRef(false);

  const { data: exam, error, isLoading } = useSWR<Exam>(
    examId ? `/api/exams/${examId}` : null,
    fetcher,
    {
      onSuccess: (data) => {
        if (timerInitializedRef.current) {
          return;
        }

        timerInitializedRef.current = true;
        setTimeLeft(data.duration * 60);
      },
    }
  );

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) {
      return;
    }

    submittedRef.current = true;
    setShowSubmitConfirm(false);

    try {
      const res = await fetch(
        `/api/exams/${examId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error || "Failed to submit exam"
        );
      }

      router.push(
        `/student/exam/result/${result.attemptId}`
      );
    } catch (err) {
      submittedRef.current = false;
      console.error(err);
    }
  }, [answers, examId, router]);

  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit, timeLeft]);

  const handleAnswerSelect = (answer: string) => {
    if (!exam) return;

    setAnswers({
      ...answers,
      [exam.questions[currentQuestion].id]: answer,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        Loading exam...
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="flex justify-center py-12 text-red-600">
        Failed to load exam
      </div>
    );
  }

  if (!exam.canTake) {
    const availableAt = new Date(exam.availableAt);

    return (
      <div className="flex justify-center py-12 text-amber-700">
        This exam opens on{" "}
        {availableAt.toLocaleDateString()} at{" "}
        {availableAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        .
      </div>
    );
  }

  const question = exam.questions[currentQuestion];
  const currentAnswer = answers[question.id];
  const answeredCount = Object.keys(answers).length;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-4">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-sm p-4 mb-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2>{exam.title}</h2>

              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of{" "}
                {exam.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Answered
                </p>

                <p className="text-lg">
                  {answeredCount}/
                  {exam.questions.length}
                </p>
              </div>

              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeLeft < 300
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <Clock className="w-5 h-5" />

                <span className="text-xl tabular-nums">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-card rounded-xl shadow-lg p-8 mb-4 border border-border">
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-2">
              Question {currentQuestion + 1}
            </div>

            <h3 className="text-xl">
              {question.question}
            </h3>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  handleAnswerSelect(option)
                }
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  currentAnswer === option
                    ? "border-primary bg-primary/5"
                    : "border-border bg-accent/30 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      currentAnswer === option
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {currentAnswer === option && (
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    )}
                  </div>

                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentQuestion((prev) =>
                Math.max(0, prev - 1)
              )
            }
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentQuestion ===
          exam.questions.length - 1 ? (
            <button
              onClick={() =>
                setShowSubmitConfirm(true)
              }
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentQuestion((prev) =>
                  prev + 1
                )
              }
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigator */}
        <div className="bg-card rounded-xl shadow-sm p-6 mt-4 border border-border">
          <h4 className="mb-4">
            Question Navigator
          </h4>

          <div className="grid grid-cols-10 gap-2">
            {exam.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() =>
                  setCurrentQuestion(index)
                }
                className={`aspect-square rounded-lg border-2 transition-all ${
                  currentQuestion === index
                    ? "border-primary bg-primary text-primary-foreground"
                    : answers[q.id]
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-border bg-accent/30 hover:border-primary/50"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl shadow-2xl p-8 max-w-md w-full border border-border">
            <h3 className="mb-4">
              Submit Exam?
            </h3>

            <p className="text-muted-foreground mb-6">
              You have answered {answeredCount} out of{" "}
              {exam.questions.length} questions.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setShowSubmitConfirm(false)
                }
                className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
