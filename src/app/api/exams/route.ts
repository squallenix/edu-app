import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExamStatus } from "@/generated/prisma/enums";

type ExamQuestionInput = {
  question?: unknown;
  options?: unknown;
  correctAnswer?: unknown;
};

type ValidExamQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

type ExamCreateInput = {
  title?: unknown;
  duration?: unknown;
  availableDate?: unknown;
  availableTime?: unknown;
  questions?: unknown;
};

const SYSTEM_TEACHER_EMAIL = "system-admin@eduassist.local";

async function getSystemTeacherId() {
  const existingTeacher = await prisma.teacher.findUnique({
    where: {
      email: SYSTEM_TEACHER_EMAIL,
    },
  });

  if (existingTeacher) {
    return existingTeacher.id;
  }

  const password = await bcrypt.hash(
    "system-owned-account",
    10
  );

  const systemTeacher = await prisma.teacher.create({
    data: {
      email: SYSTEM_TEACHER_EMAIL,
      name: "System Administrator",
      password,
    },
  });

  return systemTeacher.id;
}

function getValidQuestions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (question): question is ValidExamQuestion => {
      if (
        typeof question !== "object" ||
        question === null
      ) {
        return false;
      }

      const candidate = question as ExamQuestionInput;

      return (
        typeof candidate.question === "string" &&
        Array.isArray(candidate.options) &&
        candidate.options.every(
          (option) => typeof option === "string"
        ) &&
        typeof candidate.correctAnswer === "number"
      );
    }
  );
}

function getScheduledDate(
  availableDate: unknown,
  availableTime: unknown
) {
  if (
    typeof availableDate !== "string" ||
    typeof availableTime !== "string" ||
    !availableDate ||
    !availableTime
  ) {
    return null;
  }

  const scheduledAt = new Date(
    `${availableDate}T${availableTime}:00`
  );

  if (Number.isNaN(scheduledAt.getTime())) {
    return null;
  }

  return scheduledAt;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as ExamCreateInput;
    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";
    const duration =
      typeof body.duration === "number"
        ? body.duration
        : null;
    const scheduledAt = getScheduledDate(
      body.availableDate,
      body.availableTime
    );
    const questions = getValidQuestions(body.questions);

    if (
      !title ||
      !duration ||
      !scheduledAt ||
      questions.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid exam data" },
        { status: 400 }
      );
    }

    let createdById: string;

    if (session.user.role === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: {
          email: session.user.email,
        },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 404 }
        );
      }

      createdById = teacher.id;
    } else if (session.user.role === "admin") {
      createdById = await getSystemTeacherId();
    } else {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        duration,
        dueDate: scheduledAt,
        time: scheduledAt,
        status: ExamStatus.DRAFT,
        createdById,
        questions: {
          create: questions.map((question, index) => {
            return {
              type: "multiple_choice",
              content: question.question,
              options: JSON.stringify(question.options),
              answer:
                question.options[question.correctAnswer] ?? null,
              order: index + 1,
            };
          }),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        exam,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create exam error:", error);

    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // fetch exams with creator and questions
    const exams = await prisma.exam.findMany({
      where: {
        status: ExamStatus.PUBLISHED,
      },
      include: { createdBy: true, questions: true },
      orderBy: { createdAt: "desc" },
    });

    // if there's a logged-in student, fetch their enrollments
    let studentEnrollments: Array<{
      examId: string;
      status: string;
    }> = [];

    if (session?.user?.email) {
      const student = await prisma.student.findUnique({
        where: { email: session.user.email },
      });

      if (student) {
        const enrollments = await prisma.enrolledExam.findMany({
          where: { studentId: student.id },
        });

        studentEnrollments = enrollments.map((e) => ({
          examId: e.examId,
          status: e.status,
        }));
      }
    }

    const payload = exams.map((exam) => {
      const enrollment = studentEnrollments.find(
        (en) => en.examId === exam.id
      );

      const isSystemCreator =
        exam.createdBy?.email === SYSTEM_TEACHER_EMAIL;

      return {
        _id: exam.id,
        title: exam.title,
        subject: exam.description ?? "",
        creator: exam.createdBy?.name ?? "",
        creatorType: isSystemCreator ? "admin" : "teacher",
        questions: exam.questions?.length ?? 0,
        duration: exam.duration ?? 0,
        date: exam.dueDate ? exam.dueDate.toISOString() : null,
        availableAt: exam.dueDate
          ? exam.dueDate.toISOString()
          : null,
        hasAccess: isSystemCreator || (!!enrollment && enrollment.status === "approved"),
        requestPending: !!enrollment && enrollment.status === "pending",
      };
    });

    return NextResponse.json({ data: payload });
  } catch (error) {
    console.error("Fetch exams error:", error);

    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
