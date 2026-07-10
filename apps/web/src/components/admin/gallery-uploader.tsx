"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, RefreshCw, Trash2, Upload } from "lucide-react";
import { DragDropUploader } from "./drag-drop-uploader";
import { ActionButton, GlassCard } from "@/components/ui/primitives";

type UploadStatus = "idle" | "loading" | "success" | "error";

interface UploadedImage {
  id: string;
  title: string;
  caption?: string | null;
  category: string;
  image_url: string;
  cloudinary_public_id?: string | null;
}

export function GalleryUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("events");
  const [title, setTitle] = useState("Phase A Test Image");
  const [caption, setCaption] = useState("Uploaded during Phase A verification");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);

  const loadImages = async () => {
    setStatus("loading");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load gallery.");
      const data = await response.json();
      setImages(data.data);
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Unable to load gallery images.");
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadImages();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleUpload = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setMessage("Please sign in before uploading.");
      setStatus("error");
      return;
    }

    if (files.length === 0) {
      setMessage("Please select at least one image.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("Uploading images...");

    const formData = new FormData();
    let endpoint = "/gallery/bulk-upload";

    if (files.length === 1) {
      endpoint = "/gallery/upload";
      formData.append("image", files[0]);
      formData.append("title", title || files[0].name);
      formData.append("caption", caption);
    } else {
      files.forEach((file) => {
        formData.append("images", file);
      });
    }

    formData.append("category", category);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setStatus("success");
      setMessage(data.message ?? `Uploaded ${files.length} image${files.length === 1 ? "" : "s"}.`);
      setFiles([]);
      await loadImages();
    } catch {
      setStatus("error");
      setMessage("Failed to upload images. Please check API, Supabase, and Cloudinary connectivity.");
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setMessage("Please sign in before deleting.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setStatus("success");
      setMessage("Image deleted successfully.");
      await loadImages();
    } catch {
      setStatus("error");
      setMessage("Failed to delete image.");
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900">Gallery Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="events">Events</option>
              <option value="workshops">Workshops</option>
              <option value="community">Community Service</option>
              <option value="fundraisers">Fundraisers</option>
              <option value="team">Team Activities</option>
              <option value="uncategorized">Uncategorized</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900">Single Upload Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-900">Single Upload Caption</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>
      </GlassCard>

      <DragDropUploader onFilesSelected={setFiles} maxFiles={50} />

      <div className="flex flex-wrap gap-3">
        <ActionButton onClick={handleUpload} disabled={files.length === 0 || status === "loading"} className="gap-2">
          <Upload className="h-4 w-4" />
          {status === "loading" ? "Working..." : `Upload ${files.length} Image${files.length !== 1 ? "s" : ""}`}
        </ActionButton>
        <ActionButton onClick={loadImages} disabled={status === "loading"} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </ActionButton>
      </div>

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

      <GlassCard>
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Gallery Images</h3>
          {images.length === 0 ? (
            <p className="text-sm text-slate-600">No uploaded images found.</p>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              {images.map((img) => (
                <div key={img.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img src={img.image_url} alt={img.title} className="aspect-square w-full object-cover" />
                  <div className="space-y-3 p-3">
                    <div>
                      <p className="truncate text-sm font-medium text-slate-900">{img.title}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-600">{img.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
