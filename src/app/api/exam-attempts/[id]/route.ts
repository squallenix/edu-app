import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getGrade(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";

  return "F";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { email: session.user.email },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const { id } = await params;

    const attempt = await prisma.enrolledExam.findUnique({
      where: { id },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!attempt || attempt.studentId !== student.id) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    const percentage = Math.round(attempt.score ?? 0);
    const totalQuestions = attempt.exam.questions.length;
    const correctAnswers = Math.round(
      (percentage / 100) * totalQuestions
    );

    return NextResponse.json({
      data: {
        examTitle: attempt.exam.title,
        score: percentage,
        percentage,
        grade: getGrade(percentage),
        passed: percentage >= 60,
        totalQuestions,
        correctAnswers,
        questions: [],
      },
    });
  } catch (error) {
    console.error("Fetch exam result error:", error);

    return NextResponse.json(
      { error: "Failed to load result" },
      { status: 500 }
    );
  }
}
