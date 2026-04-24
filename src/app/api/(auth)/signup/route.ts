import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const { email, fullName, password, role } = await request.json();
    if (!email || !fullName || !password || !role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try { 
    const user = await prisma.user.create({
        data: {
            email,
            name: fullName,
            password: hashedPassword,
            role,
        },
    });

    return NextResponse.json({ message: "User created successfully", user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
}   catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}