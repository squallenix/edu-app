"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Calendar,
  Clock,
} from "lucide-react";

import { ExamData, Question } from "@/app/types/exam";

interface ExamCreationProps {
  role: "admin" | "teacher";
}

export default function ExamCreation({
  role,
}: ExamCreationProps) {
  const router = useRouter();

  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [availableDate, setAvailableDate] = useState("");
  const [availableTime, setAvailableTime] = useState("");
  const [pointsPerQuestion, setPointsPerQuestion] = useState(5);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length <= 1) return;

    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = <Field extends keyof Question>(
    id: number,
    field: Field,
    value: Question[Field]
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (
    questionId: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;

        const options = [...q.options];
        options[optionIndex] = value;

        return {
          ...q,
          options,
        };
      })
    );
  };

  const handleSave = async () => {
    if (!examTitle.trim()) {
      alert("Please enter an exam title");
      return;
    }

    if (!availableDate || !availableTime) {
      alert("Please choose when students can take this exam");
      return;
    }

    if (
      questions.some(
        (q) =>
          !q.question.trim() ||
          q.options.some((opt) => !opt.trim())
      )
    ) {
      alert("Please complete all questions and options");
      return;
    }

    const examData: ExamData = {
      title: examTitle,
      duration,
      availableDate,
      availableTime,
      pointsPerQuestion,
      questions,
    };

    try {
      const response = await fetch("/api/exams", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(examData),
});

      if (!response.ok) {
        throw new Error("Failed to create exam");
      }

      alert("Exam created successfully");

      router.push(`/${role}/dashboard`);
    } catch (error) {
      console.error(error);
      alert("Failed to create exam");
    }
  };

  const totalPoints =
    questions.length * pointsPerQuestion;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            <Save className="w-5 h-5" />
            Save Exam
          </button>
        </div>

        {/* Exam Info */}

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <BookOpen className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Create New Exam
              </h1>

              <p className="text-gray-500">
                Add questions and configure the exam
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">
                Exam title
              </span>

              <input
                value={examTitle}
                onChange={(e) =>
                  setExamTitle(e.target.value)
                }
                placeholder="Exam Title"
                className="w-full border rounded-lg p-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">
                Exam time limit
              </span>

              <input
                type="number"
                value={duration}
                onChange={(e) =>
                  setDuration(Number(e.target.value))
                }
                min={1}
                aria-label="Duration in minutes"
                placeholder="Duration in minutes"
                className="w-full border rounded-lg p-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">
                Points per question
              </span>

              <input
                type="number"
                value={pointsPerQuestion}
                onChange={(e) =>
                  setPointsPerQuestion(
                    Number(e.target.value)
                  )
                }
                min={1}
                aria-label="Points per question"
                placeholder="Points per question"
                className="w-full border rounded-lg p-3"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 text-gray-500" />
                Available date
              </span>

              <input
                type="date"
                value={availableDate}
                onChange={(e) =>
                  setAvailableDate(e.target.value)
                }
                className="w-full border rounded-lg p-3 outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 text-gray-500" />
                Available time
              </span>

              <input
                type="time"
                value={availableTime}
                onChange={(e) =>
                  setAvailableTime(e.target.value)
                }
                className="w-full border rounded-lg p-3 outline-none"
              />
            </label>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p>Total Questions: {questions.length}</p>
            <p>Total Points: {totalPoints}</p>
          </div>
        </div>

        {/* Questions */}

        <div className="space-y-5">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white rounded-xl p-6 shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">
                  Question {index + 1}
                </h2>

                {questions.length > 1 && (
                  <button
                    onClick={() =>
                      removeQuestion(q.id)
                    }
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                )}
              </div>

              <textarea
                value={q.question}
                onChange={(e) =>
                  updateQuestion(
                    q.id,
                    "question",
                    e.target.value
                  )
                }
                placeholder="Question"
                className="w-full border rounded-lg p-3 mb-4"
              />

              {q.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className="flex items-center gap-3 mb-3"
                >
                  <input
                    type="radio"
                    checked={
                      q.correctAnswer === optIndex
                    }
                    onChange={() =>
                      updateQuestion(
                        q.id,
                        "correctAnswer",
                        optIndex
                      )
                    }
                  />

                  <input
                    value={option}
                    onChange={(e) =>
                      updateOption(
                        q.id,
                        optIndex,
                        e.target.value
                      )
                    }
                    placeholder={`Option ${
                      optIndex + 1
                    }`}
                    className="flex-1 border rounded-lg p-3"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          className="mt-6 w-full border-2 border-dashed rounded-xl p-4 flex justify-center items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>
    </div>
  );
}
