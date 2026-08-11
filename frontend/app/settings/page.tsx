"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/nav/AuthGuard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, FieldError } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { User, UserRole } from "@/lib/types";

function SettingsContent() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState(() => ({
    name: user?.name ?? "",
    homeZip: user?.homeZip ?? "",
    role: (user?.role ?? "flipper") as UserRole,
    defaultLaborRateMechanical: String(user?.defaultLaborRateMechanical ?? 75),
    defaultLaborRateBody: String(user?.defaultLaborRateBody ?? 65),
    defaultContingencyPct: String(user?.defaultContingencyPct ?? 15),
    defaultMarginPct: String(user?.defaultMarginPct ?? 20),
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await api.patch<{ user: User }>("/auth/me", {
        name: form.name,
        homeZip: form.homeZip,
        role: form.role,
        defaultLaborRateMechanical: Number(form.defaultLaborRateMechanical),
        defaultLaborRateBody: Number(form.defaultLaborRateBody),
        defaultContingencyPct: Number(form.defaultContingencyPct),
        defaultMarginPct: Number(form.defaultMarginPct),
      });
      await refreshUser();
      setSaved(true);
    } catch {
      setError("Couldn't save your settings. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 text-xl font-semibold text-ink-50">Settings</h1>

      <Card>
        <CardHeader title="Profile" />
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="homeZip">Home ZIP</Label>
              <Input id="homeZip" value={form.homeZip} onChange={(e) => update("homeZip", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" value={form.role} onChange={(e) => update("role", e.target.value as UserRole)}>
                <option value="flipper">Flipper</option>
                <option value="dealer">Dealer</option>
              </Select>
            </div>
          </div>

          <div className="border-t border-ink-700 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-ink-100">Defaults for new deals</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="laborMech">Mechanical labor rate ($/hr)</Label>
                <Input
                  id="laborMech"
                  type="number"
                  value={form.defaultLaborRateMechanical}
                  onChange={(e) => update("defaultLaborRateMechanical", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="laborBody">Body labor rate ($/hr)</Label>
                <Input
                  id="laborBody"
                  type="number"
                  value={form.defaultLaborRateBody}
                  onChange={(e) => update("defaultLaborRateBody", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contingency">Contingency %</Label>
                <Input
                  id="contingency"
                  type="number"
                  value={form.defaultContingencyPct}
                  onChange={(e) => update("defaultContingencyPct", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="margin">Target margin %</Label>
                <Input
                  id="margin"
                  type="number"
                  value={form.defaultMarginPct}
                  onChange={(e) => update("defaultMarginPct", e.target.value)}
                />
              </div>
            </div>
          </div>

          <FieldError>{error}</FieldError>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save settings"}
            </Button>
            {saved && <span className="text-sm text-good">Saved</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
