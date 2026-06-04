"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Shield,
  Users,
  FileText,
  BookOpen,
  LogOut,
  Trash2,
  Plus,
} from "lucide-react";

type Tab = "users" | "exams" | "materials";

type UserRole = "student" | "teacher" | "admin";

interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface ExamDto {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  createdAt: string;
  questionCount: number;
  creatorName: string;
}

interface StudyMaterialDto {
  id: string;
  title: string;
  subject: string;
  type: string;
  fileUrl: string | null;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] =
    useState<Tab>("users");

  const [loading, setLoading] =
    useState(true);

  const [users, setUsers] = useState<
    UserDto[]
  >([]);

  const [exams, setExams] = useState<
    ExamDto[]
  >([]);

  const [materials, setMaterials] =
    useState<StudyMaterialDto[]>([]);

  const [showAddMaterial, setShowAddMaterial] =
    useState(false);

  const [newMaterial, setNewMaterial] =
    useState({
      title: "",
      subject: "",
      type: "PDF",
      fileUrl: "",
    });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      // Use the consolidated dashboard endpoint for users + exams
      const [dashboardRes, materialsRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/materials"),
      ]);

      if (!dashboardRes.ok || !materialsRes.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const dashboardData = await dashboardRes.json();
      const materialsData = await materialsRes.json();

      // Map API shapes to local DTOs
      setUsers(
        (dashboardData.users || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.joinDate || u.createdAt,
        }))
      );

      setExams(
        (dashboardData.exams || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description ?? null,
          dueDate: e.date,
          createdAt: e.createdAt ?? new Date().toISOString(),
          questionCount: e.questions ?? e.questionCount ?? 0,
          creatorName: e.creator ?? e.creatorName,
        }))
      );

      setMaterials(materialsData || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(
    id: string,
    role: UserRole
  ) {
    const confirmed = confirm(
      "Delete this user?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/users/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Failed to delete user");
    }
  }

  async function deleteExam(id: string) {
    const confirmed = confirm(
      "Delete this exam?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/exams/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setExams((prev) =>
        prev.filter((e) => e.id !== id)
      );
    } catch {
      alert("Failed to delete exam");
    }
  }

  async function deleteMaterial(
    id: string
  ) {
    const confirmed = confirm(
      "Delete this material?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/materials/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Failed to delete material");
    }
  }

  async function addMaterial() {
    if (
      !newMaterial.title ||
      !newMaterial.subject
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/materials",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            newMaterial
          ),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      const created =
        await response.json();

      setMaterials((prev) => [
        created,
        ...prev,
      ]);

      setNewMaterial({
        title: "",
        subject: "",
        type: "PDF",
        fileUrl: "",
      });

      setShowAddMaterial(false);
    } catch {
      alert("Failed to add material");
    }
  }

  const studentCount = users.filter(
    (u) => u.role === "student"
  ).length;

  const teacherCount = users.filter(
    (u) => u.role === "teacher"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="bg-purple-600 text-white p-2 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>

              <div>
                <h1 className="font-semibold text-xl">
                  Admin Dashboard
                </h1>

                <p className="text-sm text-muted-foreground">
                  System Administration
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={users.length}
            icon={<Users className="w-5 h-5" />}
          />

          <StatCard
            title="Students"
            value={studentCount}
            icon={
              <BookOpen className="w-5 h-5" />
            }
          />

          <StatCard
            title="Teachers"
            value={teacherCount}
            icon={<Users className="w-5 h-5" />}
          />

          <StatCard
            title="Exams"
            value={exams.length}
            icon={
              <FileText className="w-5 h-5" />
            }
          />
        </div>

        <div className="bg-white rounded-xl border shadow-sm">
          <div className="flex border-b">
            <TabButton
              active={activeTab === "users"}
              onClick={() =>
                setActiveTab("users")
              }
              label="Users"
            />

            <TabButton
              active={activeTab === "exams"}
              onClick={() =>
                setActiveTab("exams")
              }
              label="Exams"
            />

            <TabButton
              active={
                activeTab === "materials"
              }
              onClick={() =>
                setActiveTab("materials")
              }
              label="Materials"
            />
          </div>

          <div className="p-6">
            {activeTab === "users" && (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border rounded-lg p-4 flex justify-between"
                  >
                    <div>
                      <h4 className="font-medium">
                        {user.name}
                      </h4>

                      <p>{user.email}</p>

                      <p className="capitalize text-sm">
                        {user.role}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        deleteUser(
                          user.id,
                          user.role
                        )
                      }
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "exams" && (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="border rounded-lg p-4 flex justify-between"
                  >
                    <div>
                      <h4 className="font-medium">
                        {exam.title}
                      </h4>

                      <p>
                        {exam.creatorName} •{" "}
                        {
                          exam.questionCount
                        }{" "}
                        questions
                      </p>

                      <p className="text-sm">
                        Due:{" "}
                        {new Date(
                          exam.dueDate
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        deleteExam(exam.id)
                      }
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "materials" && (
              <>
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold">
                    Study Materials
                  </h3>

                  <button
                    onClick={() =>
                      setShowAddMaterial(
                        true
                      )
                    }
                    className="bg-black text-white rounded-lg px-4 py-2 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Material
                  </button>
                </div>

                {showAddMaterial && (
                  <div className="border rounded-lg p-4 mb-4">
                    <div className="grid md:grid-cols-4 gap-3">
                      <input
                        className="border rounded-lg p-2"
                        placeholder="Title"
                        value={
                          newMaterial.title
                        }
                        onChange={(e) =>
                          setNewMaterial({
                            ...newMaterial,
                            title:
                              e.target.value,
                          })
                        }
                      />

                      <input
                        className="border rounded-lg p-2"
                        placeholder="Subject"
                        value={
                          newMaterial.subject
                        }
                        onChange={(e) =>
                          setNewMaterial({
                            ...newMaterial,
                            subject:
                              e.target.value,
                          })
                        }
                      />

                      <select
                        className="border rounded-lg p-2"
                        value={
                          newMaterial.type
                        }
                        onChange={(e) =>
                          setNewMaterial({
                            ...newMaterial,
                            type:
                              e.target.value,
                          })
                        }
                      >
                        <option>PDF</option>
                        <option>Video</option>
                        <option>Document</option>
                        <option>Link</option>
                      </select>

                      <input
                        className="border rounded-lg p-2"
                        placeholder="File URL"
                        value={
                          newMaterial.fileUrl
                        }
                        onChange={(e) =>
                          setNewMaterial({
                            ...newMaterial,
                            fileUrl:
                              e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={
                          addMaterial
                        }
                        className="bg-black text-white px-4 py-2 rounded-lg"
                      >
                        Save
                      </button>

                      <button
                        onClick={() =>
                          setShowAddMaterial(
                            false
                          )
                        }
                        className="border px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {materials.map(
                    (material) => (
                      <div
                        key={
                          material.id
                        }
                        className="border rounded-lg p-4 flex justify-between"
                      >
                        <div>
                          <h4 className="font-medium">
                            {
                              material.title
                            }
                          </h4>

                          <p>
                            {
                              material.subject
                            }{" "}
                            •{" "}
                            {
                              material.type
                            }
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            deleteMaterial(
                              material.id
                            )
                          }
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex justify-between mb-2">
        <h3>{title}</h3>
        {icon}
      </div>

      <p className="text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 ${
        active
          ? "border-b-2 border-blue-600 font-medium"
          : ""
      }`}
    >
      {label}
    </button>
  );
}