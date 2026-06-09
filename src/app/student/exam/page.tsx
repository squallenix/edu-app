"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Clock,
  FileText,
  Lock,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";

interface Exam {
  _id: string;
  title: string;
  subject: string;
  creator: string;
  creatorType: "admin" | "teacher";
  questions: number;
  duration: number;
  date: string;
  availableAt?: string | null;
  hasAccess: boolean;
  requestPending?: boolean;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load exams");
  }

  const data = await response.json();

  return data.data || data;
};

export default function ExamSearchPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [requestingIds, setRequestingIds] = useState<
    string[]
  >([]);

  const {
    data: exams = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Exam[]>("/api/exams", fetcher);

  const filteredExams = exams.filter(
    (exam) =>
      exam.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      exam.subject
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      exam.creator
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const adminExams = filteredExams.filter(
    (exam) => exam.creatorType === "admin"
  );

  const teacherExams = filteredExams.filter(
    (exam) => exam.creatorType === "teacher"
  );

  const formatAvailableAt = (value?: string | null) => {
    if (!value) {
      return "Not scheduled";
    }

    const availableAt = new Date(value);

    return `${availableAt.toLocaleDateString()} at ${availableAt.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  };

  const handleRequestAccess = async (
    examId: string
  ) => {
    try {
      setRequestingIds((prev) => [...prev, examId]);

      const res = await fetch(
        `/api/exams/${examId}/request-access`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to request access");
      }

      mutate();
    } catch (error) {
      console.error(error);
    } finally {
      setRequestingIds((prev) =>
        prev.filter((id) => id !== examId)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        Loading exams...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-12 text-red-600">
        Failed to load exams.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <Search className="w-8 h-8" />
            </div>

            <div>
              <h1 className="mb-1">
                Browse Exams
              </h1>

              <p className="text-muted-foreground">
                Search and enroll in available
                exams
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search by exam title, subject, or instructor..."
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>
        </div>

        {/* Open Access Exams */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>

            <div>
              <h2>Open Access Exams</h2>

              <p className="text-sm text-muted-foreground">
                Created by administrators -
                Available to all students
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminExams.length > 0 ? (
              adminExams.map((exam) => (
                <div
                  key={exam._id}
                  className="bg-card rounded-xl p-5 shadow-sm border border-border hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/student/exam/details/${exam._id}`
                    )
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="mb-1">
                        {exam.title}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {exam.subject}
                      </p>
                    </div>

                    <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>
                        {exam.questions} questions
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {exam.duration} minutes
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>
                        Opens:{" "}
                        {formatAvailableAt(
                          exam.availableAt ??
                            exam.date
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {exam.creator}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No admin exams found
              </div>
            )}
          </div>
        </div>

        {/* Teacher Exams */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>

            <div>
              <h2>Teacher Exams</h2>

              <p className="text-sm text-muted-foreground">
                Permission required from
                instructor to access
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherExams.length > 0 ? (
              teacherExams.map((exam) => (
                <div
                  key={exam._id}
                  className="bg-card rounded-xl p-5 shadow-sm border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="mb-1">
                        {exam.title}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {exam.subject}
                      </p>
                    </div>

                    <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>
                        {exam.questions} questions
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {exam.duration} minutes
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>
                        Opens:{" "}
                        {formatAvailableAt(
                          exam.availableAt ??
                            exam.date
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {exam.creator}
                    </span>

                    {exam.hasAccess ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/student/exam/details/${exam._id}`
                          )
                        }
                        className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                      >
                        View Exam
                      </button>
                    ) : exam.requestPending ||
                      requestingIds.includes(
                        exam._id
                      ) ? (
                      <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                        Request Pending
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleRequestAccess(
                            exam._id
                          )
                        }
                        className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                      >
                        Request Access
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No teacher exams found
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="mb-2 text-blue-900">
            How to Access Exams
          </h3>

          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
              <span>
                <strong>
                  Open Access Exams:
                </strong>{" "}
                Created by administrators and
                available to all students.
              </span>
            </li>

            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 text-amber-600" />
              <span>
                <strong>Teacher Exams:</strong>{" "}
                Require instructor approval
                before access is granted.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
