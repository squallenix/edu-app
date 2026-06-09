import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { ExamStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
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

    const { id: examId } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    if (exam.status !== ExamStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Exam is not active" },
        { status: 403 }
      );
    }

    const existing = await prisma.enrolledExam.findFirst({
      where: { studentId: student.id, examId },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Request already exists" });
    }

    await prisma.enrolledExam.create({
      data: {
        title: exam.title,
        studentId: student.id,
        examId: exam.id,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Request access error:", error);

    return NextResponse.json(
      { error: "Failed to request access" },
      { status: 500 }
    );
  }
}
