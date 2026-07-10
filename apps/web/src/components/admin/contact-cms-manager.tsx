"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Archive, CheckCircle, Eye, EyeOff, RefreshCw, Save, Trash2 } from "lucide-react";
import { adminJsonRequest } from "@/lib/admin-api";
import { ActionButton, GlassCard } from "@/components/ui/primitives";
import { ConfirmationDialog } from "./confirmation-dialog";
import { DataTable } from "./data-table";
import { EmptyState } from "./empty-state";
import { FilterBar } from "./filter-bar";
import { FormLayout } from "./form-layout";
import { LoadingState } from "./loading-state";
import { SearchBar } from "./search-bar";
import { StatusBadge } from "./status-badge";
import type { ContactMessage, ContactMessageListResponse, ContactMessageStatus, ContactSettings, ContactSettingsResponse } from "@/types/contact";

type ContactFormState = {
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  facebook: string;
  mapsUrl: string;
  address: string;
  officeHours: string;
  contactFormEnabled: boolean;
  successMessage: string;
};

const emptySettings: ContactFormState = {
  email: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  facebook: "",
  mapsUrl: "",
  address: "",
  officeHours: "",
  contactFormEnabled: true,
  successMessage: "Thank you for reaching out. We will get back to you soon.",
};

const statuses: Array<ContactMessageStatus | "all"> = ["all", "new", "read", "archived"];

function toFormState(settings: ContactSettings): ContactFormState {
  return {
    email: settings.email,
    phone: settings.phone,
    whatsapp: settings.whatsapp ?? "",
    instagram: settings.instagram ?? "",
    linkedin: settings.linkedin ?? "",
    youtube: settings.youtube ?? "",
    facebook: settings.facebook ?? "",
    mapsUrl: settings.mapsUrl ?? "",
    address: settings.address ?? "",
    officeHours: settings.officeHours ?? "",
    contactFormEnabled: settings.contactFormEnabled,
    successMessage: settings.successMessage,
  };
}

