"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  BookOpen,
  GraduationCap,
  UserCircle,
  Shield,
  Loader2,
} from "lucide-react";

type Role = "student" | "teacher" | "admin";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      });
      if (!result) {
        setError("Login failed");
        return;
      }

      if (result.error) {
        setError("Invalid credentials");
        return;
      }

      switch (role) {
        case "admin":
          router.push("/admin/dashboard");
          break;

        case "teacher":
          router.push("/teacher/dashboard");
          break;

        case "student":
          router.push("/student/dashboard");
          break;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl">
              <GraduationCap className="h-12 w-12" />
            </div>
          </div>

          <h1 className="text-3xl font-bold">
            EduAssist
          </h1>

          <p className="mt-2 text-muted-foreground">
            Take or create exams with ease
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`py-2.5 rounded-md transition-all ${
                role === "student"
                  ? "bg-white shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">
                  Student
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`py-2.5 rounded-md transition-all ${
                role === "teacher"
                  ? "bg-white shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserCircle className="w-4 h-4" />
                <span className="text-sm">
                  Teacher
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`py-2.5 rounded-md transition-all ${
                role === "admin"
                  ? "bg-white shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">
                  Admin
                </span>
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black text-white py-3 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Signup */}
          {role !== "admin" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() =>
                    router.push("/signup")
                  }
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Secure login for students and educators
        </p>
      </div>
    </main>
  );
}