"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Edit3, RefreshCw, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { adminJsonRequest } from "@/lib/admin-api";
import { ConfirmationDialog } from "./confirmation-dialog";
import { ActionButton, GlassCard } from "@/components/ui/primitives";
import type { TeamCatalogItem, TeamCatalogResponse } from "@/types/team";

type CatalogManagerProps = {
  endpoint: "/roles" | "/departments";
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

type CatalogFormState = {
  name: string;
  description: string;
  displayOrder: string;
  isActive: boolean;
};

const emptyForm: CatalogFormState = {
  name: "",
  description: "",
  displayOrder: "0",
  isActive: true,
};

export function CatalogManager({ endpoint, title, description, emptyTitle, emptyDescription }: CatalogManagerProps) {
  const [items, setItems] = useState<TeamCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<CatalogFormState>(emptyForm);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState("");

  const loadItems = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await adminJsonRequest<TeamCatalogResponse>(`${endpoint}/manage`);
      setItems(payload.data);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : `Failed to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingItemId(null);
  };

  const handleEdit = (item: TeamCatalogItem) => {
    setEditingItemId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      displayOrder: String(item.displayOrder),
      isActive: item.isActive,
    });
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(`${title.slice(0, -1)} name is required.`);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        displayOrder: Number(form.displayOrder),
        isActive: form.isActive,
      };

      if (editingItemId) {
        await adminJsonRequest(`${endpoint}/${editingItemId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess(`${title.slice(0, -1)} updated successfully.`);
      } else {
        await adminJsonRequest(`${endpoint}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess(`${title.slice(0, -1)} created successfully.`);
      }

      resetForm();
      await loadItems();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : `Failed to save ${title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: TeamCatalogItem) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adminJsonRequest(`${endpoint}/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: item.name,
          description: item.description ?? "",
          displayOrder: item.displayOrder,
          isActive: !item.isActive,
        }),
      });

      setSuccess(`${item.name} ${item.isActive ? "disabled" : "enabled"}.`);
      await loadItems();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : `Failed to update ${title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item: TeamCatalogItem) => {
    setPendingDeleteId(item.id);
    setPendingDeleteName(item.name);
    setError("");
    setSuccess("");
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) {
      return;
    }

    setSaving(true);

    try {
      await adminJsonRequest(`${endpoint}/${pendingDeleteId}`, { method: "DELETE" });
      setSuccess(`${pendingDeleteName} deleted successfully.`);
      setPendingDeleteId(null);
      setPendingDeleteName("");
      if (editingItemId === pendingDeleteId) {
        resetForm();
      }
      await loadItems();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : `Failed to delete ${title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <GlassCard>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">{editingItemId ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-900">
                  Name *
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                    placeholder={`${title.slice(0, -1)} name`}
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

              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  placeholder="Optional description"
                />
              </label>

              <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-900">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-400"
                />
                Active
              </label>

              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={loadItems} disabled={loading || saving} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </ActionButton>
                <ActionButton onClick={resetForm} disabled={saving} className="bg-white text-slate-900 hover:bg-slate-100">
                  Reset
                </ActionButton>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Edit3 className="h-4 w-4" />
                  {saving ? "Saving..." : editingItemId ? "Update" : "Create"}
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
                <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
                <p className="text-sm text-slate-600">{emptyDescription}</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {items.length} total
              </span>
            </div>

            {loading ? (
              <p className="text-sm text-slate-600">Loading {title.toLowerCase()}...</p>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
                <h4 className="text-lg font-semibold text-slate-950">{emptyTitle}</h4>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{emptyDescription}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-950">{item.name}</h4>
                        {item.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p> : null}
                      </div>
                      <span className={item.isActive ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Order {item.displayOrder}</span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Created {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <ActionButton onClick={() => handleEdit(item)} className="gap-2 bg-white text-slate-900 hover:bg-slate-100">
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </ActionButton>
                      <ActionButton onClick={() => handleToggleActive(item)} className="gap-2 bg-cyan-700 hover:bg-cyan-800">
                        {item.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {item.isActive ? "Disable" : "Enable"}
                      </ActionButton>
                      <ActionButton onClick={() => confirmDelete(item)} className="gap-2 bg-rose-600 hover:bg-rose-700">
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
        description={`This will permanently remove the ${title.slice(0, -1).toLowerCase()} from the system.`}
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
