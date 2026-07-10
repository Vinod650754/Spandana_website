"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Edit3, RefreshCw, Trash2, ToggleLeft, ToggleRight, Upload } from "lucide-react";
import { adminFormRequest, adminJsonRequest } from "@/lib/admin-api";
import { DragDropUploader } from "./drag-drop-uploader";
import { ConfirmationDialog } from "./confirmation-dialog";
import { ActionButton, GlassCard } from "@/components/ui/primitives";
import type { TeamCatalogItem, TeamCatalogResponse, TeamMemberRecord, TeamMemberResponse } from "@/types/team";

type TeamMemberFormState = {
  name: string;
  roleId: string;
  departmentId: string;
  academicYear: string;
  designation: string;
  email: string;
  linkedin: string;
  displayOrder: string;
  isActive: boolean;
};

const emptyForm: TeamMemberFormState = {
  name: "",
  roleId: "",
  departmentId: "",
  academicYear: String(new Date().getFullYear()),
  designation: "",
  email: "",
  linkedin: "",
  displayOrder: "0",
  isActive: true,
};

export function TeamMemberManager() {
  const [members, setMembers] = useState<TeamMemberRecord[]>([]);
  const [roles, setRoles] = useState<TeamCatalogItem[]>([]);
  const [departments, setDepartments] = useState<TeamCatalogItem[]>([]);
  const [form, setForm] = useState<TeamMemberFormState>(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [memberPayload, rolePayload, departmentPayload] = await Promise.all([
        adminJsonRequest<TeamMemberResponse>("/team/manage"),
        adminJsonRequest<TeamCatalogResponse>("/roles/manage"),
        adminJsonRequest<TeamCatalogResponse>("/departments/manage"),
      ]);

      setMembers(memberPayload.data);
      setRoles(rolePayload.data);
      setDepartments(departmentPayload.data);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to load team management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedFiles([]);
    setEditingId(null);
  };

  const handleEdit = (member: TeamMemberRecord) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      roleId: member.roleId ?? "",
      departmentId: member.departmentId ?? "",
      academicYear: String(member.academicYear ?? new Date().getFullYear()),
      designation: member.designation ?? "",
      email: member.email ?? "",
      linkedin: member.linkedin ?? "",
      displayOrder: String(member.displayOrder),
      isActive: member.isActive,
    });
    setSelectedFiles([]);
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.roleId || !form.departmentId) {
      setError("Name, role, and department are required.");
      return;
    }

    if (!editingId && selectedFiles.length === 0) {
      setError("Profile image is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("name", form.name.trim());
      data.append("roleId", form.roleId);
      data.append("departmentId", form.departmentId);
      data.append("academicYear", form.academicYear);
      data.append("designation", form.designation);
      data.append("email", form.email);
      data.append("linkedin", form.linkedin);
      data.append("displayOrder", form.displayOrder);
      data.append("isActive", String(form.isActive));

      if (selectedFiles[0]) {
        data.append("image", selectedFiles[0]);
      }

      if (editingId) {
        await adminFormRequest(`/team/${editingId}`, data, "PUT");
        setSuccess("Team member updated successfully.");
      } else {
        await adminFormRequest("/team", data, "POST");
        setSuccess("Team member added successfully.");
      }

      resetForm();
      await loadData();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to save team member.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (member: TeamMemberRecord) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("name", member.name);
      data.append("roleId", member.roleId ?? "");
      data.append("departmentId", member.departmentId ?? "");
      data.append("academicYear", String(member.academicYear ?? new Date().getFullYear()));
      data.append("designation", member.designation ?? "");
      data.append("email", member.email ?? "");
      data.append("linkedin", member.linkedin ?? "");
      data.append("displayOrder", String(member.displayOrder));
      data.append("isActive", String(!member.isActive));

      await adminFormRequest(`/team/${member.id}`, data, "PUT");
      setSuccess(`${member.name} ${member.isActive ? "deactivated" : "activated"}.`);
      await loadData();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to update team member status.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) {
      return;
    }

    setSaving(true);

    try {
      await adminJsonRequest(`/team/${pendingDeleteId}`, { method: "DELETE" });
      setSuccess(`${pendingDeleteName} deleted successfully.`);
      setPendingDeleteId(null);
      setPendingDeleteName("");
      if (editingId === pendingDeleteId) {
        resetForm();
      }
      await loadData();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to delete team member.");
    } finally {
      setSaving(false);
    }
  };

  const hasReferenceData = roles.length > 0 && departments.length > 0;

  return (
    <>
      <div className="space-y-6">
        <GlassCard>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">{editingId ? "Edit Team Member" : "Add Team Member"}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Assign the member to an active role and department, upload a profile image, and control visibility from here.
              </p>
            </div>

            {!hasReferenceData ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Create at least one role and one department before adding team members.
              </div>
            ) : null}

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Full Name *
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                    placeholder="Member name"
                    disabled={!hasReferenceData}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Academic Year *
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={form.academicYear}
                    onChange={(event) => setForm((current) => ({ ...current, academicYear: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                    disabled={!hasReferenceData}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Role *
                  <select
                    value={form.roleId}
                    onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                    disabled={!hasReferenceData}
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} {role.isActive ? "" : "(inactive)"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Department *
                  <select
                    value={form.departmentId}
                    onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                    disabled={!hasReferenceData}
                  >
                    <option value="">Select a department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name} {department.isActive ? "" : "(inactive)"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Designation
                  <input
                    value={form.designation}
                    onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                    placeholder="Coordinator, Lead, etc."
                    disabled={!hasReferenceData}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Display Order
                  <input
                    type="number"
                    min="0"
                    value={form.displayOrder}
                    onChange={(event) => setForm((current) => ({ ...current, displayOrder: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                    disabled={!hasReferenceData}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                    placeholder="optional@email.com"
                    disabled={!hasReferenceData}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  LinkedIn
                  <input
                    value={form.linkedin}
                    onChange={(event) => setForm((current) => ({ ...current, linkedin: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                    placeholder="https://linkedin.com/in/..."
                    disabled={!hasReferenceData}
                  />
                </label>
              </div>

              <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-900">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-400"
                  disabled={!hasReferenceData}
                />
                Active
              </label>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Profile Image {editingId ? "(optional if unchanged)" : "*"}</p>
                <DragDropUploader onFilesSelected={setSelectedFiles} maxFiles={1} accept="image/*" disabled={!hasReferenceData} />
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={loadData} disabled={loading || saving} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </ActionButton>
                <ActionButton onClick={resetForm} disabled={saving} className="bg-white text-slate-900 hover:bg-slate-100">
                  Reset
                </ActionButton>
                <button
                  type="submit"
                  disabled={saving || !hasReferenceData}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {saving ? "Saving..." : editingId ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </GlassCard>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {success ? (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        ) : null}

        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Team Members</h3>
                <p className="text-sm text-slate-600">Active and inactive records are shown here for complete management.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {members.length} total
              </span>
            </div>

            {loading ? (
              <p className="text-sm text-slate-600">Loading team members...</p>
            ) : members.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
                <h4 className="text-lg font-semibold text-slate-950">No team members yet</h4>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Add a role, department, and team member to start building the public team directory.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {members.map((member) => (
                  <div key={member.id} className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                    <div className="flex gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(0,212,255,0.16),rgba(139,92,246,0.12))] text-3xl font-semibold text-slate-500">
                            {member.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-950">{member.name}</h4>
                            <p className="mt-1 text-sm text-slate-600">{member.designation || "No designation set"}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-600">
                              {member.roleName ?? "Role pending"} · {member.departmentName ?? "Department pending"}
                            </p>
                          </div>
                          <span className={member.isActive ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"}>
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Year {member.academicYear ?? "-"}</span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Order {member.displayOrder}</span>
                          {member.email ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Email set</span> : null}
                          {member.linkedin ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">LinkedIn set</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <ActionButton onClick={() => handleEdit(member)} className="gap-2 bg-white text-slate-900 hover:bg-slate-100">
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </ActionButton>
                      <ActionButton onClick={() => handleToggleActive(member)} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
                        {member.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {member.isActive ? "Deactivate" : "Activate"}
                      </ActionButton>
                      <ActionButton
                        onClick={() => {
                          setPendingDeleteId(member.id);
                          setPendingDeleteName(member.name);
                          setError("");
                          setSuccess("");
                        }}
                        className="gap-2 bg-rose-600 hover:bg-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </ActionButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <ConfirmationDialog
        open={pendingDeleteId !== null}
        title={`Delete ${pendingDeleteName}?`}
        description="This will permanently remove the team member record and its Cloudinary image reference."
        confirmLabel="Delete"
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          setPendingDeleteId(null);
          setPendingDeleteName("");
        }}
      />
    </>
  );
}
