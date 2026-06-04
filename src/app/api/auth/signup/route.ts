import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

type Role = "student" | "teacher" | "admin";

export async function POST(request: Request) {
  try {
    const { email, fullName, password, role } =
      await request.json();

    if (
      !email ||
      !fullName ||
      !password ||
      !role
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      role !== "student" &&
      role !== "teacher" &&
      role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    let existingUser = null;

    switch (role as Role) {
      case "student":
        existingUser =
          await prisma.student.findUnique({
            where: { email },
          });
        break;

      case "teacher":
        existingUser =
          await prisma.teacher.findUnique({
            where: { email },
          });
        break;

      case "admin":
        existingUser =
          await prisma.admin.findUnique({
            where: { email },
          });
        break;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    let user;

    switch (role as Role) {
      case "student":
        user = await prisma.student.create({
          data: {
            email,
            name: fullName,
            password: hashedPassword,
          },
        });
        break;

      case "teacher":
        user = await prisma.teacher.create({
          data: {
            email,
            name: fullName,
            password: hashedPassword,
          },
        });
        break;

      case "admin":
        user = await prisma.admin.create({
          data: {
            email,
            name: fullName,
            password: hashedPassword,
          },
        });
        break;
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user!.id,
          email: user!.email,
          name: user!.name,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}