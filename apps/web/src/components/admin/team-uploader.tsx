"use client";

import { useState } from "react";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { DragDropUploader } from "./drag-drop-uploader";
import { PrimaryButton, GlassCard, ActionButton } from "@/components/ui/primitives";
import { z } from "zod";

type UploadStatus = "idle" | "uploading" | "success" | "error";

const teamSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  category: z.enum(["faculty", "student"]),
  social: z.object({
    email: z.string().email().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }).optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

export function TeamUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    role: "",
    category: "student",
  });
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles.slice(0, 1)); // Only allow one photo
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMember = async () => {
    if (!formData.name || !formData.role) {
      setMessage("Please fill in all required fields.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setMessage("Adding team member...");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("role", formData.role);
    data.append("category", formData.category);
    data.append("social", JSON.stringify(formData.social || {}));

    if (files[0]) {
      data.append("photo", files[0]);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team`, {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to add member");

      setStatus("success");
      setMessage("Team member added successfully!");
      setFormData({ name: "", role: "", category: "student" });
      setFiles([]);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setStatus("error");
      setMessage("Failed to add team member. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Member Details */}
      <GlassCard>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Role *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="President, Faculty Advisor, etc."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Photo Upload */}
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-3">Profile Photo</h3>
        <DragDropUploader onFilesSelected={handleFilesSelected} maxFiles={1} accept="image/*" />
      </div>

      {/* Action Button */}
      <ActionButton onClick={handleAddMember} disabled={!formData.name || !formData.role || status === "uploading"} className="w-full flex items-center justify-center gap-2">
        <Upload className="h-4 w-4" />
        {status === "uploading" ? "Adding Member..." : "Add Team Member"}
      </ActionButton>

      {/* Status Messages */}
      {status === "success" && (
        <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{message}</p>
        </div>
      )}
    </div>
  );
}
