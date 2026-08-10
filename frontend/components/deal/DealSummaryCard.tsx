"use client";

import { useState } from "react";
import { Project, ProjectStatus, TitleStatus } from "@/lib/types";
import { formatCurrency, formatMiles } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { api } from "@/lib/api";

const STATUSES: ProjectStatus[] = ["lead", "bought", "repairing", "listed", "sold", "abandoned"];
const TITLE_STATUSES: TitleStatus[] = ["clean", "salvage", "rebuilt", "other"];

export function DealSummaryCard({
  project,
  onUpdated,
}: {
  project: Project;
  onUpdated: (project: Project) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    askingPrice: String(project.askingPrice),
    purchasePrice: project.purchasePrice !== null ? String(project.purchasePrice) : "",
    miles: String(project.miles),
    titleStatus: project.titleStatus,
    zipForDeal: project.zipForDeal,
  });
  const [isSaving, setIsSaving] = useState(false);

  async function saveStatus(status: ProjectStatus) {
    const { project: updated } = await api.patch<{ project: Project }>(`/projects/${project.id}`, { status });
    onUpdated(updated);
  }

  async function saveForm() {
    setIsSaving(true);
    try {
      const { project: updated } = await api.patch<{ project: Project }>(`/projects/${project.id}`, {
        askingPrice: Number(form.askingPrice),
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
        miles: Number(form.miles),
        titleStatus: form.titleStatus,
        zipForDeal: form.zipForDeal,
      });
      onUpdated(updated);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title={`${project.year} ${project.make} ${project.model}${project.trim ? ` ${project.trim}` : ""}`}
        subtitle={project.vin ?? undefined}
        action={
          <Select
            value={project.status}
            onChange={(e) => saveStatus(e.target.value as ProjectStatus)}
            className="w-auto py-1.5 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        }
      />

      {!isEditing ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Asking price" value={formatCurrency(project.askingPrice)} />
            <Stat label="Purchase price" value={project.purchasePrice ? formatCurrency(project.purchasePrice) : "—"} />
            <Stat label="Mileage" value={formatMiles(project.miles)} />
            <Stat label="Title" value={project.titleStatus[0].toUpperCase() + project.titleStatus.slice(1)} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">Location: {project.zipForDeal}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-accent-600 hover:text-accent-700"
            >
              Edit
            </button>
          </div>
          {project.listingUrl && (
            <a
              href={project.listingUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block truncate text-sm text-accent-600 hover:underline"
            >
              {project.listingUrl}
            </a>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="askingPrice">Asking price</Label>
              <Input
                id="askingPrice"
                type="number"
                value={form.askingPrice}
                onChange={(e) => setForm({ ...form, askingPrice: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="purchasePrice">Purchase price</Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="Not bought yet"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="miles">Mileage</Label>
              <Input
                id="miles"
                type="number"
                value={form.miles}
                onChange={(e) => setForm({ ...form, miles: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="titleStatus">Title status</Label>
              <Select
                id="titleStatus"
                value={form.titleStatus}
                onChange={(e) => setForm({ ...form, titleStatus: e.target.value as TitleStatus })}
              >
                {TITLE_STATUSES.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="zipForDeal">ZIP</Label>
            <Input
              id="zipForDeal"
              value={form.zipForDeal}
              onChange={(e) => setForm({ ...form, zipForDeal: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={saveForm} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
