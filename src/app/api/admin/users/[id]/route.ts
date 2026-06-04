import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(
    authOptions
  );
  console.log("[admin/users DELETE] session:", session);

  if (!session?.user) {
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

    console.log("[admin/users DELETE] admin lookup:", !!admin, session.user.email);

    if (admin) isAdmin = true;
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const student =
    await prisma.student.findUnique({
      where: { id },
    });

  if (student) {
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  }

  const teacher =
    await prisma.teacher.findUnique({
      where: { id },
    });

  if (teacher) {
    await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  }

  return NextResponse.json(
    {
      error: "User not found",
    },
    {
      status: 404,
    }
  );
}