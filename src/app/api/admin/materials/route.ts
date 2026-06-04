import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(
    authOptions
  );
  console.log("[admin/materials] GET session:", session);

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

    if (admin) isAdmin = true;
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const materials =
    await prisma.studyMaterial.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

  return NextResponse.json(materials);
}
export async function POST(
  request: Request
) {
  const session = await getServerSession(
    authOptions
  );
  console.log("[admin/materials] POST session:", session);

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

    console.log("[admin/materials] POST admin lookup:", !!admin, session.user.email);

    if (admin) isAdmin = true;
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    title,
    subject,
    type,
    fileUrl,
  } = await request.json();

  const material =
    await prisma.studyMaterial.create({
      data: {
        title,
        subject,
        type,
        fileUrl,
      },
    });

  return NextResponse.json(material);
}