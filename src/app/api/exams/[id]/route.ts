import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { ExamStatus } from "@/generated/prisma/enums";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SYSTEM_TEACHER_EMAIL = "system-admin@eduassist.local";

function isExamAvailable(dueDate: Date) {
  return dueDate.getTime() <= Date.now();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: examId } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true, createdBy: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.status !== ExamStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Exam is not active" },
        { status: 403 }
      );
    }

    const isOpenAccess =
      exam.createdBy?.email === SYSTEM_TEACHER_EMAIL;

    if (!isOpenAccess) {
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

      const enrollment =
        await prisma.enrolledExam.findFirst({
          where: {
            examId,
            studentId: student.id,
            status: {
              in: ["approved", "completed"],
            },
          },
        });

      if (!enrollment) {
        return NextResponse.json(
          { error: "Exam access not approved" },
          { status: 403 }
        );
      }
    }

    const questions = (exam.questions || [])
      .sort((a, b) => a.order - b.order)
      .map((q) => ({
        id: q.order, // expose numeric id for the client navigator
        question: q.content,
        options: q.options ? JSON.parse(q.options) : [],
      }));

    const totalMarks = questions.length; // 1 point each by default

    return NextResponse.json({
      data: {
        _id: exam.id,
        title: exam.title,
        duration: exam.duration ?? 0,
        availableAt: exam.dueDate.toISOString(),
        canTake: isExamAvailable(exam.dueDate),
        totalMarks,
        questionCount: questions.length,
        questions,
      },
    });
  } catch (error) {
    console.error("Fetch exam by id error:", error);
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}
