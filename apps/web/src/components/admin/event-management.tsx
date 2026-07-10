"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Archive, CheckCircle, Edit3, Plus, RefreshCw, Send, Trash2, Upload } from "lucide-react";
import { adminFormRequest, adminJsonRequest } from "@/lib/admin-api";
import { ActionButton, GlassCard } from "@/components/ui/primitives";
import { DragDropUploader } from "./drag-drop-uploader";
import { ConfirmationDialog } from "./confirmation-dialog";
import { DataTable } from "./data-table";
import { EmptyState } from "./empty-state";
import { FilterBar } from "./filter-bar";
import { FormLayout } from "./form-layout";
import { LoadingState } from "./loading-state";
import { Pagination } from "./pagination";
import { SearchBar } from "./search-bar";
import { StatusBadge } from "./status-badge";
import type { EventListResponse, EventRecord, EventStatus } from "@/types/event";

const categories = ["All Categories", "Outreach Drive", "Awareness Campaign", "Workshop", "Fundraiser", "Celebration", "Other"];
const statuses: Array<EventStatus | "all"> = ["all", "draft", "published", "archived"];
const pageSize = 5;

type EventFormState = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  registrationLink: string;
  featured: boolean;
  status: EventStatus;
  displayOrder: string;
};

const emptyForm: EventFormState = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "Outreach Drive",
  venue: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  registrationLink: "",
  featured: false,
  status: "draft",
  displayOrder: "0",
};

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function buildDisplayTime(startTime: string | null, endTime: string | null) {
  if (!startTime && !endTime) {
    return "Time not set";
  }

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime ?? endTime ?? "Time not set";
}

