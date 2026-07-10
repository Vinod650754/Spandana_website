"use client";

import { useState } from "react";
import { Upload, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { DragDropUploader } from "./drag-drop-uploader";
import { PrimaryButton, GlassCard, ActionButton } from "@/components/ui/primitives";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface Event {
  id: string;
  title: string;
  slug: string;
  banner_url?: string;
  created_at: string;
}

export function EventUploader() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`);
      if (!response.ok) throw new Error("Failed to load events");
      const data = await response.json();
      setEvents(data.data);
    } catch (error) {
      setMessage("Failed to load events");
      setStatus("error");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleUploadBanner = async () => {
    if (!files[0]) {
      setMessage("Please select a banner image.");
      setStatus("error");
      return;
    }

    if (!selectedEvent) {
      setMessage("Please create or select an event first.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading banner...");

    const formData = new FormData();
    formData.append("banner", files[0]);

    try {
      const eventData = events.find((e) => e.id === selectedEvent);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventData?.slug}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) throw new Error("Upload failed");

      setStatus("success");
      setMessage("Banner uploaded successfully!");
      setFiles([]);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setStatus("error");
      setMessage("Failed to upload banner. Please try again.");
    }
  };

  const handleUploadGallery = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one gallery image.");
      setStatus("error");
      return;
    }

    if (!selectedEvent) {
      setMessage("Please select an event first.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading gallery images...");

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const eventData = events.find((e) => e.id === selectedEvent);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventData?.slug}/gallery`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) throw new Error("Upload failed");

      setStatus("success");
      setMessage(`Gallery updated with ${files.length} image(s)!`);
      setFiles([]);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setStatus("error");
      setMessage("Failed to upload gallery images. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <GlassCard>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-900">Select Event</label>
            <button onClick={loadEvents} disabled={isLoadingEvents} className="text-xs text-cyan-600 hover:text-cyan-700 disabled:opacity-50">
              {isLoadingEvents ? "Loading..." : "Refresh"}
            </button>
          </div>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">-- Select an event --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Drag Drop Area */}
      <DragDropUploader onFilesSelected={handleFilesSelected} maxFiles={50} />

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <ActionButton onClick={handleUploadBanner} disabled={files.length === 0 || !selectedEvent || status === "uploading"} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload as Banner
        </ActionButton>
        <ActionButton onClick={handleUploadGallery} disabled={files.length === 0 || !selectedEvent || status === "uploading"} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700">
          <Upload className="h-4 w-4" />
          Add to Gallery
        </ActionButton>
      </div>

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
