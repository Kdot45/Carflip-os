"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { ObdReading } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function ObdSection({
  projectId,
  readings,
  onChanged,
}: {
  projectId: string;
  readings: ObdReading[];
  onChanged: (readings: ObdReading[]) => void;
}) {
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function addReading(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSaving(true);
    try {
      const { obdReading } = await api.post<{ obdReading: ObdReading }>(`/projects/${projectId}/obd`, {
        rawCodesText: text,
      });
      onChanged([obdReading, ...readings]);
      setText("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="OBD-II codes" subtitle="Paste codes from a scan, one entry per reading." />
      {readings.length > 0 && (
        <div className="mb-3 space-y-2">
          {readings.map((r) => (
            <div key={r.id} className="rounded-lg bg-slate-50 p-2.5 text-sm">
              <p className="font-mono text-slate-800">{r.rawCodesText}</p>
              <p className="mt-0.5 text-xs text-slate-400">{formatDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={addReading} className="flex flex-col gap-2 sm:flex-row">
        <Textarea
          rows={2}
          placeholder="e.g. P0420, P0171"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Saving…" : "Add"}
        </Button>
      </form>
    </Card>
  );
}
