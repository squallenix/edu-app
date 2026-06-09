"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  ChevronLeft,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Student {
  _id: string;
  name: string;
  email: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
}

interface ExamAccess {
  _id: string;
  examTitle: string;
  examDate: string;
  totalQuestions: number;
  students: Student[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch");
  }

  return res.json();
};

export default function StudentAccessManagement() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(
    "/api/teacher/exam-access",
    fetcher
  );

  const examsWithAccess: ExamAccess[] =
    data?.data || [];

  const handleApprove = async (
    examId: string,
    studentId: string
  ) => {
    try {
      const res = await fetch(
        `/api/teacher/exam-access/${examId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            studentId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to approve request"
        );
      }

      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (
    examId: string,
    studentId: string
  ) => {
    try {
      const res = await fetch(
        `/api/teacher/exam-access/${examId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            studentId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to reject request"
        );
      }

      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredExams = examsWithAccess.map(
    (exam) => ({
      ...exam,
      students: exam.students.filter(
        (student) =>
          student.name
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||
          student.email
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
      ),
    })
  );

  const displayExams = searchQuery
    ? filteredExams
    : examsWithAccess;

  const getStatusCounts = (
    students: Student[]
  ) => ({
    pending: students.filter(
      (s) => s.status === "pending"
    ).length,
    approved: students.filter(
      (s) => s.status === "approved"
    ).length,
    rejected: students.filter(
      (s) => s.status === "rejected"
    ).length,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <p>Loading access requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        Failed to load access requests.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <button
          onClick={() =>
            router.back()
          }
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>
            Back
          </span>
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <Users className="w-8 h-8" />
            </div>

            <div>
              <h1 className="mb-1">
                Student Access
                Management
              </h1>
              <p className="text-muted-foreground">
                Manage student
                requests for your
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
                setSearchQuery(
                  e.target.value
                )
              }
              placeholder="Search students by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>
        </div>

        {/* Exams */}
        <div className="space-y-6">
          {displayExams.map((exam) => {
            const counts =
              getStatusCounts(
                exam.students
              );

            const isExpanded =
              selectedExam ===
              exam._id;

            return (
              <div
                key={exam._id}
                className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
              >
                {/* Exam Header */}
                <div
                  onClick={() =>
                    setSelectedExam(
                      isExpanded
                        ? null
                        : exam._id
                    )
                  }
                  className="p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h2 className="mb-2">
                        {
                          exam.examTitle
                        }
                      </h2>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Date:{" "}
                          {
                            exam.examDate
                          }
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {
                            exam.totalQuestions
                          }{" "}
                          questions
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {
                            exam.students
                              .length
                          }{" "}
                          requests
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm">
                      <Clock className="w-4 h-4" />
                      <span>
                        {
                          counts.pending
                        }{" "}
                        Pending
                      </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {
                          counts.approved
                        }{" "}
                        Approved
                      </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>
                        {
                          counts.rejected
                        }{" "}
                        Rejected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Students */}
                {isExpanded && (
                  <div className="border-t border-border bg-accent/20">
                    <div className="p-6 space-y-3">
                      {exam.students
                        .length >
                      0 ? (
                        exam.students.map(
                          (
                            student
                          ) => (
                            <div
                              key={
                                student._id
                              }
                              className="bg-card rounded-lg p-4 border border-border"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="mb-1">
                                    {
                                      student.name
                                    }
                                  </h4>

                                  <p className="text-sm text-muted-foreground mb-2">
                                    {
                                      student.email
                                    }
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    Requested
                                    on:{" "}
                                    {
                                      student.requestDate
                                    }
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {student.status ===
                                    "pending" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleApprove(
                                            exam._id,
                                            student._id
                                          )
                                        }
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>
                                          Approve
                                        </span>
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleReject(
                                            exam._id,
                                            student._id
                                          )
                                        }
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        <span>
                                          Reject
                                        </span>
                                      </button>
                                    </>
                                  )}

                                  {student.status ===
                                    "approved" && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                                      <CheckCircle className="w-4 h-4" />
                                      <span>
                                        Approved
                                      </span>
                                    </div>
                                  )}

                                  {student.status ===
                                    "rejected" && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                                      <XCircle className="w-4 h-4" />
                                      <span>
                                        Rejected
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {searchQuery
                            ? "No students match your search"
                            : "No access requests for this exam"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {displayExams.length ===
          0 && (
          <div className="bg-card rounded-2xl shadow-lg border border-border p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />

            <h3 className="mb-2">
              No Exams Found
            </h3>

            <p className="text-muted-foreground">
              You haven&apos;t created
              any exams yet or
              there are no access
              requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
