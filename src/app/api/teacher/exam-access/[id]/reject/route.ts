import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const studentId = body.studentId as string;
    const { id: examId } = await params;

    const teacher = await prisma.teacher.findUnique({ where: { email: session.user.email } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam || exam.createdById !== teacher.id) {
      return NextResponse.json({ error: "Exam not found or not owned" }, { status: 404 });
    }

    const enrollment = await prisma.enrolledExam.findFirst({ where: { examId, studentId } });
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    await prisma.enrolledExam.update({ where: { id: enrollment.id }, data: { status: "rejected" } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject error:", error);
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
  }
}
