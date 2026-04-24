import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    const { email, name, password, role } = await request.json();
    if (!email || !name || !password) {
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
            name,
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