export function EventManagement() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteTitle, setPendingDeleteTitle] = useState("");
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [form, setForm] = useState<EventFormState>(emptyForm);

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await adminJsonRequest<EventListResponse>("/events/manage");
      setEvents(payload.data);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch = !normalizedSearch || [event.title, event.slug, event.category, event.venue, event.description, event.shortDescription ?? ""].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [events, search, statusFilter, categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetForm = () => {
    setForm(emptyForm);
    setCoverFiles([]);
    setGalleryFiles([]);
    setEditingId(null);
  };

  const handleEdit = (event: EventRecord) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      slug: event.slug,
      shortDescription: event.shortDescription ?? "",
      description: event.description,
      category: event.category,
      venue: event.venue,
      eventDate: toDateTimeLocalValue(event.eventDate),
      startTime: event.startTime ?? "",
      endTime: event.endTime ?? "",
      registrationLink: event.registrationLink ?? "",
      featured: event.featured,
      status: event.status,
      displayOrder: String(event.displayOrder),
    });
    setCoverFiles([]);
    setGalleryFiles([]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.venue.trim() || !form.eventDate) {
      setError("Title, description, venue, and event date are required.");
      return;
    }

    if (!editingId && coverFiles.length === 0) {
      setError("Cover image is required for new events.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("slug", form.slug.trim());
      data.append("shortDescription", form.shortDescription.trim());
      data.append("description", form.description.trim());
      data.append("category", form.category.trim());
      data.append("venue", form.venue.trim());
      data.append("eventDate", new Date(form.eventDate).toISOString());
      data.append("startTime", form.startTime);
      data.append("endTime", form.endTime);
      data.append("registrationLink", form.registrationLink);
      data.append("featured", String(form.featured));
      data.append("status", form.status);
      data.append("displayOrder", form.displayOrder);

      if (coverFiles[0]) {
        data.append("coverImage", coverFiles[0]);
      }

      galleryFiles.forEach((file) => {
        data.append("galleryImages", file);
      });

      if (editingId) {
        await adminFormRequest(`/events/${editingId}`, data, "PUT");
        setSuccess("Event updated successfully.");
      } else {
        await adminFormRequest("/events", data, "POST");
        setSuccess("Event created successfully.");
      }

      resetForm();
      await loadEvents();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, action: "publish" | "archive" | "draft") => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adminJsonRequest(`/events/${id}/${action}`, { method: "POST" });
      setSuccess(`Event marked as ${action}.`);
      await loadEvents();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : `Failed to ${action} event.`);
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
      await adminJsonRequest(`/events/${pendingDeleteId}`, { method: "DELETE" });
      setSuccess(`${pendingDeleteTitle} deleted successfully.`);
      setPendingDeleteId(null);
      setPendingDeleteTitle("");
      if (editingId === pendingDeleteId) {
        resetForm();
      }
      await loadEvents();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to delete event.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: "Event",
      cell: (event: EventRecord) => (
        <div className="flex items-start gap-4">
          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <img
              src={event.coverImage ?? "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80"}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-950">{event.title}</h4>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-600">{event.category}</p>
            <p className="mt-2 text-xs text-slate-500">{event.slug}</p>
          </div>
        </div>
      ),
      className: "min-w-80",
    },
    {
      header: "Status",
      cell: (event: EventRecord) => <StatusBadge active={event.status === "published"} activeLabel="Published" inactiveLabel={event.status === "draft" ? "Draft" : "Archived"} />,
      className: "min-w-32",
    },
    {
      header: "Date & Time",
      cell: (event: EventRecord) => (
        <div>
          <p className="font-medium text-slate-900">{new Date(event.eventDate).toLocaleDateString()}</p>
          <p className="mt-1 text-xs text-slate-500">{buildDisplayTime(event.startTime, event.endTime)}</p>
        </div>
      ),
      className: "min-w-40",
    },
    {
      header: "Featured",
      cell: (event: EventRecord) => <StatusBadge active={event.featured} activeLabel="Yes" inactiveLabel="No" />,
      className: "min-w-24",
    },
    {
      header: "Actions",
      cell: (event: EventRecord) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => handleEdit(event)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          {event.status !== "published" ? (
            <button type="button" onClick={() => handleStatusChange(event.id, "publish")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
              <Send className="h-3.5 w-3.5" />
              Publish
            </button>
          ) : (
            <button type="button" onClick={() => handleStatusChange(event.id, "archive")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100">
              <Archive className="h-3.5 w-3.5" />
              Archive
            </button>
          )}
          {event.status !== "draft" ? (
            <button type="button" onClick={() => handleStatusChange(event.id, "draft")} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
              Draft
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setPendingDeleteId(event.id);
              setPendingDeleteTitle(event.title);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
      className: "min-w-72",
    },
  ];

  const emptyMessage = filteredEvents.length === 0 ? (
    <EmptyState
      title="No events found"
      description="Create a new event or adjust the search and filter criteria. Only published events appear on the public website."
      action={<ActionButton onClick={resetForm} className="gap-2"><Plus className="h-4 w-4" />Create Event</ActionButton>}
    />
  ) : null;

  return (
    <>
      <div className="space-y-6">
        <FormLayout
          title={editingId ? "Edit Event" : "Add Event"}
          description="Create, update, publish, archive, and delete events from a single CMS surface."
          footer={
            <div className="flex flex-wrap gap-3">
              <ActionButton onClick={loadEvents} disabled={loading || saving} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </ActionButton>
              <ActionButton onClick={resetForm} disabled={saving} className="bg-white text-slate-900 hover:bg-slate-100">
                Reset
              </ActionButton>
              <button
                type="submit"
                form="event-form"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Update Event" : "Add Event"}
              </button>
            </div>
          }
        >
          <form id="event-form" className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Title *
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  placeholder="Event title"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Slug
                <input
                  value={form.slug}
                  onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  placeholder="optional-custom-slug"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Short Description
                <input
                  value={form.shortDescription}
                  onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  placeholder="Short summary for cards"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Category *
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                >
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-900">
              Description *
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={6}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                placeholder="Detailed event description"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Venue *
                <input
                  value={form.venue}
                  onChange={(event) => setForm((current) => ({ ...current, venue: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  placeholder="Event venue"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Event Date *
                <input
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Start Time
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                End Time
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Registration Link
                <input
                  value={form.registrationLink}
                  onChange={(event) => setForm((current) => ({ ...current, registrationLink: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  placeholder="https://..."
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
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-900">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-400"
                />
                Featured
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as EventStatus }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Cover Image {editingId ? "(optional if unchanged)" : "*"}</p>
                <DragDropUploader onFilesSelected={setCoverFiles} maxFiles={1} accept="image/*" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Gallery Images</p>
                <DragDropUploader onFilesSelected={setGalleryFiles} maxFiles={20} accept="image/*" />
              </div>
            </div>
          </form>
        </FormLayout>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
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
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Events</h3>
                <p className="text-sm text-slate-600">Search, filter, publish, archive, and delete from one table.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {filteredEvents.length} total
              </span>
            </div>

            <FilterBar>
              <SearchBar value={search} onChange={setSearch} placeholder="Search title, category, venue, or slug" />
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Status
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as EventStatus | "all")} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300">
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Category
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300">
                  <option value="all">All Categories</option>
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <ActionButton onClick={loadEvents} disabled={loading || saving} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </ActionButton>
            </FilterBar>

            {loading ? (
              <LoadingState label="Loading events..." />
            ) : (
              <DataTable
                columns={columns}
                rows={visibleEvents}
                rowKey={(row) => row.id}
                emptyState={emptyMessage}
              />
            )}

            {!loading && filteredEvents.length > 0 ? (
              <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
            ) : null}
          </div>
        </GlassCard>
      </div>

      <ConfirmationDialog
        open={pendingDeleteId !== null}
        title={`Delete ${pendingDeleteTitle}?`}
        description="This will permanently remove the event and its Cloudinary assets."
        confirmLabel="Delete"
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          setPendingDeleteId(null);
          setPendingDeleteTitle("");
        }}
      />
    </>
  );
}
