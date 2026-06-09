"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Download,
  Play,
  FileText,
  Link as LinkIcon,
  CalendarDays,
  ChevronLeft,
  FolderOpen,
} from "lucide-react";

export interface StudyMaterial {
  _id?: string;
  id?: number | string;
  title: string;
  subject: string;
  type: string;
  uploadDate: string;
  fileUrl?: string | null;
}

interface StudyMaterialsProps {
  materials: StudyMaterial[];
}

export function StudyMaterialsGrid({
  materials,
}: StudyMaterialsProps) {
  const getTypeTone = (type: string) => {
    switch (type) {
      case "PDF":
      case "Document":
        return {
          icon: "bg-rose-50 text-rose-600 ring-rose-100",
          badge:
            "bg-rose-50 text-rose-700 ring-rose-100",
          bar: "bg-rose-500",
        };

      case "Video":
        return {
          icon: "bg-violet-50 text-violet-600 ring-violet-100",
          badge:
            "bg-violet-50 text-violet-700 ring-violet-100",
          bar: "bg-violet-500",
        };

      case "Link":
        return {
          icon: "bg-sky-50 text-sky-600 ring-sky-100",
          badge:
            "bg-sky-50 text-sky-700 ring-sky-100",
          bar: "bg-sky-500",
        };

      default:
        return {
          icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
          badge:
            "bg-emerald-50 text-emerald-700 ring-emerald-100",
          bar: "bg-emerald-500",
        };
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "PDF":
      case "Document":
        return <FileText className="h-6 w-6" />;

      case "Video":
        return <Play className="h-6 w-6" />;

      case "Link":
        return <LinkIcon className="h-6 w-6" />;

      default:
        return <BookOpen className="h-6 w-6" />;
    }
  };

  const handleDownload = (material: StudyMaterial) => {
    if (!material.fileUrl) return;

    window.open(material.fileUrl, "_blank");
  };

  const groupedMaterials = materials.reduce<
    Record<string, StudyMaterial[]>
  >((acc, material) => {
    const subject =
      material.subject?.trim() || "General";

    if (!acc[subject]) {
      acc[subject] = [];
    }

    acc[subject].push(material);

    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-5 border-b border-border bg-gradient-to-r from-emerald-50 via-sky-50 to-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary p-3 text-primary-foreground shadow-sm">
              <BookOpen className="h-7 w-7" />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Resource library
              </p>

              <h2 className="text-2xl font-semibold text-foreground">
                Study Materials
              </h2>

              <p className="text-sm text-muted-foreground">
                Access learning resources and study guides
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-lg bg-background/80 px-3 py-2 text-sm font-medium text-foreground ring-1 ring-border">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span>
              {materials.length}{" "}
              {materials.length === 1
                ? "material"
                : "materials"}
            </span>
          </div>
        </div>
      </div>

      {Object.entries(groupedMaterials).map(
        ([subject, subjectMaterials]) => (
          <div key={subject} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {subject}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {subjectMaterials.length}{" "}
                  {subjectMaterials.length === 1
                    ? "resource"
                    : "resources"}{" "}
                  available
                </p>
              </div>

              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {subjectMaterials.map((material) => {
                const tone = getTypeTone(material.type);

                return (
                  <div
                    key={String(
                      material._id ??
                        material.id ??
                        `${subject}-${material.title}`
                    )}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1 ${tone.bar}`}
                    />

                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-lg p-2.5 ring-1 ${tone.icon}`}
                      >
                        {getIcon(material.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ${tone.badge}`}
                          >
                            {material.type}
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {material.uploadDate}
                          </span>
                        </div>

                        <h4 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
                          {material.title}
                        </h4>
                      </div>

                      <button
                        onClick={() =>
                          handleDownload(material)
                        }
                        disabled={!material.fileUrl}
                        title={
                          material.fileUrl
                            ? "Open material"
                            : "No file available"
                        }
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        type="button"
                        aria-label={`Open ${material.title}`}
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {Object.keys(groupedMaterials).length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <BookOpen className="h-7 w-7" />
          </div>

          <h3 className="mb-1 text-base font-semibold text-foreground">
            No study materials yet
          </h3>

          <p className="text-sm text-muted-foreground">
            Uploaded resources will appear here by subject.
          </p>
        </div>
      )}
    </div>
  );
}

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      error.error || "Failed to fetch materials"
    );
  }

  return response.json();
};

export default function StudyMaterials() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR(
    "/api/materials",
    fetcher
  );

  const materials: StudyMaterial[] =
    data?.materials || data || [];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />

          <div className="flex-1 space-y-3">
            <div className="h-4 w-44 animate-pulse rounded bg-muted" />
            <div className="h-3 w-64 max-w-full animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl bg-muted/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="font-medium text-red-700">
          Failed to load study materials.
        </p>

        <p className="mt-1 text-sm text-red-600">
          Please refresh the page and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <StudyMaterialsGrid materials={materials} />
      </div>
    </div>
  );
}