function statusLabel(status: ContactMessageStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ContactCmsManager() {
  const [settings, setSettings] = useState<ContactFormState>(emptySettings);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "all">("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [settingsPayload, messagesPayload] = await Promise.all([
        adminJsonRequest<ContactSettingsResponse>("/contact/details/manage"),
        adminJsonRequest<ContactMessageListResponse>("/contact/messages"),
      ]);

      setSettings(toFormState(settingsPayload.data));
      setMessages(messagesPayload.data);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to load contact CMS data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesSearch =
        !normalizedSearch ||
        [message.name, message.email, message.message, message.status].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === "all" || message.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = await adminJsonRequest<ContactSettingsResponse>("/contact/details", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSettings(toFormState(payload.data));
      setSuccess("Contact settings updated successfully.");
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to update contact settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateMessageStatus = async (id: string, status: ContactMessageStatus) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adminJsonRequest(`/contact/messages/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setSuccess(`Message marked ${status}.`);
      await loadData();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to update message status.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMessage = async () => {
    if (!pendingDeleteId) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adminJsonRequest(`/contact/messages/${pendingDeleteId}`, { method: "DELETE" });
      setSuccess(`${pendingDeleteName} deleted permanently.`);
      setPendingDeleteId(null);
      setPendingDeleteName("");
      await loadData();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to delete message.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: "Message",
      cell: (message: ContactMessage) => (
        <div>
          <h4 className="text-sm font-semibold text-slate-950">{message.name}</h4>
          <p className="mt-1 text-xs text-cyan-700">{message.email}</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{message.message}</p>
        </div>
      ),
      className: "min-w-96",
    },
    {
      header: "Status",
      cell: (message: ContactMessage) => (
        <StatusBadge active={message.status === "new"} activeLabel={statusLabel(message.status)} inactiveLabel={statusLabel(message.status)} />
      ),
      className: "min-w-28",
    },
    {
      header: "Received",
      cell: (message: ContactMessage) => (
        <div>
          <p className="font-medium text-slate-900">{new Date(message.createdAt).toLocaleDateString()}</p>
          <p className="mt-1 text-xs text-slate-500">{new Date(message.createdAt).toLocaleTimeString()}</p>
        </div>
      ),
      className: "min-w-36",
    },
    {
      header: "Actions",
      cell: (message: ContactMessage) => (
        <div className="flex flex-wrap gap-2">
          {message.status !== "read" ? (
            <button type="button" onClick={() => updateMessageStatus(message.id, "read")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
              <Eye className="h-3.5 w-3.5" />
              Read
            </button>
          ) : (
            <button type="button" onClick={() => updateMessageStatus(message.id, "new")} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
              <EyeOff className="h-3.5 w-3.5" />
              New
            </button>
          )}
          {message.status !== "archived" ? (
            <button type="button" onClick={() => updateMessageStatus(message.id, "archived")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100">
              <Archive className="h-3.5 w-3.5" />
              Archive
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setPendingDeleteId(message.id);
              setPendingDeleteName(message.name);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
      className: "min-w-64",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <FormLayout
          title="Contact Settings"
          description="Update the public contact channels, form availability, and confirmation message."
          footer={
            <div className="flex flex-wrap gap-3">
              <ActionButton onClick={loadData} disabled={loading || saving} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </ActionButton>
              <button
                type="submit"
                form="contact-settings-form"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          }
        >
          <form id="contact-settings-form" className="grid gap-4" onSubmit={saveSettings}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Club Email *
                <input value={settings.email} onChange={(event) => setSettings((current) => ({ ...current, email: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Phone Number *
                <input value={settings.phone} onChange={(event) => setSettings((current) => ({ ...current, phone: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-900">
              Address *
              <textarea value={settings.address} onChange={(event) => setSettings((current) => ({ ...current, address: event.target.value }))} rows={3} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Google Maps URL
                <input value={settings.mapsUrl} onChange={(event) => setSettings((current) => ({ ...current, mapsUrl: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Office Hours
                <input value={settings.officeHours} onChange={(event) => setSettings((current) => ({ ...current, officeHours: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                WhatsApp URL
                <input value={settings.whatsapp} onChange={(event) => setSettings((current) => ({ ...current, whatsapp: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Instagram URL
                <input value={settings.instagram} onChange={(event) => setSettings((current) => ({ ...current, instagram: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                LinkedIn URL
                <input value={settings.linkedin} onChange={(event) => setSettings((current) => ({ ...current, linkedin: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                YouTube URL
                <input value={settings.youtube} onChange={(event) => setSettings((current) => ({ ...current, youtube: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Facebook URL
                <input value={settings.facebook} onChange={(event) => setSettings((current) => ({ ...current, facebook: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-900">
              Success Message *
              <textarea value={settings.successMessage} onChange={(event) => setSettings((current) => ({ ...current, successMessage: event.target.value }))} rows={3} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300" />
            </label>

            <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-900">
              <input type="checkbox" checked={settings.contactFormEnabled} onChange={(event) => setSettings((current) => ({ ...current, contactFormEnabled: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-400" />
              Contact form enabled
            </label>
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
                <h3 className="text-xl font-semibold text-slate-950">Contact Messages</h3>
                <p className="text-sm text-slate-600">Search, review, archive, and permanently delete submitted messages.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {filteredMessages.length} total
              </span>
            </div>

            <FilterBar>
              <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, message, or status" />
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Status
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ContactMessageStatus | "all")} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300">
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Statuses" : statusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <ActionButton onClick={loadData} disabled={loading || saving} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </ActionButton>
            </FilterBar>

            {loading ? (
              <LoadingState label="Loading contact messages..." />
            ) : (
              <DataTable
                columns={columns}
                rows={filteredMessages}
                rowKey={(row) => row.id}
                emptyState={<EmptyState title="No messages found" description="Submitted contact form messages will appear here for review." />}
              />
            )}
          </div>
        </GlassCard>
      </div>

      <ConfirmationDialog
        open={pendingDeleteId !== null}
        title={`Delete message from ${pendingDeleteName}?`}
        description="This permanently removes the message from the database. Archived messages can be kept instead if they may be needed later."
        confirmLabel="Delete"
        onConfirm={() => void deleteMessage()}
        onCancel={() => {
          setPendingDeleteId(null);
          setPendingDeleteName("");
        }}
      />
    </>
  );
}
