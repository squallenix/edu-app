"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, UserCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<"student" | "teacher">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        // Handle successful login (e.g., store token, redirect)
        router.push("/dashboard");
      } else {
        // Handle login error (e.g., show error message)
        console.error("Login failed:", data.error);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl">
              <GraduationCap className="w-12 h-12" />
            </div>
          </div>
          <h1>EduAssist</h1>
          <p className="text-muted-foreground">Take or create exams with ease</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl p-8">

          {/* Role switch */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 py-2.5 rounded-md ${
                role === "student" ? "bg-background shadow-sm" : ""
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Student
            </button>

            <button
              onClick={() => setRole("teacher")}
              className={`flex-1 py-2.5 rounded-md ${
                role === "teacher" ? "bg-background shadow-sm" : ""
              }`}
            >
              <UserCircle className="w-4 h-4 inline mr-2" />
              Teacher
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-3 p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full mb-3 p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full bg-black text-white py-2 rounded">
              Sign In
            </button>
          </form>

          {/* Signup */}
          <p className="text-center mt-4 text-sm">
            Don’t have account?{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-blue-500">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}