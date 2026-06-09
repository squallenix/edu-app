import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { ExamStatus } from "@/generated/prisma/enums";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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

    if (session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email: session.user.email },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    const { id } = await params;
    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam || exam.createdById !== teacher.id) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    const status =
      exam.status === ExamStatus.PUBLISHED
        ? ExamStatus.CLOSED
        : ExamStatus.PUBLISHED;

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Toggle exam status error:", error);

    return NextResponse.json(
      { error: "Failed to update exam status" },
      { status: 500 }
    );
  }
}
