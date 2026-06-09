import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { ExamStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const SYSTEM_TEACHER_EMAIL = "system-admin@eduassist.local";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { email: session.user.email },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { id: examId } = await params;
    const body = await req.json();
    const answers: Record<string, string> = body.answers || {};

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true, createdBy: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (
      exam.status !== ExamStatus.PUBLISHED ||
      exam.dueDate.getTime() > Date.now()
    ) {
      return NextResponse.json(
        { error: "Exam is not available yet" },
        { status: 403 }
      );
    }

    const existing = await prisma.enrolledExam.findFirst({
      where: { studentId: student.id, examId },
    });

    const isOpenAccess =
      exam.createdBy?.email === SYSTEM_TEACHER_EMAIL;

    if (
      !isOpenAccess &&
      existing?.status !== "approved" &&
      existing?.status !== "completed"
    ) {
      return NextResponse.json(
        { error: "Exam access not approved" },
        { status: 403 }
      );
    }

    const questions = (exam.questions || []).sort((a, b) => a.order - b.order);

    let correct = 0;

    for (const q of questions) {
      const qId = String(q.order);
      const submitted = answers[qId];

      if (!submitted) continue;

      // stored answer is option text
      if (q.answer && submitted === q.answer) {
        correct++;
      }
    }

    const total = questions.length || 1;
    const score = Math.round((correct / total) * 100);

    let recordId: string;

    if (existing) {
      const updated = await prisma.enrolledExam.update({
        where: { id: existing.id },
        data: { score, status: "completed", completedAt: new Date() },
      });

      recordId = updated.id;
    } else {
      const created = await prisma.enrolledExam.create({
        data: {
          title: exam.title,
          studentId: student.id,
          examId: exam.id,
          score,
          status: "completed",
          completedAt: new Date(),
        },
      });

      recordId = created.id;
    }

    return NextResponse.json({ attemptId: recordId, score });
  } catch (error) {
    console.error("Submit exam error:", error);
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}
