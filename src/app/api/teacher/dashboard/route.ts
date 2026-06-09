import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);


    

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const teacher =
      await prisma.teacher.findUnique({
        where: {
          email: session.user.email,
        },
        include: {
          createdExams: {
            include: {
              enrollments: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    if (!teacher) {
      return NextResponse.json(
        {
          error: "Teacher not found",
        },
        {
          status: 404,
        }
      );
    }

    const exams = teacher.createdExams.map(
      (exam) => ({
        id: exam.id,
        title: exam.title,
        students:
          exam.enrollments.length,
        date: exam.dueDate
          ? exam.dueDate
              .toISOString()
              .split("T")[0]
          : null,
        availableAt: exam.dueDate
          ? exam.dueDate.toISOString()
          : null,
        status: exam.status,
      })
    );

    const activeExams = exams.filter(
      (exam) =>
        exam.status === "PUBLISHED"
    ).length;

    const totalStudents = exams.reduce(
      (total, exam) =>
        total + exam.students,
      0
    );

    const completedEnrollments =
      teacher.createdExams.flatMap(
        (exam) => exam.enrollments
      );

    const gradedScores =
      completedEnrollments
        .filter(
          (e) =>
            e.score !== null &&
            e.score !== undefined
        )
        .map((e) => e.score as number);

    const avgCompletion =
      gradedScores.length > 0
        ? Math.round(
            gradedScores.reduce(
              (sum, score) =>
                sum + score,
              0
            ) / gradedScores.length
          )
        : 0;

    return NextResponse.json({
      teacherName: teacher.name,
      email: teacher.email,

      stats: {
        activeExams,
        totalStudents,
        avgCompletion,
      },

      exams,
    });
  } catch (error) {
    console.error(
      "Teacher dashboard error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load dashboard",
      },
      {
        status: 500,
      }
    );
  }
}
