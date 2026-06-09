import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const materials = await prisma.studyMaterial.findMany({
    orderBy: { createdAt: "desc" },
  });

  const payload = materials.map((m) => ({
    _id: m.id,
    title: m.title,
    subject: m.subject,
    type: m.type,
    uploadDate: m.createdAt.toISOString(),
    fileUrl: m.fileUrl,
  }));

  return NextResponse.json({ materials: payload });
}
