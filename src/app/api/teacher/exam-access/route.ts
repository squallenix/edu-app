import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email: session.user.email },
      include: {
        createdExams: {
          include: {
            questions: true,
            enrollments: {
              include: { student: true },
              orderBy: { enrolledAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const payload = teacher.createdExams.map((exam) => ({
      _id: exam.id,
      examTitle: exam.title,
      examDate: exam.dueDate ? exam.dueDate.toISOString() : null,
      totalQuestions: exam.questions?.length ?? 0,
      students: exam.enrollments.map((en) => ({
        _id: en.student.id,
        name: en.student.name,
        email: en.student.email,
        requestDate: en.enrolledAt.toISOString(),
        status: (en.status as "pending" | "approved" | "rejected") ?? "pending",
      })),
    }));

    return NextResponse.json({ data: payload });
  } catch (error) {
    console.error("Teacher exam access error:", error);
    return NextResponse.json({ error: "Failed to load access requests" }, { status: 500 });
  }
}
