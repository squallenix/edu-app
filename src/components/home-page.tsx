import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <nav className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary p-3 text-primary-foreground">
              <GraduationCap className="h-7 w-7" />
            </div>
            <span className="text-xl font-semibold">
              EduAssist
            </span>
          </div>

          <Link
            href="/login"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
          >
            Sign in
          </Link>
        </nav>

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-blue-700">
              Learn, teach, and assess
            </p>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight text-gray-950 sm:text-6xl">
              A simpler home for exams and study materials.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              EduAssist helps students take exams, review results, and access
              materials while teachers manage assessments from one focused
              workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:opacity-90"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center rounded-lg border bg-white px-5 py-3 font-medium shadow-sm transition hover:bg-gray-50"
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <BookOpen className="mb-4 h-8 w-8 text-blue-600" />
              <h2 className="text-lg font-semibold">
                Student dashboard
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                See upcoming exams, completed work, and scores after signing in.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <ClipboardCheck className="mb-4 h-8 w-8 text-emerald-600" />
              <h2 className="text-lg font-semibold">
                Teacher tools
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Create assessments and keep student progress organized.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
