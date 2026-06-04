import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("[admin/dashboard] session:", session);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Allow when session reports admin role or when the user's email exists in Admin table
    let isAdmin = false;
    if (session.user.role === "admin") {
      isAdmin = true;
    } else if (session.user.email) {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email },
      });

      console.log("[admin/dashboard] admin lookup:", !!admin, session.user.email);

      if (admin) isAdmin = true;
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      students,
      teachers,
      exams,
      recentStudents,
      recentTeachers,
      recentExams,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.exam.count(),

      prisma.student.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.teacher.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.exam.findMany({
        include: {
          createdBy: true,
          questions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const users = [
      ...recentStudents.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: "student",
        joinDate: s.createdAt,
      })),

      ...recentTeachers.map((t) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        role: "teacher",
        joinDate: t.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.joinDate).getTime() -
        new Date(a.joinDate).getTime()
    );

    const examList = recentExams.map(
      (exam) => ({
        id: exam.id,
        title: exam.title,
        creator: exam.createdBy.name,
        questions: exam.questions.length,
        date: exam.dueDate,
      })
    );

    return NextResponse.json({
      stats: {
        totalUsers: students + teachers,
        students,
        teachers,
        totalExams: exams,
      },

      users,
      exams: examList,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load admin dashboard",
      },
      {
        status: 500,
      }
    );
  }
}