import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found" },
      { status: 404 }
    );
  }

  const enrollments = await prisma.enrolledExam.findMany({
    where: {
      studentId: student.id,
    },
    include: {
      exam: true,
    },
  });

  return NextResponse.json({
    upcomingExams: enrollments
      .filter((e) => e.status === "pending")
      .map((e) => ({
        id: e.exam.id,
        title: e.exam.title,
        date: e.exam.dueDate,
      })),

    recentResults: enrollments
      .filter((e) => e.score !== null)
      .map((e) => ({
        id: e.exam.id,
        title: e.exam.title,
        score: e.score,
        date: e.completedAt,
      })),
  });
}