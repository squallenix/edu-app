import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { ExamStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

function formatTimeForInput(date: Date | null) {
  if (!date) {
    return null;
  }

  return date.toISOString().slice(11, 19);
}

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
      .filter(
        (e) =>
          e.status === "approved" &&
          e.exam.status === ExamStatus.PUBLISHED &&
          e.score === null
      )
      .map((e) => ({
        id: e.exam.id,
        title: e.exam.title,
        dueDate: e.exam.dueDate.toISOString(),
        time: formatTimeForInput(e.exam.time),
        duration: e.exam.duration,
        canTake: e.exam.dueDate.getTime() <= Date.now(),
      })),

    recentResults: enrollments
      .filter((e) => e.score !== null)
      .map((e) => ({
        id: e.exam.id,
        title: e.exam.title,
        score: e.score,
        completedAt: e.completedAt
          ? e.completedAt.toISOString()
          : null,
      })),
  });
}
